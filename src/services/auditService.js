import { API } from "@/config/api";
import { apiRequest } from "@/utils/api";
import { getToken } from "../utils/authStorage.js";

export async function fetchAssetsList() {
  return apiRequest("/api/assets");
}

/**
 * Upload one file to S3 via API. Returns full JSON body (includes data.key).
 * @param {File} file
 */
export async function uploadMediaFile(file) {
  const url = API.upload;
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const folder = file.type.startsWith("video/") ? "videos" : "images";
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);

  const res = await fetch(url, { method: "POST", headers, body: fd });
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
      data?.error?.message || data?.message || `Upload failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}

/**
 * @param {object} body - createAuditSchema payload (JSON)
 */
export async function createAuditRequest(body) {
  return apiRequest("/api/audits", {
    method: "POST",
    json: body,
  });
}
