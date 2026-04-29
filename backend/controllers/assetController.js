const mongoose = require('mongoose');
const Asset = require('../models/Asset');
const AppError = require('../utils/AppError');
const { getClientIp } = require('../utils/ip');
const activityLogService = require('../services/activityLogService');

function formatAsset(doc) {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  return {
    ...o,
    asset_id: o._id,
  };
}

async function listAssets(req, res) {
  const assets = await Asset.find()
    .sort({ createdAt: -1 })
    .limit(500)
    .populate('created_by', 'name email role department')
    .lean();

  res.json({
    success: true,
    data: { count: assets.length, assets: assets.map(formatAsset) },
  });
}

async function createAsset(req, res) {
  const payload = {
    ...req.body,
    created_by: req.user.id,
  };
  if (payload.risk_score === undefined) {
    payload.risk_score = null;
  }

  const asset = await Asset.create(payload);

  await activityLogService.record({
    user_id: new mongoose.Types.ObjectId(req.user.id),
    action: 'asset_created',
    entity: `Asset:${asset._id}`,
    ip_address: getClientIp(req),
  });

  const populated = await Asset.findById(asset._id).populate(
    'created_by',
    'name email role department'
  );

  res.status(201).json({
    success: true,
    data: { asset: formatAsset(populated) },
  });
}

async function getAssetById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid asset id', 400);
  }

  const asset = await Asset.findById(id).populate('created_by', 'name email role department');
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  res.json({
    success: true,
    data: { asset: formatAsset(asset) },
  });
}

module.exports = { listAssets, createAsset, getAssetById, formatAsset };
