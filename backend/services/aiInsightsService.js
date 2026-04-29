const Audit = require('../models/Audit');
const Asset = require('../models/Asset');

/**
 * Dashboard + AI panel: mix of live aggregates and structured mock predictions (replace with Lambda/ML later).
 */
async function buildInsights() {
  const [byRisk, districtAgg, recentAudits, assetCount] = await Promise.all([
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
  ]);

  const risk_distribution = byRisk.reduce((acc, r) => {
    acc[r._id] = r.count;
    return acc;
  }, {});

  const high_risk_zones = districtAgg.map((d) => ({
    district: d._id,
    high_risk_audit_count: d.high_risk_audits,
  }));

  return {
    generated_at: new Date().toISOString(),
    total_assets: assetCount,
    risk_distribution,
    high_risk_zones,
    recent_audits: recentAudits,
    trends: {
      message:
        'Trend analytics will connect to time-series storage; current counts reflect live MongoDB aggregates.',
      audits_last_window: recentAudits.length,
    },
    predictions: [
      {
        id: 'pred-mock-1',
        horizon_months: 12,
        summary:
          'Districts with repeated HIGH/CRITICAL structural scores should expect accelerated deterioration under monsoon loading (mock heuristic).',
        confidence: 0.42,
        source: 'mock_rules_engine',
      },
      {
        id: 'pred-mock-2',
        horizon_months: 24,
        summary:
          'Heat-stress dominated audits correlate with expansion joint failures on older RCC bridges — prioritize thermal inspection cycles (mock).',
        confidence: 0.38,
        source: 'mock_rules_engine',
      },
    ],
  };
}

module.exports = { buildInsights };
