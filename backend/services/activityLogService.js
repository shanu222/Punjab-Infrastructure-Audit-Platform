const ActivityLog = require('../models/ActivityLog');

/**
 * Persist an immutable activity record (audit trail).
 * @param {{ user_id?: import('mongoose').Types.ObjectId | null, action: string, entity: string, ip_address?: string, metadata?: object }} entry
 */
async function record(entry) {
  await ActivityLog.create({
    user_id: entry.user_id || null,
    action: entry.action,
    entity: entry.entity,
    ip_address: entry.ip_address || '',
    timestamp: new Date(),
    metadata: entry.metadata,
  });
}

module.exports = { record };
