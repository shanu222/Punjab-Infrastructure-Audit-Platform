const Joi = require('joi');
const { ASSET_TYPES } = require('../models/Asset');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  /** Self-service registration is limited to engineer & government; create admins via seed script. */
  role: Joi.string().valid('engineer', 'government').default('engineer'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
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
});

const createAuditSchema = Joi.object({
  asset_id: Joi.string().required(),
  structural_score: Joi.number().min(0).max(100).required(),
  flood_score: Joi.number().min(0).max(100).required(),
  earthquake_score: Joi.number().min(0).max(100).required(),
  heat_score: Joi.number().min(0).max(100).required(),
  media_urls: Joi.array().items(Joi.string().max(2048)).max(50).default([]),
  notes: Joi.string().max(20000).allow(''),
});

const uploadFolderSchema = Joi.object({
  folder: Joi.string().valid('images', 'videos', 'reports').required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  createAssetSchema,
  createAuditSchema,
  uploadFolderSchema,
};
