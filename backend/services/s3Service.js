const AWS = require('aws-sdk');
const path = require('path');
const crypto = require('crypto');
const config = require('../config');
const AppError = require('../utils/AppError');

let s3Client = null;

function getS3() {
  if (!config.aws.bucket || !config.aws.accessKeyId || !config.aws.secretAccessKey) {
    throw new AppError('S3 is not configured. Set AWS_ACCESS_KEY, AWS_SECRET_KEY, and AWS_BUCKET_NAME.', 503);
  }
  if (!s3Client) {
    s3Client = new AWS.S3({
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
      region: config.aws.region,
    });
  }
  return s3Client;
}

function sanitizeFilename(name) {
  const base = path.basename(name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
  return base.slice(0, 120) || 'file';
}

/**
 * Upload a single image buffer to S3 and return a public URL.
 * @param {Express.Multer.File} file — multer memoryStorage file
 * @returns {Promise<string>}
 */
async function uploadImage(file) {
  if (!file || !file.buffer) {
    throw new AppError('No file provided', 400);
  }
  const allowed = /^image\//i;
  if (!allowed.test(file.mimetype)) {
    throw new AppError('Only image uploads are allowed', 400);
  }

  const s3 = getS3();
  const ext = path.extname(file.originalname) || '.bin';
  const key = `media/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;

  await s3
    .upload({
      Bucket: config.aws.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: 'max-age=31536000',
    })
    .promise();

  if (config.aws.publicBaseUrl) {
    return `${config.aws.publicBaseUrl.replace(/\/$/, '')}/${key}`;
  }

  const region = config.aws.region;
  const bucket = config.aws.bucket;
  if (region === 'us-east-1') {
    return `https://${bucket}.s3.amazonaws.com/${key}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

module.exports = { uploadImage, getS3 };
