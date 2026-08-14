import { Mail } from "lucide-react";
import { Alert } from "@/lib/types";

type Props = {
  alerts: Alert[];
};

export default function AlertSourcesPanel({ alerts }: Props) {
  const rateCount = alerts.filter(
    (a) => a.type === "rate_spike" || a.type === "rate_drop",
  ).length;
  const portCount = alerts.filter((a) => a.type === "port_congestion").length;
  const carrierCount = alerts.filter(
    (a) => a.type === "carrier_advisory",
  ).length;

  const maxCount = Math.max(rateCount, portCount, carrierCount, 1); // عشان منقسمش على صفر

  const sources = [
    { label: "Rate movements", count: rateCount, color: "bg-blue-500" },
    { label: "Port conditions", count: portCount, color: "bg-amber-500" },
    {
      label: "Carrier advisories",
      count: carrierCount,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Alert sources breakdown */}
      <div className="rounded-2xl border bg-white p-5">
        <h3 className="font-bold text-slate-900">Alert sources</h3>
        <p className="mt-0.5 text-xs text-slate-500">Your active signal mix</p>

        <div className="mt-5 space-y-4">
          {sources.map((source) => (
            <div key={source.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{source.label}</span>
                <span className="font-semibold text-slate-900">
                  {source.count}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${source.color}`}
                  style={{ width: `${(source.count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notification settings card */}
      <div className="rounded-2xl bg-slate-900 p-5 text-white">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
          <Mail className="h-4 w-4" />
        </div>
        <h4 className="mt-3 font-bold">Choose how you&apos;re notified.</h4>
        <p className="mt-1.5 text-sm text-slate-300">
          Get critical signals by email or keep them inside your FreightPulse
          workspace.
        </p>
        <button className="mt-4 w-full rounded-lg bg-white py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100">
          Notification settings
        </button>
      </div>

      {/* Info note */}
      <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
        Alerts are refreshed continuously as rate, port, and carrier signals
        change.
      </div>
    </div>
  );
}
