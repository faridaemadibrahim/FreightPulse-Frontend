"use client";

import { useState, useMemo } from "react";
import { Alert, AlertSeverity, AlertType } from "@/lib/types";
import AlertSummaryCards from "./AlertSummaryCards";
import AlertFilters from "./AlertFilters";
import AlertListItem from "./AlertListItem";
import AlertSourcesPanel from "./AlertSourcesPanel";
import { Check } from "lucide-react";
type Props = {
  initialAlerts: Alert[];
};

export default function AlertsClient({ initialAlerts }: Props) {
  const [tab, setTab] = useState<"all" | "unread">("all");
  const [severityFilter, setSeverityFilter] = useState<"all" | AlertSeverity>(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<"all" | AlertType>("all");

  // alerts is the mutable copy we actually read/render from.
  // initialAlerts (the prop) is only used to seed this state once.
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const handleMarkRead = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)),
    );
  };
  const handleMarkAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
  };
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (tab === "unread" && alert.is_read) return false;
      if (severityFilter !== "all" && alert.severity !== severityFilter)
        return false;
      if (typeFilter !== "all" && alert.type !== typeFilter) return false;
      return true;
    });
  }, [alerts, tab, severityFilter, typeFilter]);

  const unreadCount = alerts.filter((a) => !a.is_read).length;
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Alerts</h1>
          <p className="mt-1 text-muted-foreground">
            Stay on top of changes that could impact your freight decisions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Check className="h-4 w-4" />
            Mark all as read
          </button>
        )}
      </div>
      <AlertSummaryCards
        unreadCount={unreadCount}
        criticalCount={criticalCount}
      />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* العمود الرئيسي (شمال) */}
        <div className="space-y-4">
          <AlertFilters
            tab={tab}
            onTabChange={setTab}
            allCount={alerts.length}
            unreadCount={unreadCount}
            severityFilter={severityFilter}
            onSeverityChange={setSeverityFilter}
            typeFilter={typeFilter}
            onTypeChange={setTypeFilter}
          />

          <div className="space-y-3">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <AlertListItem
                  key={alert.id}
                  alert={alert}
                  onMarkRead={handleMarkRead}
                />
              ))
            ) : (
              <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">
                No alerts match your filters.
              </div>
            )}
          </div>
        </div>

        <AlertSourcesPanel alerts={alerts} />
      </div>
    </div>
  );
}
