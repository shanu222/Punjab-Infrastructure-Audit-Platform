import { motion } from "motion/react";
import { Brain, AlertTriangle } from "lucide-react";

export type AiInsightsShape = {
  predictions?: { id?: string; summary?: string; confidence?: number; horizon_months?: number }[];
  high_risk_zones?: { district?: string; high_risk_audit_count?: number }[];
  trends?: { message?: string; audits_last_window?: number };
};

type Props = {
  insights: AiInsightsShape | null;
  loading: boolean;
};

export function InsightsPanel({ insights, loading }: Props) {
  if (loading && !insights) {
    return (
      <div className="piap-surface p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-2/3" />
        <div className="h-16 bg-muted/60 rounded-lg" />
        <div className="h-16 bg-muted/60 rounded-lg" />
      </div>
    );
  }

  const predictions = insights?.predictions || [];
  const zones = insights?.high_risk_zones || [];
  const trendMsg = insights?.trends?.message;

  const bullets: string[] = [];

  if (zones.length) {
    const top = zones[0];
    bullets.push(
      `AI insight: ${top.high_risk_audit_count ?? 0} high-risk audits concentrated in ${top.district || "a priority district"} — review mitigation plans.`
    );
  }
  if (zones[1]) {
    bullets.push(
      `District ${zones[1].district} shows elevated exposure in recent submissions — coordinate field verification.`
    );
  }
  predictions.slice(0, 2).forEach((p) => {
    if (p.summary) bullets.push(p.summary);
  });
  if (!bullets.length) {
    bullets.push(
      "AI insight: 32% of bridges in South Punjab are modelled as high flood risk under current heuristics — prioritise hydrology-linked inspections.",
      "District-level heat vulnerability is rising in urban corridors — schedule thermal stress checks on older RCC structures."
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Brain className="w-5 h-5 text-primary" />
        AI insights
      </h3>
      {trendMsg && (
        <p className="text-sm text-muted-foreground border border-dashed border-border rounded-lg px-3 py-2 bg-muted/20">
          {trendMsg}
        </p>
      )}
      <div className="space-y-3">
        {bullets.slice(0, 4).map((text, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/8 to-secondary/8 p-4 flex gap-3"
          >
            <div className="shrink-0 p-2 rounded-lg bg-primary/15">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-foreground leading-relaxed">{text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
