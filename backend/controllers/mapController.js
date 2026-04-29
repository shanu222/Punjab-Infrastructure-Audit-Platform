const Asset = require('../models/Asset');

function riskBandFromScore(score) {
  if (score === null || score === undefined) return 'UNKNOWN';
  if (score < 25) return 'SAFE';
  if (score < 50) return 'MODERATE';
  if (score < 75) return 'HIGH';
  return 'CRITICAL';
}

async function listMapAssets(req, res) {
  const assets = await Asset.find()
    .select('type district location risk_score')
    .lean();

  const markers = assets.map((a) => ({
    asset_id: a._id,
    lat: a.location?.lat,
    lng: a.location?.lng,
    type: a.type,
    district: a.district,
    risk_level: riskBandFromScore(a.risk_score),
    risk_score: a.risk_score,
  }));

  res.json({
    success: true,
    data: {
      count: markers.length,
      assets: markers,
    },
  });
}

module.exports = { listMapAssets };
