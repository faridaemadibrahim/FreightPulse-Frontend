import { apiClient, isMockMode } from "./client";

export interface RouteBriefRequest {
  origin: string;
  destination: string;
  carrier: string;
  cargo_type: "20ft" | "40ft";
}

// Full record returned by POST /route-briefs
export interface RouteBriefResponse {
  id: string;
  origin: string;
  destination: string;
  carrier: string;
  cargo_type: string;
  brief_markdown: string;
  recommendation: string;
  risk_level: string;
  pdf_available: boolean;
  status: string;
  error_message: string;
  created_at: string;
}

// Lightweight record returned by GET /route-briefs/{id}/status
export interface RouteBriefStatusResponse {
  id: string;
  brief_id: string;
  status: string;
  brief_markdown: string | null;
  recommendation: string | null;
  risk_level: string | null;
  error_message: string | null;
  created_at: string;
}

// In-memory simulation state for Mock Mode
const simulatedBriefs: Record<
  string,
  {
    request: RouteBriefRequest;
    ticks: number;
    maxTicks: number;
  }
> = {};

export async function requestRouteBrief(
  req: RouteBriefRequest,
): Promise<RouteBriefResponse> {
  if (isMockMode()) {
    const briefId = "mock_" + Math.random().toString(36).substr(2, 9);
    simulatedBriefs[briefId] = {
      request: req,
      ticks: 0,
      maxTicks: 3,
    };
    return {
      id: briefId,
      origin: req.origin,
      destination: req.destination,
      carrier: req.carrier,
      cargo_type: req.cargo_type,
      brief_markdown: "",
      recommendation: "",
      risk_level: "",
      pdf_available: false,
      status: "pending",
      error_message: "",
      created_at: new Date().toISOString(),
    };
  }

  const res = await apiClient.post("/route-briefs", req);
  return res.data;
}

export async function getRouteBriefStatus(
  briefId: string,
): Promise<RouteBriefResponse> {
  if (isMockMode() && simulatedBriefs[briefId]) {
    const brief = simulatedBriefs[briefId];
    brief.ticks += 1;

    if (brief.ticks < brief.maxTicks) {
      return {
        id: briefId,
        origin: brief.request.origin,
        destination: brief.request.destination,
        carrier: brief.request.carrier,
        cargo_type: brief.request.cargo_type,
        status: brief.ticks === 1 ? "pending" : "processing",
        brief_markdown: "",
        recommendation: "",
        risk_level: "",
        pdf_available: false,
        error_message: "",
        created_at: new Date().toISOString(),
      };
    }

    // Finished — return the full mock brief content
    const rec = brief.request.destination === "NLRTM" ? "reroute" : "ship_now";
    const risk = brief.request.destination === "NLRTM" ? "high" : "low";

    return {
      id: briefId,
      origin: brief.request.origin,
      destination: brief.request.destination,
      carrier: brief.request.carrier,
      cargo_type: brief.request.cargo_type,
      status: "completed",
      recommendation: rec,
      risk_level: risk,
      pdf_available: false,
      error_message: "",
      created_at: new Date().toISOString(),
      brief_markdown: `# AI Route Brief: ${brief.request.origin} → ${brief.request.destination}

This route analysis combines real-time freight signals, carrier schedules, and port conditions to assist your shipping timeline decision.

## 📈 Rate Outlook
- **Current Spot Rate**: $3,420 / ${brief.request.cargo_type}
- **7-Day Trend**: Stable (±1.5%)
- **Carrier (${brief.request.carrier}) Surcharges**: Peak Season Surcharges (PSS) are scheduled to take effect starting next week.

## 🛑 Port Conditions & Congestion
- **Origin Port (${brief.request.origin})**: Average dwell time is currently **2.1 days** with low vessel queuing.
- **Destination Port (${brief.request.destination})**: Vessels are experiencing an average wait time of **1.8 days**. Dwell times remain stable.

## ⚠️ Risk Assessment
- **Transit Delay Risk**: **${risk.toUpperCase()}**
- **Carrier Capacity**: High space utilization is noted on this trade lane. Booking 14 days in advance is highly recommended.

## 💡 Practical Recommendation
Based on current data models, we recommend that you **${rec.replace("_", " ").toUpperCase()}**.
${
  rec === "reroute"
    ? "Due to elevated transit delays on this direct lane, routing via alternative hubs is recommended to secure timely delivery."
    : "Spot rates are expected to rise next month; booking now secures the lowest current benchmark."
}
`,
    };
  }

  const res = await apiClient.get(`/route-briefs/${briefId}/status`);
  return res.data;
}

/**
 * Fetch the full brief record. GET /route-briefs/{id}/status only returns
 * { id, status } — the markdown, recommendation and risk_level live on
 * GET /route-briefs/{id}, so poll the former and fetch this once completed.
 */
export async function getRouteBrief(
  briefId: string,
): Promise<RouteBriefResponse> {
  if (isMockMode()) {
    const mock = getRouteBriefMock(briefId);
    if (mock) return mock;
  }

  const res = await apiClient.get(`/route-briefs/${briefId}`);
  return res.data;
}

// Mock-only helper: builds the full mock brief content once status
// reaches "completed". The live equivalent is getRouteBrief() above.
export function getRouteBriefMock(briefId: string): RouteBriefResponse | null {
  const brief = simulatedBriefs[briefId];
  if (!brief) return null;

  const rec = brief.request.destination === "NLRTM" ? "reroute" : "ship_now";
  const risk = brief.request.destination === "NLRTM" ? "high" : "low";

  return {
    id: briefId,
    origin: brief.request.origin,
    destination: brief.request.destination,
    carrier: brief.request.carrier,
    cargo_type: brief.request.cargo_type,
    status: "completed",
    recommendation: rec,
    risk_level: risk,
    pdf_available: false,
    error_message: "",
    created_at: new Date().toISOString(),
    brief_markdown: `# AI Route Brief: ${brief.request.origin} → ${brief.request.destination}

This route analysis combines real-time freight signals, carrier schedules, and port conditions to assist your shipping timeline decision.

## 📈 Rate Outlook
- **Current Spot Rate**: $3,420 / ${brief.request.cargo_type}
- **7-Day Trend**: Stable (±1.5%)
- **Carrier (${brief.request.carrier}) Surcharges**: Peak Season Surcharges (PSS) are scheduled to take effect starting next week.

## 🛑 Port Conditions & Congestion
- **Origin Port (${brief.request.origin})**: Average dwell time is currently **2.1 days** with low vessel queuing.
- **Destination Port (${brief.request.destination})**: Vessels are experiencing an average wait time of **1.8 days**. Dwell times remain stable.

## ⚠️ Risk Assessment
- **Transit Delay Risk**: **${risk.toUpperCase()}**
- **Carrier Capacity**: High space utilization is noted on this trade lane. Booking 14 days in advance is highly recommended.

## 💡 Practical Recommendation
Based on current data models, we recommend that you **${rec.replace("_", " ").toUpperCase()}**.
${
  rec === "reroute"
    ? "Due to elevated transit delays on this direct lane, routing via alternative hubs is recommended to secure timely delivery."
    : "Spot rates are expected to rise next month; booking now secures the lowest current benchmark."
}
`,
  };
}

// The PDF endpoint is authenticated, so a plain <a href> would be rejected —
// pull it through the API client and hand the browser a blob instead.
export async function downloadRouteBriefPdf(briefId: string): Promise<Blob> {
  const res = await apiClient.get(`/route-briefs/${briefId}/pdf`, {
    responseType: "blob",
  });
  return res.data as Blob;
}
