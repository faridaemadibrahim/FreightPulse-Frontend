"use client";

import { RouteBriefResultData } from "@/lib/types";
import {
  CheckCircle2,
  Download,
  RotateCcw,
  Lightbulb,
  AlertTriangle,
  MapPin,
  Truck,
} from "lucide-react";

type Props = {
  data: RouteBriefResultData;
  onNewBrief: () => void;
};

// تحويل القيم التقنية لنصوص مقروءة للمستخدم
const RECOMMENDATION_LABELS: Record<string, string> = {
  ship_now: "Book this week",
  wait: "Wait for better rates",
  reroute: "Consider rerouting",
};

const RISK_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Moderate",
  high: "High",
};

const RATE_OUTLOOK_LABELS: Record<string, string> = {
  firming: "Firming",
  softening: "Softening",
  stable: "Stable",
};

export default function RouteBriefResult({ data, onNewBrief }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
            ✨ AI route intelligence
          </span>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Route Brief
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Turn live freight signals into a clear, decision-ready
            recommendation for your next shipment.
          </p>
        </div>

        <button
          onClick={onNewBrief}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
          New brief
        </button>
      </div>

      {/* Success banner */}
      <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-emerald-900">Brief ready</p>
            <p className="text-sm text-emerald-700">
              Generated for {data.origin} → {data.destination} ·{" "}
              {data.cargo_type} container
            </p>
          </div>
        </div>

        <button className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
          <Download className="h-4 w-4" />
          Download PDF
        </button>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Left: Brief content */}
        <div className="rounded-2xl border bg-white p-6">
          <span className="text-xs font-bold tracking-wider text-blue-600">
            ROUTE INTELLIGENCE BRIEF
          </span>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {data.origin} → {data.destination}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Prepared{" "}
            {new Date(data.prepared_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            · {data.cargo_type} dry container · Valid for the next{" "}
            {data.valid_days} days
          </p>

          <hr className="my-4" />

          <h3 className="font-bold text-slate-900">Executive recommendation</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {data.executive_recommendation}
          </p>

          <div className="mt-4 flex gap-3 rounded-xl border-l-4 border-blue-500 bg-blue-50 p-4">
            <Lightbulb className="h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <p className="font-semibold text-slate-900">Recommended action</p>
              <p className="mt-1 text-sm text-blue-900">
                {data.recommended_action}
              </p>
            </div>
          </div>

          <h3 className="mt-6 font-bold text-slate-900">Market outlook</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {data.market_outlook}
          </p>

          <h3 className="mt-6 font-bold text-slate-900">
            Operational watchlist
          </h3>
          <ul className="mt-2 space-y-2">
            {data.operational_watchlist.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="font-bold text-slate-900">Brief at a glance</h3>

            <div className="mt-4 space-y-3 divide-y">
              <div className="flex items-center justify-between pb-3">
                <span className="text-sm text-slate-500">Recommendation</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {RECOMMENDATION_LABELS[data.recommendation]}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-500">Risk level</span>
                <span className="text-sm font-semibold text-amber-600">
                  {RISK_LABELS[data.risk_level]}
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-slate-500">Rate outlook</span>
                <span className="text-sm font-semibold text-red-600">
                  {RATE_OUTLOOK_LABELS[data.rate_outlook]}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3">
                <span className="text-sm text-slate-500">Confidence</span>
                <span className="text-sm font-semibold text-blue-600">
                  {data.confidence}%
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <h3 className="font-bold text-slate-900">Route snapshot</h3>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Origin</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {data.origin}
                  </p>
                </div>
              </div>

              <div className="ml-4 h-4 border-l-2 border-dotted border-slate-200" />

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                  <Truck className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Destination</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {data.destination}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
