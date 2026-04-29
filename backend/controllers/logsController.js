const mongoose = require('mongoose');
const ActivityLog = require('../models/ActivityLog');
const activityLogService = require('../services/activityLogService');
const { getClientIp } = require('../utils/ip');

async function postClientLoginLog(req, res) {
  const { role, client_timestamp, device_info } = req.body;

  await activityLogService.record({
    user_id: new mongoose.Types.ObjectId(req.user.id),
    action: 'login_client_device',
    entity: 'Auth',
    ip_address: getClientIp(req),
    metadata: {
      portal_role: role,
      client_timestamp,
      device_info,
      user_agent: req.headers['user-agent'] || '',
    },
  });

  res.status(204).send();
}

function parseLogPagination(req) {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit || '25'), 10) || 25));
  return { page, limit, skip: (page - 1) * limit };
}

const ADMIN_LOG_ACTIONS = [
  'login_success',
  'login_failed',
  'login_failed_inactive',
  'login_failed_role_mismatch',
  'login_client_device',
  'audit_submitted',
  'asset_created',
  'asset_flagged_critical',
  'asset_unflagged_critical',
  'admin_user_created',
  'admin_user_updated',
  'admin_user_deleted',
  'admin_asset_updated',
  'admin_asset_deleted',
  'admin_audit_status',
  's3_upload',
];

async function listActivityLogs(req, res) {
  const { page, limit, skip } = parseLogPagination(req);
  const and = [];
  const q = String(req.query.search || '')
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (req.query.action) {
    and.push({ action: String(req.query.action) });
  } else if (req.query.scope === 'security') {
    and.push({
      action: {
        $in: [
          'login_success',
          'login_failed',
          'login_failed_inactive',
          'login_failed_role_mismatch',
          'login_client_device',
        ],
      },
    });
  } else if (req.query.scope === 'audits') {
    and.push({
      action: {
        $in: ['audit_submitted', 'admin_audit_status', 'audit_report_generated', 'audit_report_uploaded'],
      },
    });
  } else if (req.query.scope === 'assets') {
    and.push({
      action: {
        $in: [
          'asset_created',
          'asset_flagged_critical',
          'asset_unflagged_critical',
          'admin_asset_updated',
          'admin_asset_deleted',
        ],
      },
    });
  } else {
    and.push({ action: { $in: ADMIN_LOG_ACTIONS } });
  }

  if (req.query.from || req.query.to) {
    const range = {};
    if (req.query.from) {
      const d = new Date(req.query.from);
      if (!Number.isNaN(d.getTime())) range.$gte = d;
    }
    if (req.query.to) {
      const d = new Date(req.query.to);
      if (!Number.isNaN(d.getTime())) range.$lte = d;
    }
    if (Object.keys(range).length) and.push({ timestamp: range });
  }

  if (q) {
    and.push({ $or: [{ action: new RegExp(q, 'i') }, { entity: new RegExp(q, 'i') }] });
  }

  const filter = and.length === 1 ? and[0] : { $and: and };

  const [total, rows] = await Promise.all([
    ActivityLog.countDocuments(filter),
    ActivityLog.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user_id', 'name email role')
      .lean(),
  ]);

  const logs = rows.map((row) => ({
    id: row._id,
    user: row.user_id
      ? {
          id: row.user_id._id,
          name: row.user_id.name,
          email: row.user_id.email,
          role: row.user_id.role,
        }
      : null,
    action: row.action,
    entity: row.entity,
    timestamp: row.timestamp,
    ip: row.ip_address || '',
    metadata: row.metadata,
  }));

  res.json({
    success: true,
    data: { logs, page, limit, total },
  });
}

module.exports = { postClientLoginLog, listActivityLogs };
