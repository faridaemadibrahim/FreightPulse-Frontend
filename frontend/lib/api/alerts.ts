import { apiClient, isMockMode } from "./client";
import { Alert } from "@/lib/types";
import alertsMock from "@/mocks/alerts.json";

export async function getAlerts(): Promise<Alert[]> {
  if (isMockMode()) {
    return alertsMock as Alert[];
  }

  try {
    const response = await apiClient.get("/alerts");
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    return data.alerts || [];
  } catch (error: unknown) {
    const err = error as {
      response?: { status: number; statusText: string };
      message?: string;
    };
    console.error(
      "[FreightPulse Error] Failed to fetch live /alerts:",
      err?.response
        ? `${err.response.status} ${err.response.statusText}`
        : err?.message,
    );
    return [];
  }
}
