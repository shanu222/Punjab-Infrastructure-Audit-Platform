const mongoose = require('mongoose');

const RISK_LEVELS = ['SAFE', 'MODERATE', 'HIGH', 'CRITICAL'];
const SEVERITY_LEVELS = ['none', 'low', 'moderate', 'high', 'critical'];

const structuralChecklistSchema = new mongoose.Schema(
  {
    cracks: { type: String, enum: SEVERITY_LEVELS, default: 'none' },
    foundation: { type: String, enum: SEVERITY_LEVELS, default: 'none' },
    load_capacity: { type: String, enum: SEVERITY_LEVELS, default: 'none' },
    corrosion: { type: String, enum: SEVERITY_LEVELS, default: 'none' },
  },
  { _id: false }
);

const disasterAssessmentSchema = new mongoose.Schema(
  {
    flood: { type: String, enum: SEVERITY_LEVELS, default: 'none' },
    earthquake: { type: String, enum: SEVERITY_LEVELS, default: 'none' },
    heat: { type: String, enum: SEVERITY_LEVELS, default: 'none' },
  },
  { _id: false }
);

const scoresSchema = new mongoose.Schema(
  {
    structural: { type: Number, required: true, min: 0, max: 100 },
    flood: { type: Number, required: true, min: 0, max: 100 },
    earthquake: { type: Number, required: true, min: 0, max: 100 },
    heat: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

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
    structural_checklist: { type: structuralChecklistSchema, default: () => ({}) },
    disaster_assessment: { type: disasterAssessmentSchema, default: () => ({}) },
    scores: { type: scoresSchema, required: true },
    overall_risk: { type: String, enum: RISK_LEVELS, required: true },
    media_urls: [{ type: String, trim: true }],
    report_pdf: { type: String, trim: true },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: false } }
);

module.exports = mongoose.model('Audit', auditSchema);
module.exports.RISK_LEVELS = RISK_LEVELS;
module.exports.SEVERITY_LEVELS = SEVERITY_LEVELS;
