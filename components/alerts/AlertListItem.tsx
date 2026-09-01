"use client";

import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Ship,
  Clock,
  ExternalLink,
  Check,
} from "lucide-react";
import { Alert, AlertType } from "@/lib/types";
import { severityTone } from "@/components/common/SeverityBadge";

type Props = {
  alert: Alert;
  onMarkRead: (id: string) => void;
};

function getAlertIcon(type: AlertType) {
  switch (type) {
    case "rate_spike":
      return <TrendingUp className="h-5 w-5" />;
    case "rate_drop":
      return <TrendingDown className="h-5 w-5" />;
    case "port_congestion":
      return <AlertTriangle className="h-5 w-5" />;
    case "carrier_advisory":
      return <Ship className="h-5 w-5" />;
  }
}

function formatRelativeTime(dateStr: string) {
  const diffHours =
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${Math.floor(diffHours)} min ago`;
  if (diffHours < 48) return "Yesterday";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function AlertListItem({ alert, onMarkRead }: Props) {
  const styles = severityTone(alert.severity);
  const magnitudeColor =
    alert.magnitude_pct !== undefined
      ? alert.magnitude_pct >= 0
        ? "text-red-600"
        : "text-emerald-600"
      : "";

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.iconBg}`}
        >
          {getAlertIcon(alert.type)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{alert.title}</h3>
            {alert.is_new && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                NEW
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${styles.solid}`}
            >
              {alert.severity}
            </span>
          </div>

          <p className="mt-1.5 text-sm text-slate-600">{alert.message}</p>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
            <div className="flex items-center gap-4">
              <span className="text-slate-600">{alert.location_label}</span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                {formatRelativeTime(alert.created_at)}
              </span>
              {alert.magnitude_pct !== undefined && (
                <span className={`font-semibold ${magnitudeColor}`}>
                  {alert.magnitude_pct >= 0 ? "+" : ""}
                  {alert.magnitude_pct}%
                </span>
              )}
              {alert.index_value !== undefined && (
                <span className="font-semibold text-slate-700">
                  {alert.index_value} / 100
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!alert.is_read && (
                <button
                  onClick={() => onMarkRead(alert.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <Check className="h-3.5 w-3.5" />
                  Mark read
                </button>
              )}
              <button className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:underline">
                <ExternalLink className="h-3.5 w-3.5" />
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
