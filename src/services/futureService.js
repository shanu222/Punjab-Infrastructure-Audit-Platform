import { apiRequest } from "@/utils/api";
import { getToken } from "../utils/authStorage.js";

/**
 * @param {{
 *   project_name: string,
 *   type: string,
 *   location: { lat: number, lng: number },
 *   district: string,
 *   material: string,
 *   structural_type: string,
 * }} payload
 */
export async function submitFutureAnalysis(payload) {
  const res = await apiRequest("/api/future-analysis", {
    method: "POST",
    json: payload,
  });
  return res.data;
}

/**
 * @param {object} payload — same shape as POST /api/future-analysis body
 * @returns {Promise<Blob>}
 */
export async function fetchFutureAnalysisPdfBlob(payload) {
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const token = getToken();
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${base}/api/future-analysis/report-pdf`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = `PDF request failed (${res.status})`;
    try {
      const j = JSON.parse(text);
      msg = j?.error?.message || j?.message || msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.blob();
}
