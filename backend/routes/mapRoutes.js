const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { protect } = require('../middleware/auth');
const { listMapAssets } = require('../controllers/mapController');

const router = express.Router();

router.get('/assets', protect, asyncHandler(listMapAssets));

module.exports = router;
