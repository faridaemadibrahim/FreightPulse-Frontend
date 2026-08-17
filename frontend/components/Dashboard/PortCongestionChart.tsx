"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardPortSummary } from "@/lib/types";

type Props = {
  ports: DashboardPortSummary[];
};

export default function PortCongestionChart({ ports }: Props) {
  const chartData = ports.map((p) => ({
    name: p.port_name,
    congestion: p.congestion_index,
  }));

  return (
    <div className="rounded-2xl border bg-white p-5">
      <h3 className="font-bold text-slate-900">Port Congestion Index</h3>

      <div className="mt-4 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [`${value} / 100`, "Congestion"]} />
            <Bar dataKey="congestion" fill="#f97316" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
