const Joi = require('joi');
const { ASSET_TYPES } = require('../models/Asset');

const severity = Joi.string().valid('none', 'low', 'moderate', 'high', 'critical');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('engineer', 'government').default('engineer'),
  department: Joi.string().max(160).allow('').default(''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  /** When set, must match the account role (portal role selection). */
  role: Joi.string().valid('admin', 'engineer', 'government').optional(),
});

const hintRoleSchema = Joi.object({
  email: Joi.string().email().required(),
});

const clientLoginLogSchema = Joi.object({
  role: Joi.string().valid('admin', 'engineer', 'government').required(),
  client_timestamp: Joi.string().max(64).required(),
  device_info: Joi.object().unknown(true).required(),
});

const createAssetSchema = Joi.object({
  type: Joi.string()
    .valid(...ASSET_TYPES)
    .required(),
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  })
    .required(),
  district: Joi.string().min(1).max(120).required(),
  construction_year: Joi.number().integer().min(1800).max(2100),
  material: Joi.string().max(200).allow(''),
  structural_type: Joi.string().max(200).allow(''),
  risk_score: Joi.number().min(0).max(100).allow(null),
});

const structuralChecklistSchema = Joi.object({
  cracks: severity.default('none'),
  foundation: severity.default('none'),
  load_capacity: severity.default('none'),
  corrosion: severity.default('none'),
});

const disasterAssessmentSchema = Joi.object({
  flood: severity.default('none'),
  earthquake: severity.default('none'),
  heat: severity.default('none'),
});

const scoresSchema = Joi.object({
  structural: Joi.number().min(0).max(100).required(),
  flood: Joi.number().min(0).max(100).required(),
  earthquake: Joi.number().min(0).max(100).required(),
  heat: Joi.number().min(0).max(100).required(),
});

const createAuditSchema = Joi.object({
  asset_id: Joi.string().required(),
  structural_checklist: structuralChecklistSchema.optional(),
  disaster_assessment: disasterAssessmentSchema.optional(),
  scores: scoresSchema.required(),
  media_urls: Joi.array().items(Joi.string().max(2048)).max(50).default([]),
  notes: Joi.string().max(20000).allow(''),
});

const uploadFolderSchema = Joi.object({
  folder: Joi.string().valid('images', 'videos', 'reports').required(),
});

const futureAnalysisSchema = Joi.object({
  location: Joi.object({
    lat: Joi.number().min(-90).max(90).required(),
    lng: Joi.number().min(-180).max(180).required(),
  }).required(),
  type: Joi.string()
    .valid(...ASSET_TYPES)
    .required(),
});

const assetPatchFlagsSchema = Joi.object({
  is_flagged_critical: Joi.boolean().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  hintRoleSchema,
  clientLoginLogSchema,
  createAssetSchema,
  createAuditSchema,
  uploadFolderSchema,
  futureAnalysisSchema,
  assetPatchFlagsSchema,
};
