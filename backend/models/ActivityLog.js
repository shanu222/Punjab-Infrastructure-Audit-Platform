const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    action: { type: String, required: true, trim: true, index: true },
    entity: { type: String, required: true, trim: true },
    timestamp: { type: Date, default: Date.now, index: true },
    ip_address: { type: String, trim: true, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { versionKey: false }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
