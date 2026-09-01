import { cn } from "@/lib/utils";

// Placeholder held while a lazily-loaded chart chunk arrives. Matching the
// chart's own height keeps the page from jumping when it swaps in.
export function ChartSkeleton({
  height = "h-72",
  className,
}: {
  height?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading chart"
      className={cn("rounded-2xl border bg-white p-5", className)}
    >
      <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
      <div className={cn("mt-4 animate-pulse rounded-xl bg-slate-100", height)} />
    </div>
  );
}
