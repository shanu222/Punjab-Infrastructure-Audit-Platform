const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const {
  createAudit,
  getAuditsByAsset,
  generateAuditReport,
  attachReportPdf,
  conditionalAuditUpload,
  reportPdfUpload,
} = require('../controllers/auditController');

const router = express.Router();

router.post(
  '/',
  protect,
  requireRoles('admin', 'engineer'),
  conditionalAuditUpload,
  asyncHandler(createAudit)
);

router.post(
  '/:auditId/generate-report',
  protect,
  requireRoles('admin', 'engineer'),
  asyncHandler(generateAuditReport)
);

router.post(
  '/:auditId/report-pdf',
  protect,
  requireRoles('admin', 'engineer'),
  reportPdfUpload,
  asyncHandler(attachReportPdf)
);

router.get('/:asset_id', protect, asyncHandler(getAuditsByAsset));

module.exports = router;
