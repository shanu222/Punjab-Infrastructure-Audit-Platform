import { getApiBaseUrl } from "@/utils/api";

/**
 * Path-only segments for {@link apiRequest} (must start with `/api/...`).
 * Canonical backend routes live under `/api/auth`, `/api/users`, etc.
 */
export const API_PATHS = {
  authLogin: "/api/auth/login",
  authRegister: "/api/auth/register",
  authHintRole: "/api/auth/hint-role",
  logsLogin: "/api/logs/login",
  health: "/api/health",
} as const;

function joinBase(path: string): string {
  const base = getApiBaseUrl().replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

/**
 * Absolute URLs for raw `fetch` (FormData, blobs) where `apiRequest` is not used.
 * Uses the same base resolution as {@link getApiBaseUrl} (Vite env + build define).
 */
export const API = {
  get login() {
    return joinBase(API_PATHS.authLogin);
  },
  get health() {
    return joinBase(API_PATHS.health);
  },
  get upload() {
    return joinBase("/api/upload");
  },
  get futureAnalysisReportPdf() {
    return joinBase("/api/future-analysis/report-pdf");
  },
} as const;
