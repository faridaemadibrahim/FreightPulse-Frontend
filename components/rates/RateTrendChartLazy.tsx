"use client";

import dynamic from "next/dynamic";
import { RatePoint } from "@/lib/types";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ChartSkeleton } from "@/components/common/ChartSkeleton";

// Recharts is one of the heaviest things in the bundle and no page needs it
// server-rendered, so split it out and load it in the browser only.
const RateTrendChart = dynamic(() => import("./RateTrendChart"), {
  ssr: false,
  loading: () => <ChartSkeleton height="h-[360px]" />,
});

type Props = {
  data?: RatePoint[];
  lane?: string;
  containerType?: string;
};

export default function RateTrendChartLazy(props: Props) {
  return (
    <ErrorBoundary label="The rate trend chart failed to load">
      <RateTrendChart {...props} />
    </ErrorBoundary>
  );
}
