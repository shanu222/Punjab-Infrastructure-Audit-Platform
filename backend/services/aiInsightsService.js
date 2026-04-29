const Audit = require('../models/Audit');
const Asset = require('../models/Asset');

const MONTHS_LOOKBACK = 14;

function monthsAgo(n) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

function linearProject(series, monthsAhead) {
  if (!series || series.length === 0) return [];
  if (series.length === 1) {
    const v = series[0].risk_index || 0;
    return Array.from({ length: monthsAhead }, (_, i) => ({
      period: `proj+${i + 1}m`,
      label: `+${i + 1} mo (proj.)`,
      risk_index: Math.min(100, Math.round(v + (i + 1) * 1.2)),
      projected: true,
    }));
  }
  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  const dr = (last.risk_index || 0) - (prev.risk_index || 0);
  const out = [];
  for (let i = 1; i <= monthsAhead; i += 1) {
    const projected = Math.min(
      100,
      Math.max(0, Math.round((last.risk_index || 0) + dr * i * 0.65)),
    );
    out.push({
      period: `proj+${i}m`,
      label: `+${i} mo (proj.)`,
      risk_index: projected,
      projected: true,
    });
  }
  return out;
}

function buildRecommendations({
  highRiskZones,
  weakTypes,
  avgFlood,
  avgEq,
  avgHeat,
  bridgeFloodShare,
}) {
  const recs = [];
  if (highRiskZones[0]?.district) {
    recs.push({
      id: 'rec-district-priority',
      text: `Prioritize capital works and inspection cadence in ${highRiskZones[0].district} where HIGH/CRITICAL audits cluster.`,
      priority: 'high',
    });
  }
  if (avgFlood >= 58) {
    recs.push({
      id: 'rec-flood-elevation',
      text: 'Increase freeboard and drainage capacity in flood-exposed corridors; tie designs to updated hydrology scenarios.',
      priority: 'high',
    });
  }
  if (avgEq >= 55) {
    recs.push({
      id: 'rec-seismic-rc',
      text: 'Use ductile reinforced concrete detailing and bearing restraints in high-seismic districts; verify lap splices on older stock.',
      priority: 'high',
    });
  }
  if (avgHeat >= 52) {
    recs.push({
      id: 'rec-heat-thermal',
      text: 'Schedule thermal expansion joint surveys on urban RCC bridges — heat-stress audits are trending upward.',
      priority: 'medium',
    });
  }
  if (weakTypes[0]?._id) {
    recs.push({
      id: 'rec-weak-type',
      text: `Asset type “${weakTypes[0]._id}” is over-represented in severe outcomes — publish type-specific maintenance playbooks.`,
      priority: 'medium',
    });
  }
  if (bridgeFloodShare >= 0.28) {
    recs.push({
      id: 'rec-bridge-scour',
      text: 'For bridges with rising flood scores, commission scour countermeasures and pier protection reviews before monsoon.',
      priority: 'high',
    });
  }
  recs.push({
    id: 'rec-governance',
    text: 'Maintain photographic baselines and GIS-linked defect IDs so year-on-year deltas feed the risk models.',
    priority: 'low',
  });
  return recs;
}

/**
 * Aggregated intelligence for dashboards (rules + MongoDB). Replace core with ML service when ready.
 */
