import { apiClient, isMockMode } from "./client";
import { CarrierAdvisory, CarrierInfo } from "@/lib/types";
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

export async function getCarriers(): Promise<CarrierInfo[]> {
  if (isMockMode()) {
    // Derive a simple mock list from the existing carrier advisories mock
    const names = [
      ...new Set(
        (carriersAdvisoriesMock as CarrierAdvisory[]).map((a) => a.carrier),
      ),
    ];
    return names.map((name) => ({
      name,
      code: name.toUpperCase().replace(/\s+/g, ""),
      full_name: name,
      advisories_count: 0,
    }));
  }

  try {
    const response = await apiClient.get("/carriers");
    return response.data.carriers || [];
  } catch (error: any) {
    console.error(
      "[FreightPulse Error] Failed to fetch /carriers:",
      error?.response
        ? `${error.response.status} ${error.response.statusText}`
        : error?.message,
    );
    return [];
  }
}
