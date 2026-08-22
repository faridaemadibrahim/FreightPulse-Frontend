import { apiClient, isMockMode } from "./client";
import { Port, PortCongestionLevel } from "@/lib/types";

const FALLBACK_COORDS: Record<string, { latitude: number; longitude: number }> =
  {
    EGALY: { latitude: 31.2001, longitude: 29.9187 }, // Alexandria
    EGSKH: { latitude: 29.6011, longitude: 32.3428 }, // Sokhna
  };

const MOCK_PORTS: Port[] = [
  {
    id: "1",
    code: "CNSHA",
    name: "Shanghai",
    country: "China",
    latitude: 31.2304,
    longitude: 121.4737,
    congestion_level: "low",
    congestion_pct: 12,
    vessels_waiting: 5,
  },
  {
    id: "2",
    code: "NLRTM",
    name: "Rotterdam",
    country: "Netherlands",
    latitude: 51.9244,
    longitude: 4.4777,
    congestion_level: "medium",
    congestion_pct: 45,
    vessels_waiting: 15,
  },
  {
    id: "3",
    code: "EGALY",
    name: "Alexandria",
    country: "Egypt",
    latitude: 31.2001,
    longitude: 29.9187,
    congestion_level: "high",
    congestion_pct: 78,
    vessels_waiting: 28,
  },
  {
    id: "4",
    code: "EGSKH",
    name: "Sokhna",
    country: "Egypt",
    latitude: 29.6011,
    longitude: 32.3428,
    congestion_level: "normal",
    congestion_pct: 20,
    vessels_waiting: 8,
  },
  {
    id: "5",
    code: "AEJEA",
    name: "Jebel Ali",
    country: "UAE",
    latitude: 25.0112,
    longitude: 55.0617,
    congestion_level: "elevated",
    congestion_pct: 60,
    vessels_waiting: 19,
  },
];

function mapApiPortToPort(apiPort: {
  port_code: string;
  port_id: string;
  port_name: string;
  latitude: number | null;
  longitude: number | null;
  congestion_index: number;
  severity: string;
  vessels_waiting: number;
  country: string;
}): Port {
  const fallback = FALLBACK_COORDS[apiPort.port_code];

  return {
    id: apiPort.port_id,
    code: apiPort.port_code,
    name: apiPort.port_name,
    country: apiPort.country,
    latitude: apiPort.latitude ?? fallback?.latitude ?? 0,
    longitude: apiPort.longitude ?? fallback?.longitude ?? 0,
    congestion_level: apiPort.severity as PortCongestionLevel,
    congestion_pct: apiPort.congestion_index,
    vessels_waiting: apiPort.vessels_waiting,
  };
}

export async function getPorts(): Promise<Port[]> {
  if (isMockMode()) {
    return MOCK_PORTS;
  }

  try {
    const res = await apiClient.get("/ports/congestion-map");
    const apiPorts = res.data.ports;
    return apiPorts.map(mapApiPortToPort);
  } catch (error: any) {
    console.error(
      "[FreightPulse Error] Failed to fetch /ports/congestion-map:",
      error?.response
        ? `${error.response.status} ${error.response.statusText}`
        : error?.message,
    );
    return [];
  }
}

// Raw shape returned by /ports/{code}/congestion
interface ApiPortDetail {
  port_code: string;
  port_name: string;
  congestion_index: number;
  avg_dwell_days: number;
  vessels_waiting: number;
  severity: string;
  advisory_text: string;
  measured_at: string;
}

export interface PortDetail {
  congestion_pct: number;
  avg_dwell_days: number;
  vessels_waiting: number;
  congestion_level: PortCongestionLevel;
  advisory_text: string;
  measured_at: string;
}

function mapApiPortDetail(apiDetail: ApiPortDetail): PortDetail {
  return {
    congestion_pct: apiDetail.congestion_index,
    avg_dwell_days: apiDetail.avg_dwell_days,
    vessels_waiting: apiDetail.vessels_waiting,
    congestion_level: apiDetail.severity as PortCongestionLevel,
    advisory_text: apiDetail.advisory_text,
    measured_at: apiDetail.measured_at,
  };
}

export async function getPortDetail(code: string): Promise<PortDetail> {
  try {
    const res = await apiClient.get(`/ports/${code}/congestion`);
    return mapApiPortDetail(res.data);
  } catch (error: any) {
    console.error(
      `[FreightPulse Error] Failed to fetch /ports/${code}/congestion:`,
      error?.response
        ? `${error.response.status} ${error.response.statusText}`
        : error?.message,
    );
    // Safe fallback so PortDetailModal doesn't crash — it already
    // falls back to the `port` prop values when detail is missing fields.
    return {
      congestion_pct: 0,
      avg_dwell_days: 0,
      vessels_waiting: 0,
      congestion_level: "normal",
      advisory_text: "",
      measured_at: new Date().toISOString(),
    };
  }
}
