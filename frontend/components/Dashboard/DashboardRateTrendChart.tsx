"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardRateTrendPoint } from "@/lib/types";

type Props = {
  data: DashboardRateTrendPoint[];
};

export default function DashboardRateTrendChart({ data }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <h3 className="font-bold text-slate-900">30-Day Rate Trend</h3>

      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(d) =>
                new Date(d).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
            <Tooltip
              formatter={(value) => [
                `$${Number(value).toLocaleString()}`,
                "Avg Rate",
              ]}
              labelFormatter={(label) =>
                new Date(String(label)).toLocaleDateString()
              }
            />
            <Line
              type="monotone"
              dataKey="avg_rate_usd"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
