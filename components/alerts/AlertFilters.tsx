"use client";

import { AlertSeverity, AlertType } from "@/lib/types";

type Props = {
  tab: "all" | "unread";
  onTabChange: (tab: "all" | "unread") => void;
  allCount: number;
  unreadCount: number;
  severityFilter: "all" | AlertSeverity;
  onSeverityChange: (severity: "all" | AlertSeverity) => void;
  typeFilter: "all" | AlertType;
  onTypeChange: (type: "all" | AlertType) => void;
};

export default function AlertFilters({
  tab,
  onTabChange,
  allCount,
  unreadCount,
  severityFilter,
  onSeverityChange,
  typeFilter,
  onTypeChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-3">
      {/* Tabs: All / Unread */}
      <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
        <button
          onClick={() => onTabChange("all")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "all"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          All alerts{" "}
          <span className="ml-1 text-xs text-slate-400">{allCount}</span>
        </button>
        <button
          onClick={() => onTabChange("unread")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === "unread"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Unread{" "}
          <span className="ml-1 text-xs text-slate-400">{unreadCount}</span>
        </button>
      </div>

      {/* Severity dropdown */}
      <select
        value={severityFilter}
        onChange={(e) =>
          onSeverityChange(e.target.value as "all" | AlertSeverity)
        }
        className="h-9 rounded-lg border bg-white px-3 text-sm text-slate-700"
      >
        <option value="all">All severity</option>
        <option value="critical">Critical</option>
        <option value="elevated">Elevated</option>
        <option value="info">Info</option>
      </select>

      {/* Type dropdown */}
      <select
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value as "all" | AlertType)}
        className="h-9 rounded-lg border bg-white px-3 text-sm text-slate-700"
      >
        <option value="all">All types</option>
        <option value="rate_spike">Rate spike</option>
        <option value="rate_drop">Rate drop</option>
        <option value="port_congestion">Port congestion</option>
        <option value="carrier_advisory">Carrier advisory</option>
      </select>
    </div>
  );
}
