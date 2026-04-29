const mongoose = require('mongoose');
const Asset = require('../models/Asset');
const Audit = require('../models/Audit');

function normRiskKey(k) {
  if (!k) return null;
  return String(k).toUpperCase();
}

async function getDashboardStats(req, res) {
  const userId = req.user.id;
  const role = req.user.role;
  const engineerOnly = role === 'engineer';

  const matchAudits = engineerOnly
    ? { engineer_id: new mongoose.Types.ObjectId(userId) }
    : {};

  const [
    totalAssets,
    highRiskAssets,
    riskRows,
    recentAudits,
    districts,
    trendsRows,
    recentAudits30d,
  ] = await Promise.all([
    Asset.countDocuments(),
    Asset.countDocuments({ risk_score: { $gte: 50 } }),
    Audit.aggregate([
      ...(engineerOnly ? [{ $match: matchAudits }] : []),
      { $group: { _id: '$overall_risk', count: { $sum: 1 } } },
    ]),
    Audit.find(matchAudits)
      .sort({ createdAt: -1 })
      .limit(engineerOnly ? 25 : 15)
      .populate('asset_id', 'district type location risk_score')
      .populate('engineer_id', 'name email department')
      .lean(),
    Asset.distinct('district', { district: { $exists: true, $nin: ['', null] } }),
    Audit.aggregate([
      { $match: matchAudits },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' },
          },
          audits: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 18 },
    ]),
    Audit.countDocuments({
      ...matchAudits,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  let personal_assets_audited = null;
  if (engineerOnly) {
    const ids = await Audit.distinct('asset_id', {
      engineer_id: new mongoose.Types.ObjectId(userId),
    });
    personal_assets_audited = ids.length;
  }

  const risk_distribution = {
    safe: 0,
    moderate: 0,
    high: 0,
    critical: 0,
  };
  riskRows.forEach((r) => {
    const k = normRiskKey(r._id);
    if (k === 'SAFE') risk_distribution.safe = r.count;
    else if (k === 'MODERATE') risk_distribution.moderate = r.count;
    else if (k === 'HIGH') risk_distribution.high = r.count;
    else if (k === 'CRITICAL') risk_distribution.critical = r.count;
  });

  const audit_trends = trendsRows.map((t) => ({
    period: t._id,
    audits: t.audits,
  }));

  const recent_activity = [];

  recentAudits.slice(0, 10).forEach((a) => {
    recent_activity.push({
      type: 'audit',
      id: String(a._id),
      title: `${a.asset_id?.type || 'Asset'} — ${a.asset_id?.district || 'Unknown district'}`,
      subtitle: `Overall risk: ${a.overall_risk || '—'}`,
      at: a.createdAt,
      meta: { engineer: a.engineer_id?.name },
    });
  });

  if (role !== 'engineer') {
    const highRiskAssetAlerts = await Asset.find({ risk_score: { $gte: 75 } })
      .select('district type risk_score')
      .limit(5)
      .lean();

    highRiskAssetAlerts.forEach((asset) => {
      recent_activity.push({
        type: 'alert',
        id: `asset-${String(asset._id)}`,
        title: `High composite risk: ${asset.type} in ${asset.district}`,
        subtitle: `Risk index ${asset.risk_score ?? '—'}`,
        at: new Date().toISOString(),
        meta: {},
      });
    });
  }

  recent_activity.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  res.json({
    success: true,
    data: {
      role_scope: role,
      total_assets: totalAssets,
      high_risk_assets: highRiskAssets,
      recent_audits: recentAudits,
      recent_audits_count_30d: recentAudits30d,
      districts_covered: districts.filter(Boolean).length,
      risk_distribution,
      audit_trends,
      recent_activity: recent_activity.slice(0, 12),
      personal_assets_audited,
    },
  });
}

module.exports = { getDashboardStats };
