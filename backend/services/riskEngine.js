const { calculateRisk } = require('../utils/riskCalculator');

/**
 * Domain service for hazard scoring — central place to swap in ML/regulatory models later.
 * @param {object} scores
 * @returns {{ overall_risk: string, composite: number, weights: object }}
 */
function assessRisk(scores) {
  return calculateRisk(scores);
}

module.exports = { assessRisk };
