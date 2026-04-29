import type { FutureAnalysisData, HazardMetric } from "./types";

function barColor(level: string): string {
  const l = level.toLowerCase();
  if (l === "low") return "bg-emerald-500";
  if (l === "moderate") return "bg-amber-500";
  if (l === "high") return "bg-orange-600";
  return "bg-destructive";
}

function Row({ label, m }: { label: string; m: HazardMetric }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-foreground font-medium">{label}</span>
        <span className="text-muted-foreground">
          {m.score}/100 · <span className="capitalize text-foreground">{m.level}</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor(m.level)}`} style={{ width: `${Math.min(100, m.score)}%` }} />
      </div>
    </div>
  );
}

type Props = {
  data: FutureAnalysisData | null;
  loading?: boolean;
};

export function RiskPanel({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-2 bg-muted rounded" />
        <div className="h-2 bg-muted rounded" />
        <div className="h-2 bg-muted rounded" />
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <h3 className="font-semibold text-foreground">Risk analysis</h3>
      <Row label="Flood risk" m={data.flood_risk} />
      <Row label="Earthquake risk" m={data.earthquake_risk} />
      <Row label="Heat risk" m={data.heat_risk} />
      <p className="text-xs text-muted-foreground pt-1">
        Model composite {data.composite_index?.toFixed?.(1) ?? data.composite_index} — overall band{" "}
        <span className="font-medium text-foreground">{data.overall_risk}</span>
      </p>
    </div>
  );
}
