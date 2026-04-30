import { toast } from "sonner";
import { getToken } from "./authStorage.js";

let warnedInsecure = false;
let warnedMissingBase = false;

/**
 * API origin with **no** trailing slash.
 *
 * **Vite / Vercel:** set `VITE_API_BASE_URL` (preferred) or `NEXT_PUBLIC_API_URL` to your **HTTPS** API
 * (e.g. `https://api.example.com`). Do not mark as Sensitive. Redeploy after changing.
 *
 * Local dev: leave unset → relative `/api` + Vite proxy.
 */
export function getApiBaseUrl(): string {
  const baked = String(typeof __PIAP_API_BASE__ !== "undefined" ? __PIAP_API_BASE__ : "").trim();
  const fromMeta =
    String(import.meta.env.VITE_API_BASE_URL || "").trim() ||
    String(import.meta.env.NEXT_PUBLIC_API_URL || "").trim() ||
    String(import.meta.env.VITE_API_URL || "").trim();
  const raw = baked || fromMeta;
  return raw.replace(/\/$/, "");
}

export type ApiRequestOptions = RequestInit & {
  json?: unknown;
  /** If true, do not show the global "Server not reachable" toast (caller handles UI). */
  skipNetworkToast?: boolean;
};

export type ApiError = Error & {
  status?: number;
  body?: unknown;
  isNetworkError?: boolean;
};

function warnIfInsecureApi(base: string) {
  if (typeof window === "undefined" || !base) return;
  if (window.location.protocol !== "https:") return;
  if (!base.startsWith("http:")) return;
  if (warnedInsecure) return;
  warnedInsecure = true;
  console.warn(
    "[PIAP] Using insecure API (HTTP) from an HTTPS page will be blocked by the browser. Enable HTTPS on your API host or use an HTTPS reverse proxy.",
  );
}

function warnIfMissingApiBase(base: string) {
  if (typeof window === "undefined" || base) return;
  if (!import.meta.env.PROD) return;
  if (warnedMissingBase) return;
  warnedMissingBase = true;
  console.warn(
    "[PIAP] No API base URL in bundle. Set VITE_API_BASE_URL (or NEXT_PUBLIC_API_URL) on Vercel, not Sensitive, then redeploy.",
  );
}

/**
 * JSON `fetch` helper. Paths must start with `/api/...`.
 */
export async function apiRequest(path: string, options: ApiRequestOptions = {}): Promise<unknown> {
  const { json, skipNetworkToast, ...rest } = options;
  const base = getApiBaseUrl();
  warnIfMissingApiBase(base);
  warnIfInsecureApi(base);

  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = `${base}${normalized}`;

  if (import.meta.env.DEV) {
    console.debug("[PIAP API]", url);
  }

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
    console.error("[PIAP API] fetch failed", { url, message: e instanceof Error ? e.message : String(e) });
    if (!skipNetworkToast) {
      toast.error("Server not reachable", {
        description:
          "Set VITE_API_BASE_URL (HTTPS) on Vercel, redeploy, allow CORS on EC2, and expose 443/80. HTTP API from HTTPS Vercel is blocked.",
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
