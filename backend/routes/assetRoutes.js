const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const { validateBody } = require('../middleware/validate');
const { createAssetSchema, assetPatchFlagsSchema, adminAssetUpdateSchema } = require('../validators/schemas');
const {
  listAssets,
  createAsset,
  getAssetById,
  patchAssetFlags,
  updateAsset,
  deleteAsset,
} = require('../controllers/assetController');

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
router.put(
  '/:id',
  protect,
  requireRoles('admin'),
  validateBody(adminAssetUpdateSchema),
  asyncHandler(updateAsset)
);
router.delete('/:id', protect, requireRoles('admin'), asyncHandler(deleteAsset));
router.get('/:id', protect, asyncHandler(getAssetById));

module.exports = router;
