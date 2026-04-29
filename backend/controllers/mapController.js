const mongoose = require('mongoose');
const Asset = require('../models/Asset');

function riskBandFromScore(score) {
  if (score === null || score === undefined) return 'UNKNOWN';
  if (score < 25) return 'SAFE';
  if (score < 50) return 'MODERATE';
  if (score < 75) return 'HIGH';
  return 'CRITICAL';
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function listMapAssets(req, res) {
  const { type, risk, district } = req.query;

  const match = {};
  if (type && String(type).trim()) {
    match.type = String(type).trim().toLowerCase();
  }
  if (district && String(district).trim()) {
    match.district = new RegExp(`^${escapeRegex(String(district).trim())}$`, 'i');
  }

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'audits',
        let: { aid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$asset_id', '$$aid'] } } },
          { $sort: { createdAt: -1 } },
          { $limit: 1 },
          { $project: { createdAt: 1 } },
        ],
        as: 'lastAudit',
      },
    },
    {
      $addFields: {
        last_audit_at: {
          $let: {
            vars: { d: { $arrayElemAt: ['$lastAudit', 0] } },
            in: '$$d.createdAt',
          },
        },
      },
    },
    {
      $project: {
        type: 1,
        district: 1,
        location: 1,
        risk_score: 1,
        last_audit_at: 1,
      },
    },
  ];

  let rows = await Asset.aggregate(pipeline);

  const markers = rows.map((a) => ({
    id: String(a._id),
    asset_id: a._id,
    name: `${a.type || 'Asset'} — ${a.district || ''}`.trim(),
    type: a.type,
    district: a.district,
    lat: a.location?.lat,
    lng: a.location?.lng,
    risk_level: riskBandFromScore(a.risk_score),
    risk_score: a.risk_score,
    last_audit_at: a.last_audit_at || null,
  }));

  const filtered =
    risk && String(risk).trim()
      ? markers.filter((m) => m.risk_level === String(risk).trim().toUpperCase())
      : markers;

  res.json({
    success: true,
    data: {
      count: filtered.length,
      assets: filtered,
    },
  });
}

module.exports = { listMapAssets };
