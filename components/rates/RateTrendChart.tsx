"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RatePoint } from "@/lib/types";
import { MoreVertical } from "lucide-react";

interface RateTrendChartProps {
  data?: RatePoint[];
  lane?: string;
  containerType?: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    let dateStr = label;
    try {
      dateStr = new Date(label).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {}

    // Extract values matching exact colors
    const avg30d = payload.find((p: any) => p.dataKey === "avg_30d_usd")?.value;
    const avg7d = payload.find((p: any) => p.dataKey === "avg_7d_usd")?.value;
    const currentRate = payload.find((p: any) => p.dataKey === "rate_usd")?.value;

    return (
      <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-3.5 min-w-[130px] text-center space-y-1.5">
        <p className="text-sm font-semibold text-slate-800 border-b pb-1 mb-1">{dateStr}</p>
        {avg30d !== undefined && (
          <p className="text-sm font-medium font-mono text-[#f59e0b]">
            : ${Number(avg30d).toLocaleString()}
          </p>
        )}
        {avg7d !== undefined && (
          <p className="text-sm font-medium font-mono text-[#10b981]">
            : ${Number(avg7d).toLocaleString()}
          </p>
        )}
        {currentRate !== undefined && (
          <p className="text-sm font-medium font-mono text-[#3b82f6]">
            : ${Number(currentRate).toLocaleString()}
          </p>
        )}
      </div>
    );
  }
  return null;
}

export default function RateTrendChart({
  data = [],
  lane = "",
}: RateTrendChartProps) {
  // Ensure trade lane subtitle formatting (e.g. "Singapore → Europe")
  const laneFormatted = useMemo(() => {
    if (!lane) return "No Lane Selected";
    return lane.replace("-", " → ");
  }, [lane]);

  // Compute 7d & 30d averages if not present in payload
  const chartData = useMemo(() => {
    const raw = data || [];
    return raw.map((point, index, array) => {
      let avg7 = point.avg_7d_usd;
      let avg30 = point.avg_30d_usd;

      if (avg7 === undefined) {
        const slice7 = array.slice(Math.max(0, index - 6), index + 1);
        avg7 = Math.round(slice7.reduce((s, p) => s + p.rate_usd, 0) / slice7.length);
      }

      if (avg30 === undefined) {
        const slice30 = array.slice(Math.max(0, index - 29), index + 1);
        avg30 = Math.round(slice30.reduce((s, p) => s + p.rate_usd, 0) / slice30.length);
      }

      return {
        ...point,
        avg_7d_usd: avg7,
        avg_30d_usd: avg30,
      };
    });
  }, [data]);


  return (
    <Card className="w-full bg-white border border-slate-200/80 shadow-xs rounded-xl overflow-hidden">
      <CardHeader className="p-6 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              30-Day Rate Trend
            </h3>
            <p className="text-sm font-normal text-slate-500 mt-0.5">
              {laneFormatted}
            </p>
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-2">
        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="2 2"
                vertical={true}
                horizontal={true}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(d) => {
                  try {
                    return new Date(d).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  } catch {
                    return d;
                  }
                }}
                stroke="#94a3b8"
                fontSize={12}
                tickLine={true}
                axisLine={{ stroke: "#cbd5e1" }}
                dy={10}
              />
              <YAxis
                domain={[0, 3000]}
                ticks={[0, 750, 1500, 2250, 3000]}
                tickFormatter={(v) => `$${v}`}
                stroke="#94a3b8"
                fontSize={12}
                tickLine={true}
                axisLine={{ stroke: "#cbd5e1" }}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* 30d Average (Orange/Amber line) */}
              <Line
                type="monotone"
                dataKey="avg_30d_usd"
                name="30d Average"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: "#f59e0b", stroke: "#f59e0b" }}
                activeDot={{ r: 5, fill: "#f59e0b", stroke: "#ffffff", strokeWidth: 2 }}
              />

              {/* 7d Average (Green line) */}
              <Line
                type="monotone"
                dataKey="avg_7d_usd"
                name="7d Average"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: "#10b981", stroke: "#10b981" }}
                activeDot={{ r: 5, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
              />

              {/* Current Rate (Blue solid line) */}
              <Line
                type="monotone"
                dataKey="rate_usd"
                name="Current Rate"
                stroke="#3b82f6"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#3b82f6", stroke: "#3b82f6" }}
                activeDot={{ r: 6, fill: "#3b82f6", stroke: "#ffffff", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Bottom Legend Matching Screenshot */}
        <div className="flex items-center justify-center gap-6 mt-4 pt-2 text-sm font-medium">
          <div className="flex items-center gap-1.5 text-[#f59e0b]">
            <span className="flex items-center text-xs">
              --<span className="inline-block w-2 h-2 rounded-full bg-[#f59e0b] mx-0.5"></span>--
            </span>
            <span>30d Average</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#10b981]">
            <span className="flex items-center text-xs">
              --<span className="inline-block w-2 h-2 rounded-full bg-[#10b981] mx-0.5"></span>--
            </span>
            <span>7d Average</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#3b82f6]">
            <span className="flex items-center text-xs">
              --<span className="inline-block w-2 h-2 rounded-full bg-[#3b82f6] mx-0.5"></span>--
            </span>
            <span>Current Rate</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { RateTrendChart };
