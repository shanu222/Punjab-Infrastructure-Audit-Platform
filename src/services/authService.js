import { API_PATHS } from "@/config/api";
import { apiRequest } from "@/utils/api";

export async function login({ email, password, role }) {
  return apiRequest(API_PATHS.authLogin, {
    method: "POST",
    json: { email, password, role },
  });
}

export async function hintRole(email) {
  return apiRequest(API_PATHS.authHintRole, {
    method: "POST",
    json: { email },
    skipNetworkToast: true,
  });
}

export function collectDeviceInfo() {
  if (typeof window === "undefined") return {};
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
  };
}

export async function postClientLoginLog({ role, client_timestamp, device_info }) {
  return apiRequest(API_PATHS.logsLogin, {
    method: "POST",
    json: { role, client_timestamp, device_info },
    skipNetworkToast: true,
  });
}
