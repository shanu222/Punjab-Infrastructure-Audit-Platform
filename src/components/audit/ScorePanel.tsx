import { RiskBadge } from "@/app/components/RiskBadge";
import type { AuditScores } from "@/utils/auditScoring";
import { assessRiskFromScores } from "@/utils/auditScoring";

type Props = {
  scores: AuditScores | null;
};

function bandToBadge(
  b: string,
): "safe" | "moderate" | "high" | "critical" {
  const u = b.toLowerCase();
  if (u === "safe") return "safe";
  if (u === "high") return "high";
  if (u === "critical") return "critical";
  return "moderate";
}

export function ScorePanel({ scores }: Props) {
  if (!scores) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
        Complete structural and disaster sections to compute live scores.
      </div>
    );
  }

  const { composite, overall_risk } = assessRiskFromScores(scores);

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Live composite
          </p>
          <p className="text-3xl font-bold tabular-nums text-foreground">
            {composite}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground">Overall band</span>
          <RiskBadge level={bandToBadge(overall_risk)} size="lg" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(
          [
            ["Structural", scores.structural],
            ["Flood", scores.flood],
            ["Earthquake", scores.earthquake],
            ["Heat", scores.heat],
          ] as const
        ).map(([label, v]) => (
          <div
            key={label}
            className="rounded-lg border border-border bg-muted/20 px-2 py-2 text-center"
          >
            <p className="text-[10px] font-medium uppercase text-muted-foreground">
              {label}
            </p>
            <p className="text-lg font-semibold tabular-nums">{Math.round(v)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
