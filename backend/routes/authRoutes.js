const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { validateBody } = require('../middleware/validate');
const { registerSchema, loginSchema } = require('../validators/schemas');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', validateBody(registerSchema), asyncHandler(register));
router.post('/login', validateBody(loginSchema), asyncHandler(login));

module.exports = router;
