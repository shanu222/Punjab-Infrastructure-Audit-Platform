const mongoose = require('mongoose');
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

module.exports = { postClientLoginLog };
