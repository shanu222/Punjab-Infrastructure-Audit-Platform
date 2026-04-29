const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const { runFutureAnalysis } = require('../controllers/futureController');

const router = express.Router();

router.post(
  '/',
  protect,
  requireRoles('admin', 'engineer'),
  asyncHandler(runFutureAnalysis)
);

module.exports = router;
