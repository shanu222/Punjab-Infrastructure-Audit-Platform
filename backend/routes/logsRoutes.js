const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { requireRoles } = require('../middleware/rbac');
const { validateBody } = require('../middleware/validate');
const { clientLoginLogSchema } = require('../validators/schemas');
const { postClientLoginLog, listActivityLogs } = require('../controllers/logsController');

const router = express.Router();

router.get('/', protect, requireRoles('admin'), asyncHandler(listActivityLogs));
router.post('/login', protect, validateBody(clientLoginLogSchema), asyncHandler(postClientLoginLog));

module.exports = router;
