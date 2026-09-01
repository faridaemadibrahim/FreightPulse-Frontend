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

  // Connect WebSocket for real-time notifications.
  // Must be the UUID that owns NEXT_PUBLIC_API_KEY — the backend rejects
  // non-UUID user ids with a 403 during WebSocket auth.
  useWebSocketAlerts(process.env.NEXT_PUBLIC_USER_ID || "");

  return <>{children}</>;
}
