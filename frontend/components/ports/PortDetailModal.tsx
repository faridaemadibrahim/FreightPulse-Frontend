"use client";
import { useState, useEffect } from "react";
import { getPortDetail, PortDetail } from "@/lib/api/ports";
import { Port } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Anchor, Clock, AlertTriangle, Ship, Navigation, CheckCircle2, X } from "lucide-react";

type Props = {
  port: Port | null;
  isOpen: boolean;
  onClose: () => void;
  onFocusMap?: (port: Port) => void;
};

export default function PortDetailModal({
  port,
  isOpen,
  onClose,
  onFocusMap,
}: Props) {
  const [detail, setDetail] = useState<PortDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!port || !isOpen) return;

    setIsLoading(true);
    setDetail(null);

    const code = port.code || port.id;

    getPortDetail(code)
      .then((data) => setDetail(data))
      .catch((err) => {
        console.error("Failed to load port detail:", err);
      })
      .finally(() => setIsLoading(false));
  }, [port, isOpen]);

  if (!port) return null;

  const code = (
    port.code ||
    port.id ||
    port.name.slice(0, 3)
  ).toUpperCase();

  const isCritical =
    port.congestion_level === "critical" || port.congestion_pct >= 80;
  const isElevated =
    !isCritical &&
    (port.congestion_level === "elevated" ||
      port.congestion_level === "high" ||
      port.congestion_pct >= 50);

  const statusLabel = isCritical
    ? "Critical Congestion"
    : isElevated
      ? "Elevated Congestion"
      : "Normal Operations";

  const colorStyles = isCritical
    ? {
      badgeBg: "bg-red-500",
      statusBg: "bg-red-50 text-red-700 border-red-200",
      barColor: "bg-red-500",
    }
    : isElevated
      ? {
        badgeBg: "bg-amber-500",
        statusBg: "bg-amber-50 text-amber-700 border-amber-200",
        barColor: "bg-amber-500",
      }
      : {
        badgeBg: "bg-emerald-500",
        statusBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        barColor: "bg-emerald-500",
      };

  const dwellDays = detail?.avg_dwell_days ?? port.avg_dwell_days ?? null;
  const vesselsWaiting = detail?.vessels_waiting ?? port.vessels_waiting ?? null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent showCloseButton={false}
        className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-xl">
        {/* Header Header Banner */}
        <div className="p-6 bg-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            <div
              className={`h-14 w-14 rounded-2xl ${colorStyles.badgeBg} flex items-center justify-center font-bold text-base text-white tracking-widest shadow-md shrink-0`}
            >
              {code}
            </div>

            <div>
              <DialogTitle className="text-xl font-bold text-white leading-tight">
                {port.name}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-sm mt-0.5 flex items-center gap-2">
                <span>{port.country}</span>
                <span>•</span>
                <span className="font-mono text-xs text-slate-400">
                  {port.latitude.toFixed(2)}°N, {port.longitude.toFixed(2)}°E
                </span>
              </DialogDescription>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${colorStyles.statusBg}`}
            >
              {isCritical ? (
                <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
              ) : isElevated ? (
                <Clock className="h-3.5 w-3.5 text-amber-600" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              )}
              {statusLabel}
            </span>

            {onFocusMap && (
              <button
                onClick={() => {
                  onFocusMap(port);
                  onClose();
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
              >
                <Navigation className="h-3.5 w-3.5" />
                Focus on Map
              </button>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Congestion Gauge Score */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">Congestion Index</span>
              <span className="text-lg font-bold text-slate-900">
                {port.congestion_pct} / 100
              </span>
            </div>

            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${colorStyles.barColor} transition-all duration-500`}
                style={{ width: `${port.congestion_pct}%` }}
              />
            </div>

            <p className="text-xs text-slate-500 pt-1">
              Calculated from vessel queuing density, dwell times, and berth occupancy rates.
            </p>
          </div>

          {/* Operational Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                <Clock className="h-4 w-4 text-slate-400" />
                <span>Avg. Container Dwell</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {isLoading ? (
                  <span className="inline-block h-6 w-16 bg-slate-100 rounded animate-pulse" />
                ) : dwellDays !== null ? (
                  `${dwellDays} days`
                ) : (
                  "—"
                )}
              </p>
              <p className="text-[11px] text-slate-400">Yard dwell time prior to gate out</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                <Ship className="h-4 w-4 text-slate-400" />
                <span>Vessels Waiting</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">
                {isLoading ? (
                  <span className="inline-block h-6 w-16 bg-slate-100 rounded animate-pulse" />
                ) : vesselsWaiting !== null ? (
                  vesselsWaiting
                ) : (
                  "—"
                )}
              </p>
              <p className="text-[11px] text-slate-400">Anchored outside terminal gates</p>
            </div>
          </div>

          {/* Port Operational Advisories */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Anchor className="h-4 w-4 text-slate-500" />
              Terminal Advisories & Alerts
            </h4>

            <div className="space-y-2">
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-16 w-full bg-slate-100 rounded-xl animate-pulse" />
                </div>
              ) : detail?.advisory_text ? (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">Latest Advisory</span>
                    {detail.measured_at && (
                      <span className="text-[10px] text-slate-400">
                        {new Date(detail.measured_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed">{detail.advisory_text}</p>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-500 text-center">
                  No active advisories for this port.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}