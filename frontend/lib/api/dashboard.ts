import { apiClient, isMockMode } from "./client";
import { DashboardData } from "@/lib/types";
import dashboardMock from "@/mocks/dashboard.json";

export async function getDashboard(): Promise<DashboardData> {
  if (isMockMode()) {
    return dashboardMock as DashboardData;
  }

  try {
    const response = await apiClient.get("/dashboard");
    console.log("[FreightPulse] Fetched live /dashboard:", response.data);
    return response.data;
  } catch (error: unknown) {
    const err = error as {
      response?: { status: number; statusText: string };
      message?: string;
    };
    console.error(
      "[FreightPulse Error] Failed to fetch live /dashboard:",
      err?.response
        ? `${err.response.status} ${err.response.statusText}`
        : err?.message,
    );
    // Fallback: safe empty shape so the UI doesn't crash
    return {
      tracked_lanes_count: 0,
      lanes_summary: [],
      port_congestion_overview: [],
      recent_advisories: [],
      unread_alert_count: 0,
    };
  }
}
