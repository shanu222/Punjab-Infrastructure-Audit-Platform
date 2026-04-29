const { assessRiskFromAuditScores } = require('./riskEngine');

const TYPE_WEIGHT = {
  bridge: 1.15,
  dam: 1.2,
  building: 1,
  road: 1.05,
  canal: 1.08,
  power: 1.1,
  water_supply: 1.05,
  other: 1,
};

/**
 * Lightweight rule-based “future approval” risk (mock ML placeholder).
 */
function analyzeFutureSite({ lat, lng, type }) {
  const w = TYPE_WEIGHT[type] || 1;
  const pseudo =
    (Math.abs(Math.sin((lat || 0) * 0.01)) * 35 +
      Math.abs(Math.cos((lng || 0) * 0.01)) * 35 +
      (typeof w === 'number' ? w * 15 : 15)) %
    100;

  const scores = {
    structural: Math.min(100, Math.round(pseudo * w * 0.9)),
    flood: Math.min(100, Math.round(pseudo * 0.85)),
    earthquake: Math.min(100, Math.round(pseudo * 0.8)),
    heat: Math.min(100, Math.round(pseudo * 0.75)),
  };

  const risk = assessRiskFromAuditScores(scores);

  const recommendations = [];
  if (risk.overall_risk === 'HIGH' || risk.overall_risk === 'CRITICAL') {
    recommendations.push('Commission detailed geotechnical and hydrological studies before sanction.');
    recommendations.push('Require independent peer review for structural design assumptions.');
  } else if (risk.overall_risk === 'MODERATE') {
    recommendations.push('Proceed with standard mitigation measures and seasonal inspection schedule.');
  } else {
    recommendations.push('Proceed; maintain routine inspection cadence per state highway/building codes.');
  }
  if (type === 'bridge' || type === 'dam') {
    recommendations.push('Include seismic resilience checklist and scour protection verification.');
  }

  return {
    location: { lat, lng },
    type,
    scores,
    overall_risk: risk.overall_risk,
    composite_index: risk.composite,
    recommendations,
    model: 'rules_v1_mock',
  };
}

module.exports = { analyzeFutureSite };
