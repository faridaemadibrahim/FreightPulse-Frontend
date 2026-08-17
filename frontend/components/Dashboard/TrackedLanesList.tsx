import { DashboardLaneSummary } from "@/lib/types";
import { TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  lanes: DashboardLaneSummary[];
};

export default function TrackedLanesList({ lanes }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <h3 className="font-bold text-slate-900">Tracked Lanes</h3>

      <div className="mt-4 space-y-3">
        {lanes.map((lane) => {
          const isPositive = lane.change_7d_pct >= 0;

          return (
            <div
              key={lane.trade_lane}
              className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
            >
              <div>
                <p className="font-semibold text-slate-900">
                  {lane.trade_lane}
                </p>
                <p className="text-xs text-slate-500">Current rate</p>
              </div>

              <div className="text-right">
                <p className="font-bold text-slate-900">
                  ${lane.current_rate.toLocaleString()}
                </p>
                <p
                  className={`flex items-center justify-end gap-1 text-xs font-semibold ${
                    isPositive ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isPositive ? "+" : ""}
                  {lane.change_7d_pct}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
