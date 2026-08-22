import { apiClient, isMockMode } from "./client";
import { CarrierAdvisory } from "@/lib/types";
import carriersAdvisoriesMock from "@/mocks/carriers-advisories.json";

export async function getCarrierAdvisories(): Promise<CarrierAdvisory[]> {
  if (isMockMode()) {
    return carriersAdvisoriesMock as CarrierAdvisory[];
  }

  try {
    const response = await apiClient.get("/carriers/advisories");
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    return data.advisories || data.data || [];
  } catch (error: any) {
    console.error(
      "[FreightPulse Error] Failed to fetch live /carriers/advisories:",
      error?.response
        ? `${error.response.status} ${error.response.statusText}`
        : error?.message,
    );
    return [];
  }
}
