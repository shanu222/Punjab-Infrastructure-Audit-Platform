const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const config = require('../config');
const AppError = require('../utils/AppError');
const { getClientIp } = require('../utils/ip');
const activityLogService = require('../services/activityLogService');

function signToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

/**
 * Optional role hint for UX (may allow email existence inference — use behind CAPTCHA/rate limits in hardened deployments).
 */
async function hintRole(req, res) {
  const email = String(req.body.email || '')
    .trim()
    .toLowerCase();
  const user = await User.findOne({ email }).select('role');
  res.json({
    success: true,
    data: {
      suggested_role: user ? user.role : null,
    },
  });
}

async function register(req, res) {
  const { name, email, password, role, department } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hashed,
    role,
    department: department || '',
  });

  await activityLogService.record({
    user_id: user._id,
    action: 'user_register',
    entity: 'User',
    ip_address: getClientIp(req),
  });

  const token = signToken(user);

  res.status(201).json({
    success: true,
    data: {
      user: user.toSafeJSON(),
      token,
    },
  });
}

async function login(req, res) {
  const { email, password, role: selectedRole } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    await activityLogService.record({
      user_id: null,
      action: 'login_failed',
      entity: 'Auth',
      ip_address: getClientIp(req),
    });
    throw new AppError('Invalid email or password', 401);
  }

  if (user.is_active === false) {
    await activityLogService.record({
      user_id: user._id,
      action: 'login_failed_inactive',
      entity: 'Auth',
      ip_address: getClientIp(req),
    });
    throw new AppError('Account is disabled. Contact an administrator.', 403);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    await activityLogService.record({
      user_id: null,
      action: 'login_failed',
      entity: 'Auth',
      ip_address: getClientIp(req),
    });
    throw new AppError('Invalid email or password', 401);
  }

  if (selectedRole && user.role !== selectedRole) {
    await activityLogService.record({
      user_id: user._id,
      action: 'login_failed_role_mismatch',
      entity: 'Auth',
      ip_address: getClientIp(req),
      metadata: { expected_portal_role: selectedRole, account_role: user.role },
    });
    throw new AppError('Selected role does not match your account role', 403);
  }

  const currentIp = getClientIp(req);
  const otherIpLogin = await ActivityLog.exists({
    user_id: user._id,
    action: 'login_success',
    ip_address: { $nin: [currentIp, '', null] },
  });
  const new_ip_detected = Boolean(otherIpLogin && currentIp);

  await activityLogService.record({
    user_id: user._id,
    action: 'login_success',
    entity: 'Auth',
    ip_address: currentIp,
  });

  const token = signToken(user);

  res.json({
    success: true,
    data: {
      user: user.toSafeJSON(),
      token,
      security: {
        new_ip_detected,
        suspicious_login: new_ip_detected,
      },
    },
  });
}

module.exports = { register, login, signToken, hintRole };
