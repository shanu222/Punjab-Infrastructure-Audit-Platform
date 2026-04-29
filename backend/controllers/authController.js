const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
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

async function register(req, res) {
  const { name, email, password, role } = req.body;

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
  const { email, password } = req.body;

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

  await activityLogService.record({
    user_id: user._id,
    action: 'login_success',
    entity: 'Auth',
    ip_address: getClientIp(req),
  });

  const token = signToken(user);

  res.json({
    success: true,
    data: {
      user: user.toSafeJSON(),
      token,
    },
  });
}

module.exports = { register, login, signToken };
