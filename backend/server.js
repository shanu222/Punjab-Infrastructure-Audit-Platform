const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./utils/logger');
const asyncHandler = require('./middleware/asyncHandler');
const { validateBody } = require('./middleware/validate');
const { loginSchema } = require('./validators/schemas');
const { login: loginUser } = require('./controllers/authController');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');
const auditRoutes = require('./routes/auditRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const logsRoutes = require('./routes/logsRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const mapRoutes = require('./routes/mapRoutes');
const aiRoutes = require('./routes/aiRoutes');
const futureRoutes = require('./routes/futureRoutes');

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet());

const DEFAULT_CORS_ORIGINS = [
  'https://punjab-infrastructure-audit-platform.vercel.app',
  'https://www.sustainablesolution360.com',
];

/** Merge `CORS_ORIGIN` (comma-separated) with defaults; dedupe. Wildcard `*` disables credentials. */
function resolveCorsOrigin() {
  const raw = process.env.CORS_ORIGIN;
  if (raw === '*') {
    return { origin: '*', credentials: false };
  }
  const fromEnv = raw
    ? raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const merged = [...new Set([...DEFAULT_CORS_ORIGINS, ...fromEnv])];
  if (merged.length === 0) {
    return { origin: true, credentials: true };
  }
  if (merged.length === 1) {
    return { origin: merged[0], credentials: true };
  }
  return { origin: merged, credentials: true };
}

const corsOpts = resolveCorsOrigin();
app.use(cors(corsOpts));
app.use(express.json({ limit: '5mb' }));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    logger.info('http_request', {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration_ms: Date.now() - started,
    });
  });
  next();
});

const healthPayload = () => ({
  ok: true,
  service: 'piap-backend',
  timestamp: new Date().toISOString(),
});

app.get('/health', (req, res) => {
  res.json(healthPayload());
});

/** Same payload as /health — useful when probing through `/api`-only paths or reverse proxies. */
app.get('/api/health', (req, res) => {
  res.json(healthPayload());
});

app.use('/api/auth', authRoutes);
/** Backward compatibility: older clients called `/api/login` or `/login` instead of `/api/auth/login`. */
app.post('/api/login', validateBody(loginSchema), asyncHandler(loginUser));
app.post('/login', validateBody(loginSchema), asyncHandler(loginUser));
app.use('/api/logs', logsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/future-analysis', futureRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('mongodb_connected', { uri_host: (config.mongoUri || '').split('@').pop() });
  } catch (err) {
    logger.error('mongodb_connection_failed', { message: err.message });
    process.exit(1);
  }

  const host = process.env.BIND_HOST || '0.0.0.0';
  const server = app.listen(config.port, host, () => {
    logger.info('server_listening', { port: config.port, host, nodeEnv: config.nodeEnv });
  });

  const shutdown = async (signal) => {
    logger.warn('shutdown_signal', { signal });
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
