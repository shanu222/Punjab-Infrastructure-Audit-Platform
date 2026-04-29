const express = require('express');
const asyncHandler = require('../middleware/asyncHandler');
const { validateBody } = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  hintRoleSchema,
} = require('../validators/schemas');
const { register, login, hintRole } = require('../controllers/authController');

const router = express.Router();

router.post('/register', validateBody(registerSchema), asyncHandler(register));
router.post('/login', validateBody(loginSchema), asyncHandler(login));
router.post('/hint-role', validateBody(hintRoleSchema), asyncHandler(hintRole));

module.exports = router;
