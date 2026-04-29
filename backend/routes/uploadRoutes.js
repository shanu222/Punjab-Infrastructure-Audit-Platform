const express = require('express');
const multer = require('multer');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const { uploadWithFolder } = require('../controllers/uploadController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
});

router.post(
  '/',
  protect,
  requireRoles('admin', 'engineer'),
  upload.single('file'),
  asyncHandler(uploadWithFolder)
);

module.exports = router;
