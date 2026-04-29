const Asset = require('../models/Asset');
const Audit = require('../models/Audit');

async function getDashboardStats(req, res) {
  const [totalAssets, highRiskAssets, riskRows, recentAudits] = await Promise.all([
    Asset.countDocuments(),
    Asset.countDocuments({ risk_score: { $gte: 50 } }),
    Audit.aggregate([{ $group: { _id: '$overall_risk', count: { $sum: 1 } } }]),
    Audit.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('asset_id', 'district type location risk_score')
      .populate('engineer_id', 'name email department')
      .lean(),
  ]);

  const risk_distribution = riskRows.reduce((acc, r) => {
    acc[r._id || 'UNKNOWN'] = r.count;
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      total_assets: totalAssets,
      high_risk_assets: highRiskAssets,
      risk_distribution,
      recent_audits: recentAudits,
    },
  });
}

module.exports = { getDashboardStats };
