const express = require('express');
const multer = require('multer');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const { uploadSingle } = require('../controllers/uploadController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post(
  '/image',
  protect,
  requireRoles('admin', 'engineer'),
  upload.single('file'),
  asyncHandler(uploadSingle)
);

module.exports = router;
