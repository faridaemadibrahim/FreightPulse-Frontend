"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

type Props = {
  children: ReactNode;
  /** Rendered instead of the default card when the subtree throws. */
  fallback?: ReactNode;
  label?: string;
};

type State = { hasError: boolean };

// app/error.tsx only catches render errors from the server-rendered tree.
// Wrap client-only widgets that can fail on their own (the Leaflet map, a
// chart fed malformed data) in this so one broken widget doesn't blank the
// whole page.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("[FreightPulse] Component error:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-white px-6 py-12 text-center">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <h3 className="mt-3 text-base font-bold text-slate-900">
          {this.props.label ?? "This section failed to load"}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Try reloading the page.
        </p>
      </div>
    );
  }
}
