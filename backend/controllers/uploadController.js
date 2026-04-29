const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const { uploadFile } = require('../services/s3Service');
const activityLogService = require('../services/activityLogService');
const { getClientIp } = require('../utils/ip');
const { uploadFolderSchema } = require('../validators/schemas');

async function uploadWithFolder(req, res) {
  if (!req.file) {
    throw new AppError('Expected multipart field "file"', 400);
  }

  const { error, value } = uploadFolderSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (error) {
    throw new AppError(error.details.map((d) => d.message).join('; '), 400);
  }

  const { folder } = value;
  const { key, signedUrl, expiresIn } = await uploadFile(req.file, folder);

  await activityLogService.record({
    user_id: new mongoose.Types.ObjectId(req.user.id),
    action: 's3_upload',
    entity: `S3:${key}`,
    ip_address: getClientIp(req),
  });

  res.status(201).json({
    success: true,
    data: {
      key,
      url: signedUrl,
      url_expires_in_seconds: expiresIn,
      folder,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    },
  });
}

module.exports = { uploadWithFolder };
