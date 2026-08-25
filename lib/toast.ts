import { toast } from "sonner";
import { Alert } from "@/lib/types";

export function showAlertToast(alert: Alert) {
  const emoji =
    alert.type === "rate_spike"
      ? "📈"
      : alert.type === "rate_drop"
        ? "📉"
        : alert.type === "port_congestion"
          ? "⚓"
          : "🚢";

  toast(`${emoji} ${alert.title}`, {
    description: alert.message,
    duration: 6000,
  });
}