async function generateInsights() {
  const since = monthsAgo(MONTHS_LOOKBACK);

  const [
    byRisk,
    districtAgg,
    recentAudits,
    assetCount,
    monthlyTrend,
    weakTypes,
    avgScores,
  ] = await Promise.all([
    Audit.aggregate([
      { $group: { _id: '$overall_risk', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Audit.aggregate([
      {
        $lookup: {
          from: 'assets',
          localField: 'asset_id',
          foreignField: '_id',
          as: 'asset',
        },
      },
      { $unwind: '$asset' },
      { $match: { overall_risk: { $in: ['HIGH', 'CRITICAL'] } } },
      {
        $group: {
          _id: '$asset.district',
          high_risk_audits: { $sum: 1 },
        },
      },
      { $sort: { high_risk_audits: -1 } },
      { $limit: 12 },
    ]),
    Audit.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('asset_id', 'district type location')
      .populate('engineer_id', 'name email')
      .lean(),
    Asset.countDocuments(),
    Audit.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $addFields: {
          composite: {
            $add: [
              { $multiply: ['$scores.structural', 0.35] },
              { $multiply: ['$scores.flood', 0.25] },
              { $multiply: ['$scores.earthquake', 0.25] },
              { $multiply: ['$scores.heat', 0.15] },
            ],
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          risk_index: { $avg: '$composite' },
          submissions: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Audit.aggregate([
      {
        $lookup: {
          from: 'assets',
          localField: 'asset_id',
          foreignField: '_id',
          as: 'asset',
        },
      },
      { $unwind: '$asset' },
      { $match: { overall_risk: { $in: ['HIGH', 'CRITICAL'] } } },
      { $group: { _id: '$asset.type', cnt: { $sum: 1 } } },
      { $sort: { cnt: -1 } },
      { $limit: 8 },
    ]),
    Audit.aggregate([
      { $match: { createdAt: { $gte: monthsAgo(6) } } },
      {
        $group: {
          _id: null,
          avg_flood: { $avg: '$scores.flood' },
          avg_eq: { $avg: '$scores.earthquake' },
          avg_heat: { $avg: '$scores.heat' },
          avg_struct: { $avg: '$scores.structural' },
        },
      },
    ]),
  ]);

  const bridgeStats = await Audit.aggregate([
    { $match: { createdAt: { $gte: monthsAgo(12) } } },
    {
      $lookup: {
        from: 'assets',
        localField: 'asset_id',
        foreignField: '_id',
        as: 'asset',
      },
    },
    { $unwind: '$asset' },
    { $match: { 'asset.type': 'bridge' } },
    {
      $facet: {
        highFlood: [
          { $match: { 'scores.flood': { $gte: 55 } } },
          { $count: 'c' },
        ],
        all: [{ $count: 'c' }],
      },
    },
  ]);
  const bridgeFloodCount = bridgeStats[0]?.highFlood[0]?.c || 0;
  const bDenom = bridgeStats[0]?.all[0]?.c || 0;
  const bridgeFloodPct = bDenom ? Math.round((bridgeFloodCount / bDenom) * 100) : 0;
  const bridgeFloodShare = bridgeFloodPct / 100;

  const risk_distribution = byRisk.reduce((acc, r) => {
    acc[r._id] = r.count;
    return acc;
  }, {});

  const high_risk_zones = districtAgg.map((d) => ({
    district: d._id,
    high_risk_audit_count: d.high_risk_audits,
  }));

  const series = (monthlyTrend || []).map((m) => ({
    period: m._id,
    label: m._id,
    risk_index: Math.round((m.risk_index || 0) * 10) / 10,
    submissions: m.submissions || 0,
    projected: false,
  }));

  const projection = linearProject(series, 6);

  const av = avgScores[0] || {};
  const avgFlood = Math.round((av.avg_flood || 0) * 10) / 10;
  const avgEq = Math.round((av.avg_eq || 0) * 10) / 10;
  const avgHeat = Math.round((av.avg_heat || 0) * 10) / 10;
  const avgStruct = Math.round((av.avg_struct || 0) * 10) / 10;

  const floodRiskPct = Math.min(100, Math.round(avgFlood * 0.92 + bridgeFloodShare * 18));
  const eqVuln = Math.min(100, Math.round(avgEq * 0.88 + (weakTypes[0]?.cnt || 0) * 2));
  const heatStress = Math.min(100, Math.round(avgHeat * 0.9 + 8));

  const highRiskStructures = await Audit.countDocuments({
    overall_risk: { $in: ['HIGH', 'CRITICAL'] },
    createdAt: { $gte: monthsAgo(12) },
  });

  const floodAffectedAssets = await Audit.distinct('asset_id', {
    'scores.flood': { $gte: 55 },
    createdAt: { $gte: monthsAgo(6) },
  }).then((a) => a.length);

  const recommendations = buildRecommendations({
    highRiskZones: high_risk_zones,
    weakTypes,
    avgFlood,
    avgEq,
    avgHeat,
    bridgeFloodShare,
  });

  const insight_headlines = [];
  if (bridgeFloodPct >= 20) {
    insight_headlines.push(
      `${bridgeFloodPct}% of bridge audits in the last 12 months show elevated flood vulnerability scores.`,
    );
  } else {
    insight_headlines.push(
      'Flood scores on bridges remain a watch item — continue tying inspections to catchment updates.',
    );
  }
  if (avgHeat >= 52) {
    insight_headlines.push(
      'Heat stress is rising in urban audit corridors — prioritize thermal performance on older RCC stock.',
    );
  } else {
    insight_headlines.push(
      'Urban heat exposure is within model tolerance but should be tracked seasonally.',
    );
  }
  if (high_risk_zones[0]?.district) {
    insight_headlines.push(
      `${high_risk_zones[0].district} leads current HIGH/CRITICAL audit concentration — align regional response.`,
    );
  }

  const predictions = [
    {
      id: 'pred-1',
      horizon_months: 12,
      summary:
        'Districts with repeated HIGH/CRITICAL structural composites should expect accelerated deterioration under monsoon loading (rules engine).',
      confidence: 0.44,
      source: 'aggregate_rules_v1',
    },
    {
      id: 'pred-2',
      horizon_months: 24,
      summary:
        'Heat-dominated score profiles correlate with expansion joint fatigue on older bridges — tighten thermal inspection windows (rules engine).',
      confidence: 0.39,
      source: 'aggregate_rules_v1',
    },
  ];

  return {
    generated_at: new Date().toISOString(),
    total_assets: assetCount,
    risk_distribution,
    high_risk_zones,
    recent_audits: recentAudits,
    trends: {
      message:
        'Series below is derived from monthly mean composite risk (0–100) of submitted audits. Projection is a simple drift model for decision support — not a certified forecast.',
      audits_last_window: recentAudits.length,
      series,
      projection,
    },
    predictions,
    recommendations,
    disaster_models: {
      flood: {
        risk_percent: floodRiskPct,
        affected_assets: floodAffectedAssets,
        trend:
          avgFlood >= 55
            ? 'Worsening (6 mo window)'
            : avgFlood >= 40
              ? 'Stable — watchlist'
              : 'Improving / low volume',
        avg_score: avgFlood,
      },
      earthquake: {
        vulnerability_score: eqVuln,
        high_risk_structures: highRiskStructures,
        trend: avgEq >= 55 ? 'Elevated' : 'Moderate',
        avg_score: avgEq,
      },
      heat: {
        stress_level: heatStress,
        trend: avgHeat >= 52 ? 'Urban heat pressure' : 'Within tolerance',
        avg_score: avgHeat,
      },
    },
    insight_headlines,
    weak_infrastructure_types: weakTypes.map((w) => ({
      type: w._id,
      high_severity_audit_count: w.cnt,
    })),
    summary_metrics: {
      avg_structural: avgStruct,
      avg_flood: avgFlood,
      avg_earthquake: avgEq,
      avg_heat: avgHeat,
    },
  };
}

async function buildInsights() {
  return generateInsights();
}

module.exports = { buildInsights, generateInsights };
