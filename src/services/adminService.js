import { apiRequest } from "../utils/api.js";
import { getToken } from "../utils/authStorage.js";

/** @param {Record<string, string | number | undefined>} params */
function toQuery(params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    sp.set(k, String(v));
  });
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export async function fetchAdminSummary() {
  const res = await apiRequest("/api/admin/summary");
  return res.data;
}

/**
 * @param {Record<string, string | number | undefined>} [params]
 */
export async function fetchUsers(params) {
  const res = await apiRequest(`/api/users${toQuery(params || {})}`);
  return res.data;
}

/**
 * @param {{ name: string, email: string, password: string, role: string, department?: string, is_active?: boolean }} body
 */
export async function createUser(body) {
  const res = await apiRequest("/api/users", { method: "POST", json: body });
  return res.data;
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} body
 */
export async function updateUser(id, body) {
  const res = await apiRequest(`/api/users/${encodeURIComponent(id)}`, { method: "PUT", json: body });
  return res.data;
}

/** @param {string} id */
export async function deleteUser(id) {
  const res = await apiRequest(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE" });
  return res.data;
}

export async function fetchAssetList() {
  const res = await apiRequest("/api/assets");
  return res.data;
}

/**
 * @param {Record<string, unknown>} body
 */
export async function createAsset(body) {
  const res = await apiRequest("/api/assets", { method: "POST", json: body });
  return res.data;
}

/**
 * @param {string} id
 * @param {Record<string, unknown>} body
 */
export async function updateAsset(id, body) {
  const res = await apiRequest(`/api/assets/${encodeURIComponent(id)}`, { method: "PUT", json: body });
  return res.data;
}

/** @param {string} id */
export async function deleteAsset(id) {
  const res = await apiRequest(`/api/assets/${encodeURIComponent(id)}`, { method: "DELETE" });
  return res.data;
}

/**
 * @param {Record<string, string | number | undefined>} [params]
 */
export async function fetchAudits(params) {
  const res = await apiRequest(`/api/audits${toQuery(params || {})}`);
  return res.data;
}

/** @param {string} auditId */
export async function fetchAuditDetail(auditId) {
  const res = await apiRequest(`/api/audits/detail/${encodeURIComponent(auditId)}`);
  return res.data;
}

/**
 * @param {string} auditId
 * @param {{ admin_status: 'pending' | 'approved' | 'flagged' }} body
 */
export async function updateAuditAdminStatus(auditId, body) {
  const res = await apiRequest(`/api/audits/${encodeURIComponent(auditId)}`, { method: "PUT", json: body });
  return res.data;
}

/**
 * @param {Record<string, string | number | undefined>} [params]
 */
export async function fetchLogs(params) {
  const res = await apiRequest(`/api/logs${toQuery(params || {})}`);
  return res.data;
}

/**
 * Upload standards PDF to S3 (folder reports).
 * @param {File} file
 */
export async function uploadStandardsDocument(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", "reports");
  const base = import.meta.env.VITE_API_BASE_URL || "";
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${base}/api/upload`, { method: "POST", body: fd, headers });
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
    const message = data?.error?.message || data?.message || `Upload failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data.data;
}
