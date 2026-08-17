"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/lib/types";
import { getAlerts } from "@/lib/api/alerts";

function formatTimeAgo(dateStr: string, now: number) {
  const diffHours = (now - new Date(dateStr).getTime()) / (1000 * 60 * 60);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${Math.floor(diffHours)} hours ago`;
  return "Yesterday";
}

export default function RecentAlertsList() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    getAlerts()
      .then((data) => setAlerts(data.slice(0, 3)))
      .catch((err) => console.error("Failed to load alerts:", err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="rounded-2xl border bg-white p-5">
      <h3 className="font-bold text-slate-900">Recent Alerts</h3>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-14 w-full animate-pulse rounded-xl bg-slate-100" />
            <div className="h-14 w-full animate-pulse rounded-xl bg-slate-100" />
          </div>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-slate-500">No recent alerts.</p>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {alert.title}
                </p>
                <p className="text-xs text-slate-400">
                  {formatTimeAgo(alert.created_at, now)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
