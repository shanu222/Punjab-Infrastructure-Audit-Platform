const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { getAiInsights, getAssetAiInsights } = require('../controllers/aiController');

const router = express.Router();

router.get('/insights', protect, asyncHandler(getAiInsights));
router.get('/asset/:id', protect, asyncHandler(getAssetAiInsights));

module.exports = router;
