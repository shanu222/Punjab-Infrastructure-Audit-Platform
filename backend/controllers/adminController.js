const User = require('../models/User');
const Asset = require('../models/Asset');
const Audit = require('../models/Audit');

async function getAdminSummary(req, res) {
  const [total_users, total_assets, total_audits, high_risk_alerts] = await Promise.all([
    User.countDocuments({ is_active: { $ne: false } }),
    Asset.countDocuments(),
    Audit.countDocuments(),
    Asset.countDocuments({
      $or: [{ risk_score: { $gte: 75 } }, { is_flagged_critical: true }],
    }),
  ]);

  res.json({
    success: true,
    data: {
      total_users,
      total_assets,
      total_audits,
      high_risk_alerts,
    },
  });
}

module.exports = { getAdminSummary };
