const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const { validateBody } = require('../middleware/validate');
const { futureProjectSchema } = require('../validators/schemas');
const { runFutureAnalysis, runFutureAnalysisPdf } = require('../controllers/futureController');

const router = express.Router();

const govAdmin = [protect, requireRoles('admin', 'government'), validateBody(futureProjectSchema)];

router.post('/', ...govAdmin, asyncHandler(runFutureAnalysis));
router.post('/report-pdf', ...govAdmin, asyncHandler(runFutureAnalysisPdf));

module.exports = router;
