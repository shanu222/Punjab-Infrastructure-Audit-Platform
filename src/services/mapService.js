import { apiRequest } from "../utils/api.js";

/**
 * @param {Record<string, string | undefined>} params
 */
export function buildMapAssetsQueryString(params) {
  const q = new URLSearchParams();
  const type = params.type?.trim();
  const risk = params.risk?.trim();
  const district = params.district?.trim();
  if (type && type !== "all") q.set("type", type.toLowerCase());
  if (risk && risk !== "all") q.set("risk", risk.toUpperCase());
  if (district && district !== "all") q.set("district", district);
  const s = q.toString();
  return s ? `?${s}` : "";
}

/**
 * @param {{ type?: string; risk?: string; district?: string }} [params]
 */
export async function fetchMapAssets(params = {}) {
  const qs = buildMapAssetsQueryString(params);
  return apiRequest(`/api/map/assets${qs}`);
}

export async function fetchAiInsights() {
  return apiRequest("/api/ai/insights");
}
