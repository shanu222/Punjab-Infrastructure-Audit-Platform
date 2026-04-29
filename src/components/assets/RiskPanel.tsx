import { BAND_STYLES, scoreToBand, weightedComposite } from "./riskUtils";

export type ScoreBreakdown = {
  structural: number;
  flood: number;
  earthquake: number;
  heat: number;
} | null;

type Props = {
  overallScore: number | null | undefined;
  /** When present (e.g. latest audit), drives category bars. */
  breakdown: ScoreBreakdown;
};

const ROWS: { key: keyof NonNullable<ScoreBreakdown>; label: string }[] = [
  { key: "structural", label: "Structural" },
  { key: "flood", label: "Flood" },
  { key: "earthquake", label: "Earthquake" },
  { key: "heat", label: "Heat" },
];

export function RiskPanel({ overallScore, breakdown }: Props) {
  const band = scoreToBand(overallScore);
  const style = BAND_STYLES[band] || BAND_STYLES.UNKNOWN;
  const scores =
    breakdown ||
    (typeof overallScore === "number" && !Number.isNaN(overallScore)
      ? {
          structural: overallScore,
          flood: Math.min(100, overallScore + 4),
          earthquake: Math.min(100, overallScore + 2),
          heat: Math.max(0, overallScore - 6),
        }
      : {
          structural: 30,
          flood: 28,
          earthquake: 26,
          heat: 24,
        });

  const displayScore =
    typeof overallScore === "number" && !Number.isNaN(overallScore)
      ? Math.round(overallScore)
      : Math.round(weightedComposite(scores));

  return (
    <section
      className={`rounded-xl border border-border bg-card p-5 shadow-sm ring-2 ${style.ring} transition-shadow`}
    >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Risk score
          </h2>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-5xl font-bold tabular-nums text-foreground">
              {displayScore}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Composite index (higher indicates greater hazard exposure).
          </p>
        </div>
        <div
          className={`flex flex-col items-center justify-center rounded-2xl px-8 py-5 ${style.bg}`}
        >
          <span className={`text-sm font-medium ${style.color}`}>
            Overall band
          </span>
          <span className={`mt-1 text-2xl font-semibold ${style.color}`}>
            {style.label}
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Category breakdown</h3>
        {ROWS.map(({ key, label }) => {
          const v = Math.min(100, Math.max(0, Number(scores[key]) || 0));
          return (
            <div key={key}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="font-medium text-foreground">{label}</span>
                <span className="tabular-nums text-muted-foreground">{v}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${v}%` }}
                />
              </div>
            </div>
          );
        })}
        {!breakdown && (
          <p className="text-xs text-muted-foreground">
            No scored audit on file — showing estimated category spread from the
            composite score.
          </p>
        )}
      </div>
    </section>
  );
}
