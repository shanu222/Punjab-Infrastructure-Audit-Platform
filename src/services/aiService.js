import { apiRequest } from "@/utils/api";

export async function fetchAiInsights() {
  return apiRequest("/api/ai/insights");
}
