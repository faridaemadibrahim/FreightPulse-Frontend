"use client";

import { RouteBriefResponse } from "@/lib/api/route-brief";
import { CheckCircle2, Download, RotateCcw } from "lucide-react";

type Props = {
  data: RouteBriefResponse;
  onNewBrief: () => void;
};

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
              Generated for {data.origin} → {data.destination} · {data.carrier}{" "}
              · {data.cargo_type}
            </p>
          </div>
        </div>

        {data.pdf_path && (
          <a
            href={data.pdf_path}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </a>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left: Markdown content */}
        <div className="rounded-2xl border bg-white p-6 space-y-4">
          {data.brief_markdown.split("\n\n").map((paragraph, index) => {
            if (paragraph.startsWith("# ")) {
              return (
                <h1
                  key={index}
                  className="text-2xl font-bold text-slate-900 border-b pb-2"
                >
                  {paragraph.replace("# ", "")}
                </h1>
              );
            }
            if (paragraph.startsWith("## ")) {
              return (
                <h2
                  key={index}
                  className="text-lg font-bold text-slate-900 pt-2"
                >
                  {paragraph.replace("## ", "")}
                </h2>
              );
            }
            if (paragraph.startsWith("- ")) {
              return (
                <ul key={index} className="list-disc pl-5 space-y-1.5">
                  {paragraph.split("\n").map((li, i) => (
                    <li key={i} className="text-sm text-slate-600">
                      {li.replace(/^- /, "")}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={index} className="text-sm leading-relaxed text-slate-600">
                {paragraph}
              </p>
            );
          })}
        </div>

        {/* Right: Sidebar summary */}
        <div className="rounded-2xl border bg-white p-5 h-fit space-y-3 divide-y">
          <div className="pb-3">
            <span className="text-sm text-slate-500 block">Recommendation</span>
            <span className="text-base font-semibold text-emerald-600">
              {RECOMMENDATION_LABELS[data.recommendation] ||
                data.recommendation}
            </span>
          </div>
          <div className="pt-3">
            <span className="text-sm text-slate-500 block">Risk level</span>
            <span className="text-base font-semibold text-amber-600">
              {RISK_LABELS[data.risk_level] || data.risk_level}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
