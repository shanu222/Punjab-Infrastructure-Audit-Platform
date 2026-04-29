import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Brain, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

export type AiInsightsModel = {
  narrative_summary?: string;
  confidence?: number;
  risk_projection?: { year: number; projected_risk: number }[];
  recommendations?: { id?: string; text: string; severity?: string }[];
  weak_structural_areas?: { area: string; detail: string }[];
  disaster_vulnerability?: {
    structural: number;
    flood: number;
    earthquake: number;
    heat: number;
  };
  predictions?: { horizon_years?: number; summary?: string }[];
};

type Props = {
  insights: AiInsightsModel | null;
  loading?: boolean;
};

export function AIInsights({ insights, loading }: Props) {
  if (loading && !insights) {
    return (
      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
        <div className="h-40 animate-pulse rounded-lg bg-muted/50" />
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
        AI insights could not be loaded. Risk panels still reflect stored scores
        and audits.
      </div>
    );
  }

  const chartData = (insights.risk_projection || []).map((p) => ({
    year: String(p.year),
    risk: p.projected_risk,
  }));

  const vuln = insights.disaster_vulnerability;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/8 via-card to-secondary/5 p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-primary/15 p-2">
          <Brain className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">AI insights</h2>
          <p className="text-xs text-muted-foreground">
            Hybrid rules + audit scores (replace with model endpoint when ready).
          </p>
        </div>
      </div>

      {insights.narrative_summary && (
        <p className="text-sm leading-relaxed text-foreground/90">
          {insights.narrative_summary}
        </p>
      )}

      {chartData.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-foreground">
            Risk projection (next 5 years)
          </h3>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} width={32} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid var(--border)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="risk"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Projected risk"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {vuln && (
        <div>
          <h3 className="mb-3 text-sm font-medium text-foreground">
            Disaster vulnerability (0–100)
          </h3>
          <div className="space-y-3">
            {(
              [
                ["Structural", vuln.structural],
                ["Flood", vuln.flood],
                ["Earthquake", vuln.earthquake],
                ["Heat", vuln.heat],
              ] as const
            ).map(([label, val]) => (
              <div key={label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span>{label}</span>
                  <span className="tabular-nums font-medium">{val}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/80"
                    style={{ width: `${Math.min(100, val)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights.weak_structural_areas &&
        insights.weak_structural_areas.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium text-foreground">
              Weak structural focus
            </h3>
            <ul className="space-y-2">
              {insights.weak_structural_areas.map((w, i) => (
                <li
                  key={i}
                  className="flex gap-2 rounded-lg border border-border bg-background/80 px-3 py-2 text-sm"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
                  <div>
                    <p className="font-medium text-foreground">{w.area}</p>
                    <p className="text-muted-foreground">{w.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

      {insights.recommendations && insights.recommendations.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-foreground">
            Recommendations
          </h3>
          <ul className="space-y-2 text-sm">
            {insights.recommendations.map((r) => (
              <li key={r.id || r.text} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {insights.predictions?.[0]?.summary && (
        <p className="text-xs text-muted-foreground">{insights.predictions[0].summary}</p>
      )}

      {typeof insights.confidence === "number" && (
        <div>
          <div className="mb-1 flex justify-between text-xs font-medium text-foreground">
            <span>Confidence</span>
            <span>{Math.round(insights.confidence * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.round(insights.confidence * 100)}%` }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
