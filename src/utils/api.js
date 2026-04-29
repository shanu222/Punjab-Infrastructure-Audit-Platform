import { getToken } from "./authStorage.js";

/**
 * @param {string} path - e.g. /api/auth/login
 * @param {RequestInit & { json?: unknown }} options
 */
export async function apiRequest(path, options = {}) {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const url = `${base}${path}`;

  const headers = new Headers(options.headers || {});
  if (options.json !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body: options.json !== undefined ? JSON.stringify(options.json) : options.body,
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}
