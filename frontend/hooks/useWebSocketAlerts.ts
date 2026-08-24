"use client";

import { useEffect, useRef } from "react";
import { useAlertStore } from "@/stores/alertStore";
import { showAlertToast } from "@/lib/toast";
import { Alert } from "@/lib/types";

const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1/ws/alerts";

const MAX_RECONNECT_DELAY = 30000; // 30 ثانية كحد أقصى

export function useWebSocketAlerts(userId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectDelay = useRef(1000); // نبدأ بثانية واحدة
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const addAlert = useAlertStore((s) => s.addAlert);

  useEffect(() => {
    if (!userId) return;

    let isUnmounted = false;

    function connect() {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      const apiKey = process.env.NEXT_PUBLIC_API_KEY || "dev-api-key";
      const url = `${WS_URL}/${encodeURIComponent(userId)}?api_key=${encodeURIComponent(apiKey)}`;
      console.log(`[WebSocket] Connecting to ${url}`);

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isUnmounted) {
          ws.close();
          return;
        }
        console.log("[WebSocket] Connection established successfully");
        reconnectDelay.current = 1000; // إعادة تعيين التأخير عند نجاح الاتصال
      };

      ws.onmessage = (event) => {
        if (isUnmounted) return;
        try {
          const rawData = JSON.parse(event.data);
          console.log("[WebSocket] Received raw alert:", rawData);

          const TITLE_MAP: Record<string, string> = {
            rate_spike: "Rate spike detected",
            rate_drop: "Rate drop detected",
            port_congestion: "Port congestion alert",
            carrier_advisory: "Carrier advisory",
          };

          const alert: Alert = {
            id: rawData.id || `ws-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: rawData.alert_type || "rate_spike",
            severity: rawData.severity || "info",
            is_new: true,
            is_read: false,
            title: TITLE_MAP[rawData.alert_type] || rawData.alert_type || "Alert",
            message: rawData.message || "",
            location_label: rawData.trade_lane || "",
            magnitude_pct: rawData.magnitude_pct,
            created_at: rawData.created_at || new Date().toISOString(),
          };

          addAlert(alert);
          showAlertToast(alert);
        } catch (err) {
          console.error("[WebSocket] Failed to parse alert message:", err);
        }
      };

      ws.onclose = (event) => {
        if (isUnmounted) return;
        console.log(`[WebSocket] Connection closed (code: ${event.code}). Reconnecting...`);
        wsRef.current = null;

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectDelay.current = Math.min(reconnectDelay.current * 2, MAX_RECONNECT_DELAY);
          connect();
        }, reconnectDelay.current);
      };

      ws.onerror = (err) => {
        if (isUnmounted) return;
        console.error("[WebSocket] Error occurred:", err);
        // let onclose handle reconnection
      };
    }

    connect();

    return () => {
      isUnmounted = true;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [userId, addAlert]);
}

