"use client";

import { ReactNode, useEffect } from "react";
import { useWebSocketAlerts } from "@/hooks/useWebSocketAlerts";
import { useAlertStore } from "@/stores/alertStore";

export function AlertsProvider({ children }: { children: ReactNode }) {
  const fetchAlerts = useAlertStore((s) => s.fetchAlerts);

  // Load initial alerts from REST API
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // Connect WebSocket for real-time notifications (dev mode dummy user ID)
  useWebSocketAlerts("developer-user");

  return <>{children}</>;
}
