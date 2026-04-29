const mongoose = require('mongoose');
const multer = require('multer');
const Audit = require('../models/Audit');
const Asset = require('../models/Asset');
const AppError = require('../utils/AppError');
const { getClientIp } = require('../utils/ip');
const { assessRisk } = require('../services/riskEngine');
const activityLogService = require('../services/activityLogService');
const { createAuditSchema } = require('../validators/schemas');
const {
  uploadFile,
  detectMediaFolderFromMime,
  resolveMediaList,
  getSignedGetUrl,
} = require('../services/s3Service');

function parseMultipartAuditBody(body) {
  const raw = { ...body };
  if (typeof raw.media_urls === 'string' && raw.media_urls.trim()) {
    try {
      raw.media_urls = JSON.parse(raw.media_urls);
    } catch {
      throw new AppError('Invalid media_urls JSON string', 400);
    }
  } else if (!Array.isArray(raw.media_urls)) {
    raw.media_urls = [];
  }

  const payload = {
    asset_id: raw.asset_id,
    structural_score: Number(raw.structural_score),
    flood_score: Number(raw.flood_score),
    earthquake_score: Number(raw.earthquake_score),
    heat_score: Number(raw.heat_score),
    media_urls: raw.media_urls,
    notes: raw.notes !== undefined && raw.notes !== null ? String(raw.notes) : '',
  };

  const { error, value } = createAuditSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    throw new AppError(error.details.map((d) => d.message).join('; '), 400);
  }
  return value;
}

async function enrichAuditForResponse(audit) {
  const plain = audit && typeof audit.toObject === 'function' ? audit.toObject() : { ...audit };
  plain.media_urls = await resolveMediaList(plain.media_urls || []);
  if (plain.report_pdf && String(plain.report_pdf).length > 0) {
    if (!/^https?:\/\//i.test(plain.report_pdf)) {
      plain.report_pdf = await getSignedGetUrl(plain.report_pdf);
    }
  }
  return plain;
}

async function createAudit(req, res) {
  let payload;

  if (req.is('multipart/form-data')) {
    payload = parseMultipartAuditBody(req.body);
    const files = (req.files && req.files.media) || [];
    const uploadedKeys = [];
    try {
      for (const file of files) {
        const folder = detectMediaFolderFromMime(file.mimetype);
        const { key } = await uploadFile(file, folder);
        uploadedKeys.push(key);
      }
    } catch (err) {
      throw err instanceof AppError ? err : new AppError(err.message || 'Media upload failed', 502);
    }
    payload.media_urls = [...(payload.media_urls || []), ...uploadedKeys];
  } else {
    const { error, value } = createAuditSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      throw new AppError(error.details.map((d) => d.message).join('; '), 400);
    }
    payload = value;
  }

  const { asset_id, structural_score, flood_score, earthquake_score, heat_score, media_urls, notes } =
    payload;

  if (!mongoose.isValidObjectId(asset_id)) {
    throw new AppError('Invalid asset_id', 400);
  }

  const asset = await Asset.findById(asset_id);
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  const risk = assessRisk({
    structural_score,
    flood_score,
    earthquake_score,
    heat_score,
  });

  const audit = await Audit.create({
    asset_id,
    engineer_id: req.user.id,
    structural_score,
    flood_score,
    earthquake_score,
    heat_score,
    overall_risk: risk.overall_risk,
    media_urls: media_urls || [],
    notes: notes || '',
  });

  await activityLogService.record({
    user_id: new mongoose.Types.ObjectId(req.user.id),
    action: 'audit_submitted',
    entity: `Audit:${audit._id}`,
    ip_address: getClientIp(req),
  });

  const populated = await Audit.findById(audit._id)
    .populate('asset_id')
    .populate('engineer_id', 'name email role');

  const auditOut = await enrichAuditForResponse(populated);

  res.status(201).json({
    success: true,
    data: {
      audit: auditOut,
      risk_assessment: {
        overall_risk: risk.overall_risk,
        composite_index: risk.composite,
        weights: risk.weights,
      },
    },
  });
}

async function getAuditsByAsset(req, res) {
  const { asset_id } = req.params;
  if (!mongoose.isValidObjectId(asset_id)) {
    throw new AppError('Invalid asset_id', 400);
  }

  const asset = await Asset.findById(asset_id);
  if (!asset) {
    throw new AppError('Asset not found', 404);
  }

  const audits = await Audit.find({ asset_id })
    .sort({ createdAt: -1 })
    .populate('engineer_id', 'name email role')
    .lean();

  const auditsOut = await Promise.all(audits.map((a) => enrichAuditForResponse(a)));

  res.json({
    success: true,
    data: {
      asset_id,
      count: auditsOut.length,
      audits: auditsOut,
    },
  });
}

async function attachReportPdf(req, res) {
  const { auditId } = req.params;
  if (!mongoose.isValidObjectId(auditId)) {
    throw new AppError('Invalid audit id', 400);
  }

  if (!req.file) {
    throw new AppError('Expected multipart field "file" (PDF)', 400);
  }

  const audit = await Audit.findById(auditId);
  if (!audit) {
    throw new AppError('Audit not found', 404);
  }

  const { key, signedUrl, expiresIn } = await uploadFile(req.file, 'reports');

  audit.report_pdf = key;
  await audit.save();

  await activityLogService.record({
    user_id: new mongoose.Types.ObjectId(req.user.id),
    action: 'audit_report_uploaded',
    entity: `Audit:${audit._id}`,
    ip_address: getClientIp(req),
  });

  res.status(201).json({
    success: true,
    data: {
      audit_id: audit._id,
      report_pdf_key: key,
      report_pdf_url: signedUrl,
      url_expires_in_seconds: expiresIn,
    },
  });
}

/** Multer for audit media (images/videos only at create time). */
const auditUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024, files: 25 },
}).fields([{ name: 'media', maxCount: 20 }]);

function conditionalAuditUpload(req, res, next) {
  if (req.is('multipart/form-data')) {
    return auditUpload(req, res, next);
  }
  return next();
}

const reportPdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
}).single('file');

module.exports = {
  createAudit,
  getAuditsByAsset,
  attachReportPdf,
  conditionalAuditUpload,
  reportPdfUpload,
};
