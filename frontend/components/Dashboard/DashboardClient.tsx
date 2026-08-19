import { DashboardData } from "@/lib/types";
import SummaryCards from "./SummaryCards";
import PortCongestionChart from "./PortCongestionChart";
import TrackedLanesList from "./TrackedLanesList";
import RecentAlertsList from "./RecentAlertsList";
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
        <div className="rounded-2xl border bg-white p-5 flex items-center justify-center text-sm text-slate-400 h-80">
          Rate trend data coming soon
        </div>

        <PortCongestionChart ports={initialData.port_congestion_overview} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <TrackedLanesList lanes={initialData.lanes_summary} />
        <RecentAlertsList />
      </div>
    </div>
  );
}
