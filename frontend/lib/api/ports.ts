import { apiClient } from "./client";
import { Port, PortCongestionLevel } from "@/lib/types";

// Static fallback coordinates for ports missing lat/lng from the API
// (still needed — Alexandria/Sokhna were returning null lat/lng)
const FALLBACK_COORDS: Record<string, { latitude: number; longitude: number }> =
  {
    EGALY: { latitude: 31.2001, longitude: 29.9187 }, // Alexandria
    EGSKH: { latitude: 29.6011, longitude: 32.3428 }, // Sokhna
  };

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
  const res = await apiClient.get("/ports/congestion-map");
  const apiPorts = res.data.ports;
  return apiPorts.map(mapApiPortToPort);
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
  const res = await apiClient.get(`/ports/${code}/congestion`);
  return mapApiPortDetail(res.data);
}
