/**
 * Hazard / vulnerability scores are on a 0–100 scale where **higher = worse** (more risk).
 * Weighted composite drives overall band for reporting.
 */
const WEIGHTS = {
  structural_score: 0.35,
  flood_score: 0.25,
  earthquake_score: 0.25,
  heat_score: 0.15,
};

const LEVELS = {
  SAFE: 'SAFE',
  MODERATE: 'MODERATE',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

function clampScore(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 0;
  return Math.min(100, Math.max(0, x));
}

/**
 * @param {object} scores
 * @param {number} scores.structural_score
 * @param {number} scores.flood_score
 * @param {number} scores.earthquake_score
 * @param {number} scores.heat_score
 * @returns {{ overall_risk: string, composite: number, weights: typeof WEIGHTS }}
 */
function calculateRisk(scores) {
  const structural_score = clampScore(scores.structural_score);
  const flood_score = clampScore(scores.flood_score);
  const earthquake_score = clampScore(scores.earthquake_score);
  const heat_score = clampScore(scores.heat_score);

  const composite =
    structural_score * WEIGHTS.structural_score +
    flood_score * WEIGHTS.flood_score +
    earthquake_score * WEIGHTS.earthquake_score +
    heat_score * WEIGHTS.heat_score;

  let overall_risk;
  if (composite < 25) overall_risk = LEVELS.SAFE;
  else if (composite < 50) overall_risk = LEVELS.MODERATE;
  else if (composite < 75) overall_risk = LEVELS.HIGH;
  else overall_risk = LEVELS.CRITICAL;

  return {
    overall_risk,
    composite: Math.round(composite * 100) / 100,
    weights: { ...WEIGHTS },
  };
}

module.exports = { calculateRisk, WEIGHTS, LEVELS };
