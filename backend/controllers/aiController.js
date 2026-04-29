const { buildInsights } = require('../services/aiInsightsService');

async function getAiInsights(req, res) {
  const insights = await buildInsights();
  res.json({
    success: true,
    data: insights,
  });
}

module.exports = { getAiInsights };
