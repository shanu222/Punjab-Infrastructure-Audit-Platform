/** Higher = worse; aligned with backend risk bands. */
export function scoreToBand(
  score: number | null | undefined,
): "SAFE" | "MODERATE" | "HIGH" | "CRITICAL" | "UNKNOWN" {
  if (score === null || score === undefined || Number.isNaN(Number(score))) {
    return "UNKNOWN";
  }
  const s = Number(score);
  if (s < 25) return "SAFE";
  if (s < 50) return "MODERATE";
  if (s < 75) return "HIGH";
  return "CRITICAL";
}

export function weightedComposite(scores: {
  structural: number;
  flood: number;
  earthquake: number;
  heat: number;
}): number {
  const w = { structural: 0.35, flood: 0.25, earthquake: 0.25, heat: 0.15 };
  const c =
    scores.structural * w.structural +
    scores.flood * w.flood +
    scores.earthquake * w.earthquake +
    scores.heat * w.heat;
  return Math.round(c * 10) / 10;
}

export const BAND_STYLES: Record<
  string,
  { label: string; color: string; bg: string; ring: string }
> = {
  SAFE: {
    label: "Safe",
    color: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-500/15",
    ring: "ring-emerald-500/40",
  },
  MODERATE: {
    label: "Moderate",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-500/15",
    ring: "ring-amber-500/40",
  },
  HIGH: {
    label: "High",
    color: "text-orange-700 dark:text-orange-300",
    bg: "bg-orange-500/15",
    ring: "ring-orange-500/40",
  },
  CRITICAL: {
    label: "Critical",
    color: "text-red-700 dark:text-red-300",
    bg: "bg-red-500/15",
    ring: "ring-red-500/40",
  },
  UNKNOWN: {
    label: "Unknown",
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-500/10",
    ring: "ring-slate-400/30",
  },
};
