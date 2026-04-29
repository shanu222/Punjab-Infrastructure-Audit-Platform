const AppError = require('../utils/AppError');
const { futureAnalysisSchema } = require('../validators/schemas');
const { analyzeFutureSite } = require('../services/futureAnalysisService');

async function runFutureAnalysis(req, res) {
  const { error, value } = futureAnalysisSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    throw new AppError(error.details.map((d) => d.message).join('; '), 400);
  }

  const result = analyzeFutureSite(value);

  res.status(201).json({
    success: true,
    data: result,
  });
}

module.exports = { runFutureAnalysis };
