"use client";

import { useState } from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  RouteBriefResponse,
  downloadRouteBriefPdf,
} from "@/lib/api/route-brief";
import { CheckCircle2, Download, RotateCcw } from "lucide-react";

type Props = {
  data: RouteBriefResponse;
  onNewBrief: () => void;
};

// The brief is AI-generated markdown, so render every element we might get
// back rather than the handful a hand-rolled parser can cover.
const MARKDOWN_COMPONENTS: Components = {
  h1: (props) => (
    <h1
      className="text-2xl font-bold tracking-tight text-slate-900 border-b pb-2"
      {...props}
    />
  ),
  h2: (props) => (
    <h2 className="pt-2 text-lg font-bold text-slate-900" {...props} />
  ),
  h3: (props) => (
    <h3 className="pt-1 text-base font-semibold text-slate-900" {...props} />
  ),
  p: (props) => (
    <p className="text-sm leading-relaxed text-slate-600" {...props} />
  ),
  ul: (props) => (
    <ul className="list-disc space-y-1.5 pl-5 text-slate-600" {...props} />
  ),
  ol: (props) => (
    <ol className="list-decimal space-y-1.5 pl-5 text-slate-600" {...props} />
  ),
  li: (props) => <li className="text-sm leading-relaxed" {...props} />,
  strong: (props) => (
    <strong className="font-semibold text-slate-900" {...props} />
  ),
  em: (props) => <em className="italic" {...props} />,
  a: (props) => (
    <a
      className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-700"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-slate-800"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="border-l-2 border-slate-200 pl-4 text-sm italic text-slate-500"
      {...props}
    />
  ),
  hr: (props) => <hr className="border-slate-200" {...props} />,
  del: (props) => <del className="text-slate-400 line-through" {...props} />,
  // GFM tables: the brief often compares rates/carriers in one, and a wide
  // table has to scroll inside the card rather than stretch the layout.
  table: (props) => (
    <div className="overflow-x-auto">
      <table
        className="w-full border-collapse text-left text-sm"
        {...props}
      />
    </div>
  ),
  thead: (props) => <thead className="border-b border-slate-200" {...props} />,
  th: (props) => (
    <th
      className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500"
      {...props}
    />
  ),
  td: (props) => (
    <td
      className="border-b border-slate-100 px-3 py-2 align-top text-slate-600"
      {...props}
    />
  ),
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
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const blob = await downloadRouteBriefPdf(data.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `route-brief-${data.origin}-${data.destination}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Could not download the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* The page already renders the "Route Brief" heading above this. */}
      <div className="flex justify-end">
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

        {data.pdf_available && (
          <div className="flex flex-col items-end gap-1">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Preparing…" : "Download PDF"}
            </button>
            {downloadError && (
              <p className="text-xs text-red-600">{downloadError}</p>
            )}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left: Markdown content */}
        <div className="rounded-2xl border bg-white p-6 space-y-4">
          <Markdown
            remarkPlugins={[remarkGfm]}
            components={MARKDOWN_COMPONENTS}
          >
            {data.brief_markdown ?? ""}
          </Markdown>
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
