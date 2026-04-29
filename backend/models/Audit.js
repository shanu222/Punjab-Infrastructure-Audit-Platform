const mongoose = require('mongoose');

const RISK_LEVELS = ['SAFE', 'MODERATE', 'HIGH', 'CRITICAL'];

const auditSchema = new mongoose.Schema(
  {
    asset_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
      index: true,
    },
    engineer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    structural_score: { type: Number, required: true, min: 0, max: 100 },
    flood_score: { type: Number, required: true, min: 0, max: 100 },
    earthquake_score: { type: Number, required: true, min: 0, max: 100 },
    heat_score: { type: Number, required: true, min: 0, max: 100 },
    overall_risk: { type: String, enum: RISK_LEVELS, required: true },
    media_urls: [{ type: String, trim: true }],
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

module.exports = mongoose.model('Audit', auditSchema);
module.exports.RISK_LEVELS = RISK_LEVELS;
