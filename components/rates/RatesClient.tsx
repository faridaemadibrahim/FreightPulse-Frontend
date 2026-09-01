"use client";

import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { useState, useMemo, useEffect } from "react";
import { MousePointerClick } from "lucide-react";
import { LaneSummary, RateCompareData, RatePoint } from "@/lib/types";
import RateOverviewTable from "./RateOverviewTable";
import RateCompareCard from "./RateCompareCard";
import RateTrendChart from "./RateTrendChart";
import RateFilters from "./RateFilters";
import { getRateCompare, getRateLane } from "@/lib/api";

interface RatesClientProps {
  initialLanes: LaneSummary[];
}

export default function RatesClient({ initialLanes }: RatesClientProps) {
  const [search, setSearch] = useState("");
  const [containerType, setContainerType] = useState("all");

  const filteredLanes = useMemo(() => {
    return initialLanes.filter((lane) => {
      const matchesSearch =
        search === "" ||
        lane.trade_lane.toLowerCase().includes(search.toLowerCase()) ||
        lane.source.toLowerCase().includes(search.toLowerCase());

      const matchesContainer =
        containerType === "all" || lane.container_type === containerType;

      return matchesSearch && matchesContainer;
    });
  }, [initialLanes, search, containerType]);

  // Selected trade lane state (defaults to first available lane from backend)
  const [selectedLane, setSelectedLane] = useState<LaneSummary | null>(() => {
    return initialLanes[0] || null;
  });

  const [compareData, setCompareData] = useState<RateCompareData | null>(null);
  const [historyData, setHistoryData] = useState<RatePoint[]>([]);

  // Fetch benchmark compare and time series data when selected lane changes
  useEffect(() => {
    let isMounted = true;
    async function loadLaneData() {
      if (!selectedLane) return;
      try {
        const [comp, detail] = await Promise.all([
          getRateCompare(selectedLane.trade_lane, selectedLane.container_type),
          getRateLane(selectedLane.trade_lane, selectedLane.container_type),
        ]);
        if (isMounted) {
          setCompareData(comp);
          if (detail && detail.history) {
            setHistoryData(detail.history);
          }
        }
      } catch (err) {
        console.warn("Error loading selected lane benchmark data:", err);
      }
    }

    if (selectedLane) {
      loadLaneData();
    }

    return () => {
      isMounted = false;
    };
  }, [selectedLane]);

  return (
    <div className="space-y-6">
      {/* Top Filter Controls */}
      <RateFilters
        search={search}
        onSearchChange={setSearch}
        containerType={containerType}
        onContainerTypeChange={setContainerType}
      />

      <p className="text-sm text-slate-500 flex items-center gap-1.5">
        <MousePointerClick className="h-4 w-4" />
        Click any lane below to view its trend chart and benchmark comparison
      </p>

      {/* Side-by-Side Grid: All Trade Lanes Table (Left 2 cols) & Benchmark Comparison (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <RateOverviewTable
            lanes={filteredLanes}
            selectedLaneName={selectedLane?.trade_lane}
            selectedContainerType={selectedLane?.container_type}
            onSelectLane={(lane) => setSelectedLane(lane)}
          />
        </div>

        <div className="lg:col-span-1">
          <RateCompareCard
            data={compareData}
            lane={selectedLane?.trade_lane || ""}
            currentRate={selectedLane?.current_rate_usd || 0}
          />
        </div>
      </div>

      {/* Bottom Chart: Full Width 30-Day Rate Trend Chart */}
      <div className="w-full pt-2">
        <ErrorBoundary label="The rate trend chart failed to load">
          <RateTrendChart
            data={historyData.length > 0 ? historyData : undefined}
            lane={selectedLane?.trade_lane || ""}
            containerType={selectedLane?.container_type || "40ft"}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}

export { RatesClient };
