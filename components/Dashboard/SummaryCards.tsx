import React from "react";
import { DashboardData } from "@/lib/types";
import { TrendingUp, Anchor, AlertTriangle } from "lucide-react";

export default function SummaryCards({
  initialData,
}: {
  initialData: DashboardData;
}) {
  const avgRateChange =
    initialData.lanes_summary.length > 0
      ? initialData.lanes_summary.reduce(
          (sum, lane) => sum + lane.change_7d_pct,
          0,
        ) / initialData.lanes_summary.length
      : 0;

  const cards = [
    {
      title: "Active Lanes",
      value: initialData.tracked_lanes_count,
      icon: TrendingUp,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Avg Rate Change",
      value: `${avgRateChange >= 0 ? "+" : ""}${avgRateChange.toFixed(1)}%`,
      icon: TrendingUp,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      title: "Ports Monitored",
      value: initialData.port_congestion_overview.length,
      icon: Anchor,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      title: "Active Alerts",
      value: initialData.unread_alert_count,
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div key={card.title} className="rounded-2xl border bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm text-slate-500">{card.title}</span>
                <p className="mt-3 text-3xl font-bold text-slate-900">
                  {card.value}
                </p>
              </div>

              {Icon && (
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg}`}
                >
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
