const Asset = require('../models/Asset');
const Audit = require('../models/Audit');
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

const NEARBY_KM = 5;
const NEARBY_FALLBACK_KM = 25;
const ASSET_QUERY_CAP = 1200;

/**
 * @param {number} lat1
 * @param {number} lng1
 * @param {number} lat2
 * @param {number} lng2
 * @returns {number}
 */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * @param {number} score 0–100 hazard (higher = worse)
 * @returns {string}
 */
function scoreToHazardLevel(score) {
  const s = Math.min(100, Math.max(0, Number(score) || 0));
  if (s < 25) return 'Low';
  if (s < 50) return 'Moderate';
  if (s < 75) return 'High';
  return 'Critical';
}

/**
 * @param {{ lat: number, lng: number, type: string }} p
 * @returns {{ structural: number, flood: number, earthquake: number, heat: number }}
 */
function basePseudoScores({ lat, lng, type }) {
  const w = TYPE_WEIGHT[type] || 1;
  const pseudo =
    (Math.abs(Math.sin((lat || 0) * 0.01)) * 35 +
      Math.abs(Math.cos((lng || 0) * 0.01)) * 35 +
      (typeof w === 'number' ? w * 15 : 15)) %
    100;

  return {
    structural: Math.min(100, Math.round(pseudo * w * 0.9)),
    flood: Math.min(100, Math.round(pseudo * 0.85)),
    earthquake: Math.min(100, Math.round(pseudo * 0.8)),
    heat: Math.min(100, Math.round(pseudo * 0.75)),
  };
}

/**
 * @param {string} material
 * @param {string} structuralType
 * @param {{ structural: number, flood: number, earthquake: number, heat: number }} scores
 */
function adjustScoresForDesign(material, structuralType, scores) {
  const m = String(material || '').toLowerCase();
  const s = String(structuralType || '').toLowerCase();
  const out = { ...scores };

  if (m.includes('brick') && !m.includes('reinforced')) {
    out.structural = Math.min(100, out.structural + 10);
    out.earthquake = Math.min(100, out.earthquake + 6);
  }
  if (m.includes('steel') && m.includes('galvan')) {
    out.structural = Math.min(100, out.structural + 4);
  }
  if (s.includes('masonry') || s.includes('unreinforced')) {
    out.earthquake = Math.min(100, out.earthquake + 12);
  }
  if (s.includes('suspension') || s.includes('cable-stayed')) {
    out.structural = Math.min(100, out.structural + 5);
  }
  if (m.includes('timber') || m.includes('wood')) {
    out.flood = Math.min(100, out.flood + 8);
    out.heat = Math.min(100, out.heat + 6);
  }

  return out;
}

/**
 * @param {object} doc
 * @param {number} lat
 * @param {number} lng
 */
function assetDistanceKm(doc, lat, lng) {
  if (!doc.location || doc.location.lat == null || doc.location.lng == null) return Infinity;
  return haversineKm(lat, lng, doc.location.lat, doc.location.lng);
}

/**
 * Full future-project assessment using nearby audit/asset context.
 * @param {{
 *   project_name: string,
 *   type: string,
 *   location: { lat: number, lng: number },
 *   district: string,
 *   material: string,
 *   structural_type: string,
 * }} input
 */
