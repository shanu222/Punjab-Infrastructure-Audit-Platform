/**
 * Mirrors backend `utils/riskCalculator.js` (composite → SAFE…CRITICAL).
 */
export type RiskBand = "SAFE" | "MODERATE" | "HIGH" | "CRITICAL";

export type AuditScores = {
  structural: number;
  flood: number;
  earthquake: number;
  heat: number;
};

const WEIGHTS = {
  structural_score: 0.35,
  flood_score: 0.25,
  earthquake_score: 0.25,
  heat_score: 0.15,
} as const;

function clampScore(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

export function assessRiskFromScores(scores: AuditScores): {
  overall_risk: RiskBand;
  composite: number;
} {
  const structural_score = clampScore(scores.structural);
  const flood_score = clampScore(scores.flood);
  const earthquake_score = clampScore(scores.earthquake);
  const heat_score = clampScore(scores.heat);

  const composite =
    structural_score * WEIGHTS.structural_score +
    flood_score * WEIGHTS.flood_score +
    earthquake_score * WEIGHTS.earthquake_score +
    heat_score * WEIGHTS.heat_score;

  let overall_risk: RiskBand;
  if (composite < 25) overall_risk = "SAFE";
  else if (composite < 50) overall_risk = "MODERATE";
  else if (composite < 75) overall_risk = "HIGH";
  else overall_risk = "CRITICAL";

  return {
    overall_risk,
    composite: Math.round(composite * 100) / 100,
  };
}

/** Backend severity enum */
export type Severity = "none" | "low" | "moderate" | "high" | "critical";

const SEVERITY_TO_SCORE: Record<Severity, number> = {
  none: 14,
  low: 34,
  moderate: 56,
  high: 79,
  critical: 93,
};

export function severityToScore(s: Severity): number {
  return SEVERITY_TO_SCORE[s] ?? 14;
}

export type StructuralUi = {
  cracks: "none" | "minor" | "major" | null;
  foundation: "stable" | "weak" | "critical" | null;
  load_capacity: "adequate" | "reduced" | "unsafe" | null;
  corrosion: "none" | "moderate" | "severe" | null;
};

export function structuralUiToChecklist(
  ui: StructuralUi,
): Record<string, Severity> | null {
  if (!ui.cracks || !ui.foundation || !ui.load_capacity || !ui.corrosion) {
    return null;
  }
  const cracks: Severity =
    ui.cracks === "none" ? "none" : ui.cracks === "minor" ? "low" : "high";
  const foundation: Severity =
    ui.foundation === "stable"
      ? "none"
      : ui.foundation === "weak"
        ? "moderate"
        : "critical";
  const load_capacity: Severity =
    ui.load_capacity === "adequate"
      ? "none"
      : ui.load_capacity === "reduced"
        ? "moderate"
        : "critical";
  const corrosion: Severity =
    ui.corrosion === "none"
      ? "none"
      : ui.corrosion === "moderate"
        ? "moderate"
        : "high";
  return { cracks, foundation, load_capacity, corrosion };
}

export function structuralScoreFromChecklist(
  checklist: Record<string, Severity>,
): number {
  const vals = [
    severityToScore(checklist.cracks as Severity),
    severityToScore(checklist.foundation as Severity),
    severityToScore(checklist.load_capacity as Severity),
    severityToScore(checklist.corrosion as Severity),
  ];
  return Math.round(vals.reduce((a, b) => a + b, 0) / 4);
}

export type DisasterUi = {
  flood: "safe" | "moderate" | "high" | null;
  earthquake: "resistant" | "vulnerable" | "critical" | null;
  heat: "stable" | "weak" | "failing" | null;
};

export function disasterUiToAssessment(
  ui: DisasterUi,
): Record<string, Severity> | null {
  if (!ui.flood || !ui.earthquake || !ui.heat) return null;
  const flood: Severity =
    ui.flood === "safe" ? "none" : ui.flood === "moderate" ? "moderate" : "high";
  const earthquake: Severity =
    ui.earthquake === "resistant"
      ? "none"
      : ui.earthquake === "vulnerable"
        ? "moderate"
        : "critical";
  const heat: Severity =
    ui.heat === "stable" ? "none" : ui.heat === "weak" ? "moderate" : "high";
  return { flood, earthquake, heat };
}

export function disasterScoresFromAssessment(
  d: Record<string, Severity>,
): Pick<AuditScores, "flood" | "earthquake" | "heat"> {
  return {
    flood: severityToScore(d.flood as Severity),
    earthquake: severityToScore(d.earthquake as Severity),
    heat: severityToScore(d.heat as Severity),
  };
}

export function buildScores(
  structural: number,
  disaster: Pick<AuditScores, "flood" | "earthquake" | "heat">,
): AuditScores {
  return {
    structural,
    flood: disaster.flood,
    earthquake: disaster.earthquake,
    heat: disaster.heat,
  };
}

export function aiAssistWarnings(
  checklist: Record<string, Severity> | null,
  scores: AuditScores | null,
): string[] {
  const lines: string[] = [];
  if (checklist) {
    if (["high", "critical"].includes(checklist.foundation)) {
      lines.push("High foundation risk — verify bearing capacity and scour protection.");
    }
    if (["high", "critical"].includes(checklist.cracks)) {
      lines.push("Crack severity elevated — document with photos and monitor propagation.");
    }
    if (["high", "critical"].includes(checklist.load_capacity)) {
      lines.push("Load path concern — consider traffic restriction until reviewed.");
    }
  }
  if (scores) {
    const { composite } = assessRiskFromScores(scores);
    if (composite >= 65) {
      lines.push("Composite risk is elevated for this submission — peer review recommended.");
    }
  }
  return lines;
}
