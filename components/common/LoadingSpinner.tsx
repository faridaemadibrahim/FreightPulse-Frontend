import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  label?: string;
};

export function LoadingSpinner({ className, label }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center justify-center gap-2 py-8", className)}
    >
      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
      <span className={label ? "text-sm text-slate-500" : "sr-only"}>
        {label ?? "Loading"}
      </span>
    </div>
  );
}