async function analyzeFutureProject(input) {
  const { project_name, type, location, district, material, structural_type } = input;
  const lat = Number(location.lat);
  const lng = Number(location.lng);

  const candidates = await Asset.find({})
    .select('type location district risk_score is_flagged_critical')
    .limit(ASSET_QUERY_CAP)
    .lean();

  function within(km) {
    return candidates
      .map((a) => ({
        doc: a,
        km: assetDistanceKm(a, lat, lng),
      }))
      .filter((x) => x.km <= km)
      .sort((a, b) => a.km - b.km);
  }

  let ring = within(NEARBY_KM);
  if (ring.length === 0) {
    ring = within(NEARBY_FALLBACK_KM);
  }

  const nearbyDocs = ring.map((x) => x.doc);
  const nearby_assets = ring.slice(0, 40).map((x) => ({
    id: String(x.doc._id),
    type: x.doc.type,
    district: x.doc.district,
    distance_km: Math.round(x.km * 100) / 100,
    risk_score: x.doc.risk_score,
    is_flagged_critical: Boolean(x.doc.is_flagged_critical),
    lat: x.doc.location?.lat,
    lng: x.doc.location?.lng,
  }));

  const riskVals = nearbyDocs.map((a) => a.risk_score).filter((v) => v != null && !Number.isNaN(Number(v)));
  const average_area_risk =
    riskVals.length > 0 ? Math.round((riskVals.reduce((acc, v) => acc + Number(v), 0) / riskVals.length) * 100) / 100 : null;

  const assetIds = nearbyDocs.map((a) => a._id);
  let recentAudits = [];
  if (assetIds.length > 0) {
    recentAudits = await Audit.find({ asset_id: { $in: assetIds } })
      .sort({ createdAt: -1 })
      .limit(250)
      .select('overall_risk asset_id createdAt')
      .lean();
  }

  const highCriticalAudits = recentAudits.filter((a) => a.overall_risk === 'HIGH' || a.overall_risk === 'CRITICAL');
  const high_critical_audit_count = highCriticalAudits.length;

  let scores = basePseudoScores({ lat, lng, type });
  scores = adjustScoresForDesign(material, structural_type, scores);

  if (average_area_risk != null) {
    const blend = 0.38;
    scores.structural = Math.min(100, Math.round(scores.structural * (1 - blend) + average_area_risk * blend));
    scores.flood = Math.min(100, Math.round(scores.flood * (1 - blend * 0.9) + average_area_risk * blend * 0.9));
    scores.earthquake = Math.min(100, Math.round(scores.earthquake * (1 - blend * 0.85) + average_area_risk * blend * 0.85));
    scores.heat = Math.min(100, Math.round(scores.heat * (1 - blend * 0.5) + average_area_risk * blend * 0.5));
  }

  const auditPressure = Math.min(25, high_critical_audit_count * 4);
  scores.flood = Math.min(100, scores.flood + Math.round(auditPressure * 0.45));
  scores.earthquake = Math.min(100, scores.earthquake + Math.round(auditPressure * 0.35));
  scores.structural = Math.min(100, scores.structural + Math.round(auditPressure * 0.25));

  nearbyDocs.forEach((a) => {
    if (a.is_flagged_critical) {
      scores.structural = Math.min(100, scores.structural + 3);
      scores.flood = Math.min(100, scores.flood + 2);
    }
  });

  const risk = assessRiskFromAuditScores(scores);

  const flood_risk = { score: scores.flood, level: scoreToHazardLevel(scores.flood) };
  const earthquake_risk = { score: scores.earthquake, level: scoreToHazardLevel(scores.earthquake) };
  const heat_risk = { score: scores.heat, level: scoreToHazardLevel(scores.heat) };

  const recommendations = [];
  if (flood_risk.score >= 55) {
    recommendations.push('Increase finished floor elevation by at least 0.6 m (≈2 ft) above design flood level or relocate out of active floodplain.');
    recommendations.push('Install perimeter drainage, backflow prevention on utilities, and stage construction outside monsoon peaks.');
  }
  if (earthquake_risk.score >= 55) {
    recommendations.push('Use reinforced concrete not below grade M30 for primary frames; verify ductile detailing per seismic code.');
    recommendations.push('Commission site-specific seismic hazard study if soil class is D/E or structure is importance level IV.');
  }
  if (heat_risk.score >= 50) {
    recommendations.push('Specify heat-reflective roofing, passive ventilation, and thermal expansion joints for long spans.');
  }
  if (type === 'bridge' || type === 'dam') {
    recommendations.push('Complete scour assessment, seismic bearings check, and independent peer review before construction sanction.');
  }
  if (high_critical_audit_count >= 3) {
    recommendations.push('Elevated historical failure density nearby: tighten inspection during construction and mandate third-party QA/QC.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Proceed with standard provincial codes; maintain annual structural and hydrology review cadence.');
  }

  let approval_status = 'APPROVED';
  if (risk.overall_risk === 'CRITICAL' || risk.composite >= 82) {
    approval_status = 'REJECTED';
  } else if (
    risk.overall_risk === 'HIGH' ||
    risk.composite >= 58 ||
    high_critical_audit_count >= 2 ||
    (average_area_risk != null && average_area_risk >= 62)
  ) {
    approval_status = 'APPROVED_WITH_CONDITIONS';
  }

  let recommendation =
    approval_status === 'REJECTED'
      ? 'Composite hazard and/or local audit history exceed acceptable thresholds for unconditional sanction.'
      : approval_status === 'APPROVED_WITH_CONDITIONS'
        ? 'Sanction may proceed subject to mitigation measures, peer review, and compliance monitoring described in recommendations.'
        : 'Location and design envelope align with tolerable risk for routine sanction under current evidence.';

  if (nearby_assets.length === 0) {
    recommendation += ' Note: sparse registered infrastructure nearby — field verification is still required.';
  }

  const approval_explanation = [
    `Overall band: ${risk.overall_risk} (composite ${risk.composite}).`,
    nearby_assets.length
      ? `${nearby_assets.length} registered assets within analysis radius; mean area risk index ${average_area_risk ?? 'n/a'}.`
      : 'No registered assets within primary search radius.',
    high_critical_audit_count
      ? `${high_critical_audit_count} high/critical historical audits linked to nearby assets.`
      : 'No high/critical audits recorded for nearby assets in the sampled window.',
  ].join(' ');

  return {
    project_name,
    district,
    material,
    structural_type,
    location: { lat, lng },
    type,
    flood_risk,
    earthquake_risk,
    heat_risk,
    structural_score: scores.structural,
    nearby_assets,
    historical: {
      average_area_risk,
      high_critical_audit_count,
      audits_sampled: recentAudits.length,
      nearby_asset_count: nearby_assets.length,
    },
    recommendation,
    recommendations,
    approval_status,
    approval_explanation,
    overall_risk: risk.overall_risk,
    composite_index: risk.composite,
    model: 'rules_geo_v2',
  };
}

module.exports = {
  analyzeFutureProject,
  haversineKm,
  scoreToHazardLevel,
};
