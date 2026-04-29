const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { getAiInsights } = require('../controllers/aiController');

const router = express.Router();

router.get('/insights', protect, asyncHandler(getAiInsights));

module.exports = router;
