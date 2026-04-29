import { apiRequest } from "@/utils/api";

export async function fetchDashboardStats() {
  return apiRequest("/api/dashboard/stats");
}

export async function fetchMapAssets() {
  return apiRequest("/api/map/assets");
}

export async function fetchAiInsights() {
  return apiRequest("/api/ai/insights");
}
