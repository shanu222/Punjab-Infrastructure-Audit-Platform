const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { clientLoginLogSchema } = require('../validators/schemas');
const { postClientLoginLog } = require('../controllers/logsController');

const router = express.Router();

router.post('/login', protect, validateBody(clientLoginLogSchema), asyncHandler(postClientLoginLog));

module.exports = router;
