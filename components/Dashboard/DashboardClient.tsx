import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { DashboardData } from "@/lib/types";
import SummaryCards from "./SummaryCards";
import PortCongestionChart from "./PortCongestionChart";
import TrackedLanesList from "./TrackedLanesList";
import RecentAlertsList from "./RecentAlertsList";
import DashboardRateTrendChart from "./DashboardRateTrendChart";
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
        <ErrorBoundary label="The rate trend chart failed to load">
          <DashboardRateTrendChart data={initialData.rate_trend_30d} />
        </ErrorBoundary>

        <ErrorBoundary label="The port congestion chart failed to load">
          <PortCongestionChart ports={initialData.port_congestion_overview} />
        </ErrorBoundary>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <TrackedLanesList lanes={initialData.lanes_summary} />
        <RecentAlertsList />
      </div>
    </div>
  );
}
