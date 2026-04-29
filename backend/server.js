const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');
const auditRoutes = require('./routes/auditRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const logsRoutes = require('./routes/logsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const mapRoutes = require('./routes/mapRoutes');
const aiRoutes = require('./routes/aiRoutes');
const futureRoutes = require('./routes/futureRoutes');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));

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

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'piap-backend',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/logs', logsRoutes);
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

  const server = app.listen(config.port, () => {
    logger.info('server_listening', { port: config.port, nodeEnv: config.nodeEnv });
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
