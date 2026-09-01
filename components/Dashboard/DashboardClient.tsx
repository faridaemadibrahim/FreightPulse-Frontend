import { DashboardData } from "@/lib/types";
import SummaryCards from "./SummaryCards";
import TrackedLanesList from "./TrackedLanesList";
import RecentAlertsList from "./RecentAlertsList";
import {
  DashboardRateTrendChartLazy,
  PortCongestionChartLazy,
} from "./DashboardChartsLazy";
export default function DashboardClient({
  initialData,
}: {
  initialData: DashboardData;
}) {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
        Dashboard
      </h1>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Real-time freight & logistics intelligence
      </p>

      <SummaryCards initialData={initialData} />
      <div className="grid gap-4 lg:grid-cols-2">
        {/* هنحط هنا الـ Rate Trend chart لاحقًا */}
        <DashboardRateTrendChartLazy data={initialData.rate_trend_30d} />

        <PortCongestionChartLazy ports={initialData.port_congestion_overview} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <TrackedLanesList lanes={initialData.lanes_summary} />
        <RecentAlertsList />
      </div>
    </div>
  );
}
