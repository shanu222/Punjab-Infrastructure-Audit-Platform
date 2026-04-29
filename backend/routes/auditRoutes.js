const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const { validateBody } = require('../middleware/validate');
const { createAuditSchema } = require('../validators/schemas');
const { createAudit, getAuditsByAsset } = require('../controllers/auditController');

const router = express.Router();

router.post(
  '/',
  protect,
  requireRoles('admin', 'engineer'),
  validateBody(createAuditSchema),
  asyncHandler(createAudit)
);
router.get('/:asset_id', protect, asyncHandler(getAuditsByAsset));

module.exports = router;
