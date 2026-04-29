const Asset = require('../models/Asset');
const Audit = require('../models/Audit');
const AppError = require('../utils/AppError');
const mongoose = require('mongoose');
const { assessRiskFromAuditScores } = require('./riskEngine');

const SEVERITY_ORDER = { none: 0, low: 1, moderate: 2, high: 3, critical: 4 };

function severityRank(v) {
  return SEVERITY_ORDER[v] ?? 0;
}

/**
 * Heuristic AI-style payload from latest audit + asset (mock narrative layered on real scores).
 */
async function buildAssetAiInsights(assetId) {
  if (!mongoose.isValidObjectId(assetId)) {
    throw new AppError('Invalid asset id', 400);
  }

  const asset = await Asset.findById(assetId).lean();
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  const latestAudit = await Audit.findOne({ asset_id: assetId })
    .sort({ createdAt: -1 })
    .lean();

  const scores = latestAudit?.scores || null;
  let composite = asset.risk_score;
  if (scores) {
    const r = assessRiskFromAuditScores(scores);
    composite = r.composite;
  }
  if (composite === null || composite === undefined) {
    composite = 28;
  }
  composite = Math.min(100, Math.max(0, Number(composite)));

  const year = new Date().getFullYear();
  const risk_projection = [];
  for (let y = 0; y <= 5; y += 1) {
    const drift = y * (4 + (composite / 100) * 5);
    risk_projection.push({
      year: year + y,
      projected_risk: Math.min(100, Math.round(composite + drift)),
    });
  }

  const disaster_vulnerability = scores
    ? {
        structural: scores.structural,
        flood: scores.flood,
        earthquake: scores.earthquake,
        heat: scores.heat,
      }
    : {
        structural: Math.round(composite * 0.95),
        flood: Math.round(composite * 0.88),
        earthquake: Math.round(composite * 0.82),
        heat: Math.round(composite * 0.75),
      };

  const weak_structural_areas = [];
  const cl = latestAudit?.structural_checklist;
  if (cl) {
    if (severityRank(cl.foundation) >= 2) {
      weak_structural_areas.push({
        area: 'Foundation',
        detail:
          'Checklist indicates elevated foundation concern — prioritize geotechnical review and load path verification.',
      });
    }
    if (severityRank(cl.cracks) >= 2) {
      weak_structural_areas.push({
        area: 'Cracking / deck joints',
        detail:
          'Documented crack severity suggests monitoring and possible retrofit of expansion joints.',
      });
    }
    if (severityRank(cl.load_capacity) >= 2) {
      weak_structural_areas.push({
        area: 'Load capacity',
        detail: 'Rated load margins may be tightening under current traffic assumptions.',
      });
    }
    if (severityRank(cl.corrosion) >= 2) {
      weak_structural_areas.push({
        area: 'Corrosion protection',
        detail: 'Protective systems may be degrading — schedule NDT on primary steel / reinforcement.',
      });
    }
  }
  if (weak_structural_areas.length === 0) {
    weak_structural_areas.push({
      area: 'General structural',
      detail:
        'No severe checklist flags on the latest audit; maintain routine inspection cadence (rules-based guidance).',
    });
  }

  const recommendations = [];
  if (disaster_vulnerability.flood >= 60) {
    recommendations.push({
      id: 'rec-flood-1',
      text: 'Install or verify flood-level sensors and scour protection at vulnerable piers.',
      severity: 'high',
    });
  }
  if (disaster_vulnerability.earthquake >= 55) {
    recommendations.push({
      id: 'rec-seis-1',
      text: 'Schedule seismic capacity screening and bearing restraint review.',
      severity: 'high',
    });
  }
  if (disaster_vulnerability.heat >= 50) {
    recommendations.push({
      id: 'rec-heat-1',
      text: 'Heat-stress cycle: prioritize thermal expansion joints and surfacing integrity.',
      severity: 'moderate',
    });
  }
  recommendations.push({
    id: 'rec-gen-1',
    text: 'Maintain photographic evidence trail and tie each defect to GIS location for trend analysis.',
    severity: 'low',
  });

  const narrative_summary =
    composite >= 70
      ? 'Composite risk is elevated — prioritize capital maintenance planning and targeted structural investigations.'
      : composite >= 45
        ? 'Moderate composite risk — continue periodic audits and address checklist items before next monsoon window.'
        : 'Risk profile is relatively controlled — keep baseline inspection frequency and monitor deltas over time.';

  return {
    generated_at: new Date().toISOString(),
    asset_id: String(asset._id),
    source: 'hybrid_rules_engine',
    confidence: scores ? 0.72 : 0.48,
    narrative_summary,
    risk_projection,
    recommendations,
    weak_structural_areas,
    disaster_vulnerability,
    predictions: [
      {
        horizon_years: 5,
        summary:
          'Projection blends latest audit scores with simple deterioration drift (mock curve — replace with ML service).',
      },
    ],
  };
}

module.exports = { buildAssetAiInsights };
