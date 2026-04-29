const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const { validateBody } = require('../middleware/validate');
const { createAssetSchema, assetPatchFlagsSchema } = require('../validators/schemas');
const { listAssets, createAsset, getAssetById, patchAssetFlags } = require('../controllers/assetController');

const router = express.Router();

router.get('/', protect, asyncHandler(listAssets));
router.post(
  '/',
  protect,
  requireRoles('admin', 'engineer'),
  validateBody(createAssetSchema),
  asyncHandler(createAsset)
);
router.patch(
  '/:id',
  protect,
  requireRoles('admin', 'engineer'),
  validateBody(assetPatchFlagsSchema),
  asyncHandler(patchAssetFlags)
);
router.get('/:id', protect, asyncHandler(getAssetById));

module.exports = router;
