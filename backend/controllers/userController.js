const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { getClientIp } = require('../utils/ip');
const activityLogService = require('../services/activityLogService');

function parsePagination(req) {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

/** Active admins other than the given user id (string or ObjectId). */
async function countOtherActiveAdmins(excludeId) {
  return User.countDocuments({
    role: 'admin',
    is_active: { $ne: false },
    _id: { $ne: new mongoose.Types.ObjectId(String(excludeId)) },
  });
}

async function listUsers(req, res) {
  const { page, limit, skip } = parsePagination(req);
  const q = String(req.query.search || '')
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const filter = {};
  if (q) {
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { department: new RegExp(q, 'i') },
    ];
  }
  if (req.query.role) {
    filter.role = String(req.query.role);
  }
  if (req.query.status === 'active') filter.is_active = { $ne: false };
  if (req.query.status === 'inactive') filter.is_active = false;

  const sortField = ['name', 'email', 'role', 'createdAt', 'is_active'].includes(String(req.query.sort))
    ? String(req.query.sort)
    : 'createdAt';
  const order = String(req.query.order) === 'asc' ? 1 : -1;

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .sort({ [sortField]: order })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const data = users.map((u) => ({
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department || '',
    is_active: u.is_active !== false,
    createdAt: u.createdAt,
  }));

  res.json({
    success: true,
    data: { users: data, page, limit, total },
  });
}

async function createUser(req, res) {
  const { name, email, password, role, department, is_active } = req.body;

  const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (existing) {
    throw new AppError('Email already registered', 409);
  }

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email: String(email).toLowerCase().trim(),
    password: hashed,
    role,
    department: department || '',
    is_active: is_active !== false,
  });

  await activityLogService.record({
    user_id: new mongoose.Types.ObjectId(req.user.id),
    action: 'admin_user_created',
    entity: `User:${user._id}`,
    ip_address: getClientIp(req),
    metadata: { created_email: user.email, role: user.role },
  });

  const fresh = await User.findById(user._id);
  res.status(201).json({
    success: true,
    data: { user: fresh.toSafeJSON() },
  });
}

async function updateUser(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid user id', 400);
  }

  const user = await User.findById(id).select('+password');
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const body = req.body;
  const wasAdmin = user.role === 'admin' && user.is_active !== false;

  if (body.email && String(body.email).toLowerCase().trim() !== user.email) {
    const taken = await User.findOne({
      email: String(body.email).toLowerCase().trim(),
      _id: { $ne: user._id },
    });
    if (taken) throw new AppError('Email already in use', 409);
    user.email = String(body.email).toLowerCase().trim();
  }
  if (body.name !== undefined) user.name = body.name;
  if (body.department !== undefined) user.department = body.department;
  if (body.is_active !== undefined) user.is_active = body.is_active;

  if (body.role !== undefined) {
    const nextRole = body.role;
    if (wasAdmin && nextRole !== 'admin') {
      const others = await countOtherActiveAdmins(user._id);
      if (others < 1) {
        throw new AppError('Cannot change role of the last active administrator', 400);
      }
    }
    user.role = nextRole;
  }

  if (body.is_active === false && wasAdmin) {
    const others = await countOtherActiveAdmins(user._id);
    if (others < 1) {
      throw new AppError('Cannot disable the last active administrator', 400);
    }
  }

  if (body.password && String(body.password).length > 0) {
    user.password = await bcrypt.hash(body.password, 12);
  }

  await user.save();

  await activityLogService.record({
    user_id: new mongoose.Types.ObjectId(req.user.id),
    action: 'admin_user_updated',
    entity: `User:${user._id}`,
    ip_address: getClientIp(req),
    metadata: { target_user_id: String(user._id) },
  });

  const out = await User.findById(user._id);
  res.json({
    success: true,
    data: { user: out.toSafeJSON() },
  });
}

async function deleteUser(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError('Invalid user id', 400);
  }

  if (String(id) === String(req.user.id)) {
    throw new AppError('You cannot delete your own account', 400);
  }

  const user = await User.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.role === 'admin' && user.is_active !== false) {
    const others = await countOtherActiveAdmins(user._id);
    if (others < 1) {
      throw new AppError('Cannot delete the last active administrator', 400);
    }
  }

  await User.findByIdAndDelete(id);

  await activityLogService.record({
    user_id: new mongoose.Types.ObjectId(req.user.id),
    action: 'admin_user_deleted',
    entity: `User:${id}`,
    ip_address: getClientIp(req),
    metadata: { deleted_email: user.email },
  });

  res.json({ success: true, data: { id } });
}

module.exports = { listUsers, createUser, updateUser, deleteUser };
