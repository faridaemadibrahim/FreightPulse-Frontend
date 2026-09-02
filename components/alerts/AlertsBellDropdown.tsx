"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import {
  Bell,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Ship,
} from "lucide-react";
import { Alert, AlertType } from "@/lib/types";
import { useAlertStore } from "@/stores/alertStore";

function getAlertIcon(type: AlertType) {
  switch (type) {
    case "rate_spike":
      return <TrendingUp className="h-4 w-4 text-red-600" />;
    case "rate_drop":
      return <TrendingDown className="h-4 w-4 text-blue-600" />;
    case "port_congestion":
      return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    case "carrier_advisory":
      return <Ship className="h-4 w-4 text-slate-600" />;
  }
}

// لون خلفية الأيقونة حسب الـ severity
function getSeverityBg(severity: string) {
  if (severity === "critical") return "bg-red-100";
  if (severity === "elevated") return "bg-amber-100";
  return "bg-blue-100";
}

// نص وقت مختصر ("2h ago", "Yesterday"...)
function formatRelativeTime(dateStr: string) {
  const diffHours =
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffHours < 48) return "Yesterday";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function AlertsBellDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const alerts = useAlertStore((s) => s.alerts);
  const isLoading = useAlertStore((s) => s.isLoading);
  const markAllAsRead = useAlertStore((s) => s.markAllAsRead);

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  // Mark alerts as read only when the dropdown is CLOSED after having been
  // open — i.e. the user actually saw them and moved on. Marking on open
  // would immediately hide the "unread" badge for alerts the user hasn't
  // really looked at yet, and would also mark any alert that arrives via
  // WebSocket WHILE the dropdown happens to be open, before the user had
  // a chance to notice it.
  const closePanel = useCallback(
    ({ refocus }: { refocus: boolean }) => {
      setIsOpen(false);
      markAllAsRead();
      // Escape should hand focus back to the trigger; a click elsewhere
      // shouldn't steal it from whatever the user just clicked.
      if (refocus) bellRef.current?.focus();
    },
    [markAllAsRead],
  );

  const handleToggle = () => {
    if (isOpen) {
      closePanel({ refocus: false });
    } else {
      setIsOpen(true);
    }
  };

  // Without these the panel could only be dismissed by clicking the bell
  // again — and since closing is what marks alerts read, clicking away left
  // them unread forever.
  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current?.contains(event.target as Node)) return;
      closePanel({ refocus: false });
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePanel({ refocus: true });
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closePanel]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={bellRef}
        onClick={handleToggle}
        // Icon-only control: without an explicit label a screen reader
        // announces nothing but "button", and the unread dot is decorative.
        aria-label={
          unreadCount > 0
            ? `Alerts, ${unreadCount} unread`
            : "Alerts, none unread"
        }
        aria-expanded={isOpen}
        // Deliberately not aria-haspopup="menu": the panel is a read-only
        // list, not a menu of commands, so it has no menuitems to navigate.
        aria-controls={isOpen ? panelId : undefined}
        className="relative rounded-lg p-2 hover:bg-muted"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"
          />
        )}
      </button>

      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-label="Alerts"
          className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-white shadow-lg z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="font-semibold text-sm text-slate-900">Alerts</span>
            {unreadCount > 0 && (
              <span className="text-xs text-slate-500">
                {unreadCount} unread
              </span>
            )}
          </div>

          {/* Body */}
          <div className="max-h-80 overflow-y-auto divide-y">
            {isLoading ? (
              <div className="p-4 space-y-3">
                <div className="h-12 w-full bg-slate-100 rounded animate-pulse" />
                <div className="h-12 w-full bg-slate-100 rounded animate-pulse" />
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                No alerts right now.
              </div>
            ) : (
              alerts.slice(0, 6).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex gap-3 px-4 py-3 hover:bg-slate-50 ${
                    !alert.is_read ? "bg-blue-50/40" : ""
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getSeverityBg(
                      alert.severity,
                    )}`}
                  >
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {alert.title}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                      {alert.message}
                    </p>
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {formatRelativeTime(alert.created_at)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2.5 text-center">
            <a
              href="/alerts"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              View all alerts
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
