const AWS = require('aws-sdk');
const path = require('path');
const config = require('../config');
const AppError = require('../utils/AppError');

/** Allowed logical folders under the object prefix (matches bucket layout). */
const MEDIA_FOLDERS = ['images', 'videos', 'reports'];

const MIME_RULES = {
  images: /^image\//i,
  videos: /^video\//i,
  reports: /^application\/pdf$/i,
};

const MAX_BYTES = {
  images: Number(process.env.S3_MAX_IMAGE_BYTES) || 25 * 1024 * 1024,
  videos: Number(process.env.S3_MAX_VIDEO_BYTES) || 100 * 1024 * 1024,
  reports: Number(process.env.S3_MAX_REPORT_BYTES) || 50 * 1024 * 1024,
};

let s3Client = null;

function getS3() {
  if (!config.aws.bucket) {
    throw new AppError('S3 is not configured: set AWS_BUCKET_NAME (e.g. infra-audit-platform-punjab).', 503);
  }
  if (!config.aws.region) {
    throw new AppError('S3 is not configured: set AWS_REGION to match your EC2 region.', 503);
  }

  if (!s3Client) {
    const opts = {
      region: config.aws.region,
      signatureVersion: 'v4',
    };
    if (config.aws.accessKeyId && config.aws.secretAccessKey) {
      opts.accessKeyId = config.aws.accessKeyId;
      opts.secretAccessKey = config.aws.secretAccessKey;
    }
    s3Client = new AWS.S3(opts);
  }
  return s3Client;
}

function objectPrefix() {
  return (config.aws.s3ObjectPrefix || 'infra-audit').replace(/^\/+|\/+$/g, '');
}

function buildObjectKey(folder, filenamePart) {
  const prefix = objectPrefix();
  return `${prefix}/${folder}/${filenamePart}`;
}

function sanitizeFilename(name) {
  const base = path.basename(name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
  return base.slice(0, 180) || 'file';
}

function validateFolder(folder) {
  if (!MEDIA_FOLDERS.includes(folder)) {
    throw new AppError(`Invalid folder. Use one of: ${MEDIA_FOLDERS.join(', ')}`, 400);
  }
}

function validateMimeForFolder(folder, mimetype) {
  const rule = MIME_RULES[folder];
  if (!rule.test(mimetype || '')) {
    throw new AppError(`Invalid file type for folder "${folder}" (${mimetype})`, 400);
  }
}

function validateSize(folder, size) {
  const max = MAX_BYTES[folder];
  if (size > max) {
    throw new AppError(`File too large for "${folder}" (max ${Math.round(max / (1024 * 1024))} MB)`, 400);
  }
}

/**
 * Infer folder from MIME when uploading audit evidence (no PDF here).
 */
function detectMediaFolderFromMime(mimetype) {
  if (MIME_RULES.images.test(mimetype || '')) return 'images';
  if (MIME_RULES.videos.test(mimetype || '')) return 'videos';
  throw new AppError(`Unsupported media type for audit upload: ${mimetype}`, 400);
}

/**
 * @param {Express.Multer.File} file
 * @param {'images'|'videos'|'reports'} folder
 * @returns {Promise<{ key: string, signedUrl: string, expiresIn: number }>}
 */
async function uploadFile(file, folder) {
  if (!file || !file.buffer) {
    throw new AppError('No file provided', 400);
  }
  validateFolder(folder);
  validateMimeForFolder(folder, file.mimetype);
  validateSize(folder, file.size);

  const s3 = getS3();
  const bucket = config.aws.bucket;
  const uniqueName = `${Date.now()}-${sanitizeFilename(file.originalname)}`;
  const key = buildObjectKey(folder, uniqueName);

  try {
    await s3
      .putObject({
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype || 'application/octet-stream',
        ServerSideEncryption: 'AES256',
        CacheControl: folder === 'reports' ? 'private, max-age=0' : 'private, max-age=31536000',
      })
      .promise();
  } catch (err) {
    const msg = err && err.message ? err.message : 'S3 upload failed';
    throw new AppError(`Storage upload failed: ${msg}`, 502);
  }

  const expiresIn = config.aws.s3SignedUrlTtlSeconds;
  let signedUrl;
  try {
    signedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: bucket,
      Key: key,
      Expires: expiresIn,
    });
  } catch (err) {
    const msg = err && err.message ? err.message : 'Could not sign URL';
    throw new AppError(`Storage URL signing failed: ${msg}`, 502);
  }

  return { key, signedUrl, expiresIn };
}

/**
 * Issue a fresh read URL for an object key stored in MongoDB.
 * @param {string} key — full S3 key, e.g. infra-audit/images/1730…-photo.jpg
 */
async function getSignedGetUrl(key) {
  if (!key || typeof key !== 'string') {
    throw new AppError('Invalid storage key', 400);
  }
  const s3 = getS3();
  const bucket = config.aws.bucket;
  const expiresIn = config.aws.s3SignedUrlTtlSeconds;
  return s3.getSignedUrlPromise('getObject', {
    Bucket: bucket,
    Key: key,
    Expires: expiresIn,
  });
}

/**
 * If value looks like an http(s) legacy URL, return as-is; otherwise treat as S3 key and sign.
 */
async function resolveMediaReference(ref) {
  if (!ref || typeof ref !== 'string') return ref;
  if (/^https?:\/\//i.test(ref)) return ref;
  return getSignedGetUrl(ref);
}

async function resolveMediaList(refs) {
  if (!Array.isArray(refs) || refs.length === 0) return [];
  return Promise.all(refs.map((r) => resolveMediaReference(r)));
}

module.exports = {
  MEDIA_FOLDERS,
  uploadFile,
  getSignedGetUrl,
  resolveMediaReference,
  resolveMediaList,
  detectMediaFolderFromMime,
  objectPrefix,
  buildObjectKey,
};
