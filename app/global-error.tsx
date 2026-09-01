"use client";

import { useEffect } from "react";

// Last-resort boundary: only reached when the root layout itself throws, so
// it has to render its own <html>/<body>.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[FreightPulse] Root layout error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, sans-serif",
            padding: "1rem",
            textAlign: "center",
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>
              FreightPulse failed to load
            </h2>
            <p style={{ marginTop: "0.25rem", color: "#64748b" }}>
              Please reload the page. If the problem continues, contact support.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: "1rem",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                padding: "0.5rem 0.75rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
