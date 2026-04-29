const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const { getAdminSummary } = require('../controllers/adminController');

const router = express.Router();

router.get('/summary', protect, requireRoles('admin'), asyncHandler(getAdminSummary));

module.exports = router;
