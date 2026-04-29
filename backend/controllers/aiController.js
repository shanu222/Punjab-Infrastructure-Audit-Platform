const { buildInsights } = require('../services/aiInsightsService');
const { buildAssetAiInsights } = require('../services/aiAssetInsightsService');

async function getAiInsights(req, res) {
  const insights = await buildInsights();
  res.json({
    success: true,
    data: insights,
  });
}

async function getAssetAiInsights(req, res) {
  const { id } = req.params;
  const data = await buildAssetAiInsights(id);
  res.json({
    success: true,
    data,
  });
}

module.exports = { getAiInsights, getAssetAiInsights };
