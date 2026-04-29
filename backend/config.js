require('dotenv').config();

const requiredInProduction = ['MONGO_URI', 'JWT_SECRET'];

function validateEnv() {
  if (process.env.NODE_ENV === 'production') {
    for (const key of requiredInProduction) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
  }
}

validateEnv();

/** Max TTL for S3 presigned GET (seconds). Capped at 7 days for SigV4 long-term credentials. */
const SEVEN_DAYS = 604800;
const requestedTtl = Number(process.env.AWS_S3_SIGNED_URL_TTL_SECONDS) || SEVEN_DAYS;
const s3SignedUrlTtlSeconds = Math.min(Math.max(requestedTtl, 60), SEVEN_DAYS);

module.exports = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/piap_audit',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  aws: {
    /** Optional: omit both to use the default credential provider chain (EC2 instance role, etc.). */
    accessKeyId: process.env.AWS_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET_KEY || '',
    region: process.env.AWS_REGION || 'ap-south-1',
    /** e.g. infra-audit-platform-punjab — same region as EC2 recommended */
    bucket: process.env.AWS_BUCKET_NAME || '',
    /** Object prefix inside bucket: infra-audit/images/... */
    s3ObjectPrefix: (process.env.S3_OBJECT_PREFIX || 'infra-audit').replace(/^\/+|\/+$/g, ''),
    s3SignedUrlTtlSeconds,
  },
};
