"use client";

import dynamic from "next/dynamic";
import { DashboardRateTrendPoint, DashboardPortSummary } from "@/lib/types";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ChartSkeleton } from "@/components/common/ChartSkeleton";

// DashboardClient is a server component, so the dynamic(ssr:false) calls have
// to live in a client module like this one.
const DashboardRateTrendChart = dynamic(
  () => import("./DashboardRateTrendChart"),
  { ssr: false, loading: () => <ChartSkeleton /> },
);

const PortCongestionChart = dynamic(() => import("./PortCongestionChart"), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

export function DashboardRateTrendChartLazy({
  data,
}: {
  data: DashboardRateTrendPoint[];
}) {
  return (
    <ErrorBoundary label="The rate trend chart failed to load">
      <DashboardRateTrendChart data={data} />
    </ErrorBoundary>
  );
}

export function PortCongestionChartLazy({
  ports,
}: {
  ports: DashboardPortSummary[];
}) {
  return (
    <ErrorBoundary label="The port congestion chart failed to load">
      <PortCongestionChart ports={ports} />
    </ErrorBoundary>
  );
}
