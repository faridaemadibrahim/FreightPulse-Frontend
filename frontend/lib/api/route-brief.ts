import { apiClient, isMockMode } from "./client";

export interface RouteBriefRequest {
  origin: string;
  destination: string;
  cargo_type: "TEU" | "FEU";
}

export interface RouteBriefStatusResponse {
  brief_id: string;
  status: "pending" | "processing" | "completed" | "failed";
}

export interface RouteBriefDetailResponse {
  brief_id: string;
  status: "completed" | "failed";
  recommendation: "ship_now" | "wait" | "reroute";
  risk_level: "low" | "medium" | "high";
  brief_markdown: string;
}

// In-memory simulation state for Mock Mode
const simulatedBriefs: Record<string, {
  request: RouteBriefRequest;
  ticks: number;
  maxTicks: number;
}> = {};

export async function requestRouteBrief(req: RouteBriefRequest): Promise<RouteBriefStatusResponse> {
  if (isMockMode()) {
    const briefId = "mock_" + Math.random().toString(36).substr(2, 9);
    // Simulate generation taking about 3 status checks (e.g. 6 seconds total)
    simulatedBriefs[briefId] = {
      request: req,
      ticks: 0,
      maxTicks: 3,
    };
    return { brief_id: briefId, status: "pending" };
  }

  const res = await apiClient.post("/route-brief", req);
  return res.data;
}

export async function getRouteBriefStatus(briefId: string): Promise<RouteBriefDetailResponse | RouteBriefStatusResponse> {
  if (isMockMode() && simulatedBriefs[briefId]) {
    const brief = simulatedBriefs[briefId];
    brief.ticks += 1;

    if (brief.ticks < brief.maxTicks) {
      return {
        brief_id: briefId,
        status: brief.ticks === 1 ? "pending" : "processing",
      };
    }

    // Finished processing - return mock brief document data
    const rec = brief.request.destination === "NLRTM" ? "reroute" : "ship_now";
    const risk = brief.request.destination === "NLRTM" ? "high" : "low";

    return {
      brief_id: briefId,
      status: "completed",
      recommendation: rec,
      risk_level: risk,
      brief_markdown: `# AI Route Brief: ${brief.request.origin} → ${brief.request.destination}

This route analysis combines real-time freight signals, carrier schedules, and port conditions to assist your shipping timeline decision.

## 📈 Rate Outlook
- **Current Spot Rate**: $3,420 / ${brief.request.cargo_type === "TEU" ? "20ft TEU" : "40ft FEU"}
- **7-Day Trend**: Stable (±1.5%)
- **Carrier Surcharges**: Peak Season Surcharges (PSS) are scheduled to take effect starting next week.

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

  const res = await apiClient.get(`/route-brief/${briefId}`);
  return res.data;
}
