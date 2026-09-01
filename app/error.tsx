"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

// Route-level boundary: a throw in any page below this (most often a failed
// API fetch during server rendering) lands here instead of the default
// Next.js error screen.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[FreightPulse] Page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center rounded-2xl border bg-white px-6 py-12 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <h2 className="mt-3 text-lg font-bold text-slate-900">
          Something went wrong
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          We couldn&apos;t load this page. This is usually a temporary problem
          reaching the FreightPulse API.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-slate-400">
            Reference: {error.digest}
          </p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-4 flex items-center gap-1.5 rounded-lg border bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
