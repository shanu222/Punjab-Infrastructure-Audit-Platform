import { toast } from "sonner";
import { getToken } from "./authStorage.js";

/**
 * Production API origin (no trailing slash).
 * Set in Vercel: **VITE_API_BASE_URL** = `https://your-ec2-or-alb-host:5000` (HTTPS required when the site is served over HTTPS).
 * Leave empty in local dev to use relative `/api` + Vite proxy (see `vite.config.ts`).
 */
export function getApiBaseUrl(): string {
  const raw =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    (import.meta.env.VITE_API_URL as string | undefined) ||
    (import.meta.env.NEXT_PUBLIC_API_URL as string | undefined) ||
    "";
  return String(raw).trim().replace(/\/$/, "");
}

export type ApiRequestOptions = RequestInit & {
  json?: unknown;
  /** If true, do not show the global "Server not reachable" toast (caller handles UI). */
  skipNetworkToast?: boolean;
};

export type ApiError = Error & {
  status?: number;
  body?: unknown;
  /** Set when fetch failed (offline, DNS, CORS, mixed content, etc.) */
  isNetworkError?: boolean;
};

/**
 * JSON `fetch` helper. Paths must start with `/api/...`.
 */
export async function apiRequest(path: string, options: ApiRequestOptions = {}): Promise<unknown> {
  const { json, skipNetworkToast, ...rest } = options;
  const base = getApiBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${normalized}`;

  const headers = new Headers(rest.headers || {});
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(url, {
      ...rest,
      headers,
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch (e: unknown) {
    if (e instanceof Error && e.name === "AbortError") {
      throw e;
    }
    if (!skipNetworkToast) {
      toast.error("Server not reachable", {
        description:
          "Check your connection and that VITE_API_BASE_URL points to your API (use HTTPS when the app is on HTTPS).",
      });
    }
    const err = new Error(e instanceof Error ? e.message : "Network error") as ApiError;
    err.isNetworkError = true;
    throw err;
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    const body = data as { error?: { message?: string }; message?: string } | null;
    const message =
      body?.error?.message ||
      body?.message ||
      `Request failed (${res.status})`;
    const err = new Error(message) as ApiError;
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}
