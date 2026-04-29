import { apiRequest } from "../utils/api.js";

export async function fetchAiInsights() {
  return apiRequest("/api/ai/insights");
}
