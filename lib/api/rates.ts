import { apiClient, isMockMode } from "./client";
import { LaneSummary, RateLaneDetail, RateCompareData } from "@/lib/types";
import ratesAllMock from "@/mocks/rates-all.json";

/**
 * GET /api/v1/rates/all
 * Returns the latest rate for each trade lane/container type.
 * Used to populate the overview list of all rates.
 */
export async function getRatesAll(): Promise<LaneSummary[]> {
  if (isMockMode()) {
    return ratesAllMock.lanes as unknown as LaneSummary[];
  }

  try {
    const response = await apiClient.get("/rates/all");
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    return data.lanes || data.rates || data.data || [];
  } catch (error: any) {
    console.error(
      "[FreightPulse Error] Failed to fetch /rates/all from backend:",
      error?.response
        ? `${error.response.status} ${error.response.statusText}`
        : error?.message,
    );
    return [];
  }
}

/**
 * GET /api/v1/rates/{lane}
 * Path param: lane (example: USA-CHINA)
 * Query param: container_type (optional, default 40ft)
 * Returns a 30-day history and trend info for that lane.
 */
export async function getRateLane(
  lane: string,
  containerType: string = "40ft",
): Promise<RateLaneDetail> {
  const encoded = encodeURIComponent(lane);
  try {
    const response = await apiClient.get(`/rates/${encoded}`, {
      params: { container_type: containerType },
    });
    return response.data;
  } catch (error: any) {
    console.warn(
      `[FreightPulse Warning] Failed to fetch rate lane details for ${lane} (${containerType}):`,
      error?.response
        ? `${error.response.status} ${error.response.statusText}`
        : error?.message,
    );
    return {
      trade_lane: lane,
      container_type: containerType,
      current_rate_usd: 0,
      trend: "stable",
      source: "",
      history: [],
    };
  }
}

/**
 * GET /api/v1/rates/compare
 * Query params: trade_lane (required), container_type (optional, default 40ft; only 20ft|40ft)
 * Returns current rate vs averages for 7, 30, and 90 days.
 */
export async function getRateCompare(
  lane: string,
  containerType: string = "40ft",
): Promise<RateCompareData | null> {
  try {
    const response = await apiClient.get("/rates/compare", {
      params: { trade_lane: lane, container_type: containerType },
    });
    return response.data;
  } catch (error: any) {
    console.warn(
      `[FreightPulse Warning] Failed to fetch rate compare for ${lane} (${containerType}):`,
      error?.response
        ? `${error.response.status} ${error.response.statusText}`
        : error?.message,
    );
    return null;
  }
}

// Backward compatibility helpers
export async function getAllRates(): Promise<LaneSummary[]> {
  return getRatesAll();
}

export async function getRates(): Promise<LaneSummary[]> {
  return getRatesAll();
}
