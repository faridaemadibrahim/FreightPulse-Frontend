import { cn } from "@/lib/utils";

export type SeverityTone = {
  /** Badge pill with a border — used by the carrier advisory feed. */
  outlined: string;
  /** Flat badge pill — used by the alert list. */
  solid: string;
  /** Icon chip background, for call sites that render an icon beside the label. */
  iconBg: string;
};

// The API returns severity as a free-form string and the wording differs per
// feed (advisories say "high", alerts say "critical"), so normalise before
// looking up a tone.
const TONES: Record<string, SeverityTone> = {
  critical: {
    outlined: "bg-red-100/90 text-red-700 border-red-200/80",
    solid: "bg-red-100 text-red-700",
    iconBg: "bg-red-100 text-red-600",
  },
  elevated: {
    outlined: "bg-amber-100/90 text-amber-800 border-amber-200/80",
    solid: "bg-amber-100 text-amber-700",
    iconBg: "bg-amber-100 text-amber-600",
  },
  advisory: {
    outlined: "bg-blue-100/90 text-blue-700 border-blue-200/80",
    solid: "bg-blue-100 text-blue-700",
    iconBg: "bg-blue-100 text-blue-600",
  },
  normal: {
    outlined: "bg-emerald-100/90 text-emerald-700 border-emerald-200/80",
    solid: "bg-emerald-100 text-emerald-700",
    iconBg: "bg-emerald-100 text-emerald-600",
  },
  unknown: {
    outlined: "bg-slate-100 text-slate-700 border-slate-200",
    solid: "bg-slate-100 text-slate-700",
    iconBg: "bg-slate-100 text-slate-600",
  },
};

const ALIASES: Record<string, keyof typeof TONES> = {
  high: "critical",
  critical: "critical",
  elevated: "elevated",
  medium: "elevated",
  advisory: "advisory",
  info: "advisory",
  normal: "normal",
  low: "normal",
};

export function severityTone(severity: string | null | undefined): SeverityTone {
  if (!severity) return TONES.unknown;
  return TONES[ALIASES[severity.toLowerCase()] ?? "unknown"];
}

type Props = {
  severity: string | null | undefined;
  variant?: "outlined" | "solid";
  className?: string;
};

export function SeverityBadge({
  severity,
  variant = "outlined",
  className,
}: Props) {
  const tone = severityTone(severity);

  return (
    <span
      className={cn(
        "rounded-full px-3 py-0.5 text-xs font-semibold capitalize",
        variant === "outlined" ? `border ${tone.outlined}` : tone.solid,
        className,
      )}
    >
      {severity ?? "unknown"}
    </span>
  );
}
