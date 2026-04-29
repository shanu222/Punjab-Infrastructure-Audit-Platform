/**
 * Structured JSON logs for Amazon CloudWatch Logs (via agent / unified driver) or stdout shipping.
 * Set LOG_LEVEL=debug|info|warn|error (default info).
 */
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

function levelRank() {
  const env = (process.env.LOG_LEVEL || 'info').toLowerCase();
  return LEVELS[env] !== undefined ? LEVELS[env] : LEVELS.info;
}

function emit(level, message, meta = {}) {
  if (LEVELS[level] > levelRank()) return;
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    service: 'piap-backend',
    msg: message,
    ...meta,
  });
  if (level === 'error') console.error(line);
  else console.log(line);
}

module.exports = {
  info: (msg, meta) => emit('info', msg, meta),
  warn: (msg, meta) => emit('warn', msg, meta),
  error: (msg, meta) => emit('error', msg, meta),
  debug: (msg, meta) => emit('debug', msg, meta),
};
