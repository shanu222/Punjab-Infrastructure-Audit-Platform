const { calculateRisk } = require('../utils/riskCalculator');

function mapAuditScoresToRiskInput(scores) {
  if (!scores) return null;
  return {
    structural_score: scores.structural,
    flood_score: scores.flood,
    earthquake_score: scores.earthquake,
    heat_score: scores.heat,
  };
}

/**
 * @param {{ structural: number, flood: number, earthquake: number, heat: number }} scores
 */
function assessRiskFromAuditScores(scores) {
  return calculateRisk(mapAuditScoresToRiskInput(scores));
}

/** @deprecated use assessRiskFromAuditScores — kept for callers using flat keys */
function assessRisk(scores) {
  return calculateRisk(scores);
}

module.exports = {
  assessRisk,
  assessRiskFromAuditScores,
  mapAuditScoresToRiskInput,
};
