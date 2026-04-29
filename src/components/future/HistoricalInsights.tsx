import type { FutureAnalysisData } from "./types";

type Props = {
  data: FutureAnalysisData | null;
  loading?: boolean;
};

export function HistoricalInsights({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="h-4 w-40 bg-muted rounded animate-pulse mb-3" />
        <div className="h-3 w-full bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const h = data.historical;
  const failures = h.high_critical_audit_count > 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <h3 className="font-semibold text-foreground">Historical data insight</h3>
      <ul className="text-sm text-muted-foreground space-y-2">
        <li>
          <span className="font-medium text-foreground">{data.nearby_assets.length}</span> registered assets within the
          analysis radius (up to {h.nearby_asset_count ?? data.nearby_assets.length} sampled).
        </li>
        <li>
          Average composite risk index in the area:{" "}
          <span className="font-medium text-foreground">{h.average_area_risk != null ? h.average_area_risk : "insufficient data"}</span>
          {h.average_area_risk != null ? " (0–100, higher = worse)" : ""}.
        </li>
        <li>
          Past high/critical audits in sample:{" "}
          <span className={`font-medium ${failures ? "text-destructive" : "text-foreground"}`}>{h.high_critical_audit_count}</span>{" "}
          {failures ? "(elevated historical stress in this footprint)" : "(no flagged stress in sampled audits)."}
        </li>
        <li className="text-xs">Audits considered: {h.audits_sampled}</li>
      </ul>
    </div>
  );
}
