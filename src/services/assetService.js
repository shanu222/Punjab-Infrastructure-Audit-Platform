import { apiRequest } from "@/utils/api";

export async function fetchAssetById(id) {
  return apiRequest(`/api/assets/${encodeURIComponent(id)}`);
}

export async function fetchAuditsForAsset(assetId) {
  return apiRequest(`/api/audits/${encodeURIComponent(assetId)}`);
}

export async function fetchAssetAiInsights(assetId) {
  return apiRequest(`/api/ai/asset/${encodeURIComponent(assetId)}`);
}

/**
 * @param {string} id
 * @param {{ is_flagged_critical: boolean }} body
 */
export async function patchAssetFlags(id, body) {
  return apiRequest(`/api/assets/${encodeURIComponent(id)}`, {
    method: "PATCH",
    json: body,
  });
}
