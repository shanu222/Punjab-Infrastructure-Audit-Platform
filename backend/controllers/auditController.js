const mongoose = require('mongoose');
const Audit = require('../models/Audit');
const Asset = require('../models/Asset');
const AppError = require('../utils/AppError');
const { getClientIp } = require('../utils/ip');
const { assessRisk } = require('../services/riskEngine');
const activityLogService = require('../services/activityLogService');

async function createAudit(req, res) {
  const { asset_id, structural_score, flood_score, earthquake_score, heat_score, media_urls, notes } =
    req.body;

  if (!mongoose.isValidObjectId(asset_id)) {
    throw new AppError('Invalid asset_id', 400);
  }

  const asset = await Asset.findById(asset_id);
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  const risk = assessRisk({
    structural_score,
    flood_score,
    earthquake_score,
    heat_score,
  });

  const audit = await Audit.create({
    asset_id,
    engineer_id: req.user.id,
    structural_score,
    flood_score,
    earthquake_score,
    heat_score,
    overall_risk: risk.overall_risk,
    media_urls: media_urls || [],
    notes: notes || '',
  });

  await activityLogService.record({
    user_id: new mongoose.Types.ObjectId(req.user.id),
    action: 'audit_submitted',
    entity: `Audit:${audit._id}`,
    ip_address: getClientIp(req),
  });

  const populated = await Audit.findById(audit._id)
    .populate('asset_id')
    .populate('engineer_id', 'name email role');

  res.status(201).json({
    success: true,
    data: {
      audit: populated,
      risk_assessment: {
        overall_risk: risk.overall_risk,
        composite_index: risk.composite,
        weights: risk.weights,
      },
    },
  });
}

async function getAuditsByAsset(req, res) {
  const { asset_id } = req.params;
  if (!mongoose.isValidObjectId(asset_id)) {
    throw new AppError('Invalid asset_id', 400);
  }

  const asset = await Asset.findById(asset_id);
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  const audits = await Audit.find({ asset_id })
    .sort({ createdAt: -1 })
    .populate('engineer_id', 'name email role')
    .lean();

  res.json({
    success: true,
    data: {
      asset_id,
      count: audits.length,
      audits,
    },
  });
}

module.exports = { createAudit, getAuditsByAsset };
