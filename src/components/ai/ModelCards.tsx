import { Droplets, Mountain, ThermometerSun } from "lucide-react";
import { motion } from "motion/react";
import type { DisasterModels } from "./types";

type Props = {
  models: DisasterModels | null | undefined;
};

export function ModelCards({ models }: Props) {
  const f = models?.flood;
  const e = models?.earthquake;
  const h = models?.heat;

  const cards = [
    {
      key: "flood",
      title: "Flood model",
      icon: Droplets,
      accent: "from-sky-500/20 to-sky-600/5 border-sky-500/30",
      iconClass: "text-sky-600",
      primary: f?.risk_percent != null ? `${f.risk_percent}%` : "—",
      sub: "Composite flood pressure",
      lines: [
        `Affected assets (6 mo): ${f?.affected_assets ?? "—"}`,
        `Trend: ${f?.trend ?? "—"}`,
        `Avg flood score: ${f?.avg_score ?? "—"}`,
      ],
    },
    {
      key: "eq",
      title: "Earthquake model",
      icon: Mountain,
      accent: "from-red-500/20 to-red-600/5 border-red-500/30",
      iconClass: "text-red-600",
      primary:
        e?.vulnerability_score != null ? `${e.vulnerability_score}` : "—",
      sub: "Vulnerability index",
      lines: [
        `High-risk structures (12 mo): ${e?.high_risk_structures ?? "—"}`,
        `Trend: ${e?.trend ?? "—"}`,
        `Avg seismic score: ${e?.avg_score ?? "—"}`,
      ],
    },
    {
      key: "heat",
      title: "Heat model",
      icon: ThermometerSun,
      accent: "from-amber-500/20 to-amber-600/5 border-amber-500/30",
      iconClass: "text-amber-600",
      primary: h?.stress_level != null ? `${h.stress_level}` : "—",
      sub: "Infrastructure stress (0–100)",
      lines: [
        `Trend: ${h?.trend ?? "—"}`,
        `Avg heat score: ${h?.avg_score ?? "—"}`,
      ],
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((c, i) => (
        <motion.div
          key={c.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className={`rounded-xl border bg-gradient-to-br p-5 shadow-sm ${c.accent}`}
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="rounded-lg bg-background/80 p-2">
              <c.icon className={`size-5 ${c.iconClass}`} />
            </div>
            <h3 className="font-semibold text-foreground">{c.title}</h3>
          </div>
          <p className="text-3xl font-bold tabular-nums text-foreground">{c.primary}</p>
          <p className="text-xs text-muted-foreground">{c.sub}</p>
          <ul className="mt-4 space-y-1.5 border-t border-border/60 pt-3 text-xs text-foreground/90">
            {c.lines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
