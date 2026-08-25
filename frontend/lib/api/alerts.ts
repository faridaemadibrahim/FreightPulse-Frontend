import { apiClient, isMockMode } from "./client";
import { Alert, AlertType, AlertSeverity } from "@/lib/types";
import alertsMock from "@/mocks/alerts.json";

// Raw shape returned by the backend
interface ApiAlert {
  id: string;
  trade_lane: string;
  alert_type: string; // "rate_spike" | "rate_drop" | "port_congestion" | "carrier_advisory"
  message: string;
  magnitude_pct?: number;
  is_read: boolean;
  created_at: string;
}

const TITLE_MAP: Record<string, string> = {
  rate_spike: "Rate spike detected",
  rate_drop: "Rate drop detected",
  port_congestion: "Port congestion alert",
  carrier_advisory: "Carrier advisory",
};

function mapApiAlertToAlert(apiAlert: ApiAlert): Alert {
  return {
    id: apiAlert.id,
    type: (apiAlert.alert_type as AlertType) || "rate_spike",
    severity: "info" as AlertSeverity, // مش راجعة من الـ API، بنحط قيمة افتراضية
    is_new: false, // مش راجعة من الـ API
    is_read: apiAlert.is_read,
    title: TITLE_MAP[apiAlert.alert_type] || apiAlert.alert_type,
    message: apiAlert.message,
    location_label: apiAlert.trade_lane,
    magnitude_pct: apiAlert.magnitude_pct,
    created_at: apiAlert.created_at,
  };
}

export async function getAlerts(): Promise<Alert[]> {
  if (isMockMode()) {
    return alertsMock as Alert[];
  }

  try {
    const response = await apiClient.get("/alerts");
    const data = response.data;
    const apiAlerts: ApiAlert[] = Array.isArray(data)
      ? data
      : data.alerts || [];
    return apiAlerts.map(mapApiAlertToAlert);
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
export async function markAlertAsRead(alertId: string): Promise<void> {
  if (isMockMode()) {
    return;
  }

  try {
    await apiClient.patch(`/alerts/${alertId}/read`);
  } catch (error: unknown) {
    const err = error as {
      response?: { status: number; statusText: string };
      message?: string;
    };
    console.error(
      `[FreightPulse Error] Failed to mark alert ${alertId} as read:`,
      err?.response
        ? `${err.response.status} ${err.response.statusText}`
        : err?.message,
    );
  }
}
