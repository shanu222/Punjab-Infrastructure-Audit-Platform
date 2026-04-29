import { cn } from "@/app/components/ui/utils";

type Level = "SAFE" | "MODERATE" | "HIGH" | "CRITICAL" | string;

const map: Record<string, string> = {
  SAFE: "bg-risk-safe/15 text-emerald-800 dark:text-emerald-300 border-risk-safe/30",
  MODERATE: "bg-risk-moderate/15 text-amber-900 dark:text-amber-200 border-risk-moderate/35",
  HIGH: "bg-risk-high/15 text-orange-900 dark:text-orange-200 border-risk-high/35",
  CRITICAL: "bg-risk-critical/15 text-red-900 dark:text-red-200 border-risk-critical/35",
  UNKNOWN: "bg-muted text-muted-foreground border-border",
};

export function RiskBadge({ level, className }: { level: Level; className?: string }) {
  const k = String(level || "UNKNOWN").toUpperCase();
  const styles = map[k] || "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        styles,
        className,
      )}
    >
      {k}
    </span>
  );
}
