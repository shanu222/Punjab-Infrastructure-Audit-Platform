const mongoose = require('mongoose');
const { analyzeFutureProject } = require('../services/futureAnalysisService');
const { generateFutureProjectPdfBuffer } = require('../services/futureReportPdfService');
const activityLogService = require('../services/activityLogService');
const { getClientIp } = require('../utils/ip');

async function runFutureAnalysis(req, res) {
  const result = await analyzeFutureProject(req.body);

  await activityLogService.record({
    user_id: new mongoose.Types.ObjectId(req.user.id),
    action: 'future_analysis_run',
    entity: 'FutureProject',
    ip_address: getClientIp(req),
    metadata: {
      project_name: result.project_name,
      approval_status: result.approval_status,
      district: result.district,
    },
  });

  res.status(201).json({
    success: true,
    data: result,
  });
}

async function runFutureAnalysisPdf(req, res) {
  const result = await analyzeFutureProject(req.body);
  const buffer = await generateFutureProjectPdfBuffer(req.body, result);

  const safeName = String(req.body.project_name || 'project')
    .replace(/[^\w\-]+/g, '_')
    .slice(0, 80);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="future-infrastructure-${safeName}.pdf"`);
  res.send(buffer);
}

module.exports = { runFutureAnalysis, runFutureAnalysisPdf };
