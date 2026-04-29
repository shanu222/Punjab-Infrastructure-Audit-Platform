const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');

function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Not authorized — missing or invalid token', 401));
  }

  const token = header.slice(7).trim();
  if (!token) {
    return next(new AppError('Not authorized — missing token', 401));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    if (!decoded.sub || !decoded.role) {
      return next(new AppError('Not authorized — invalid token payload', 401));
    }
    req.user = { id: decoded.sub, role: decoded.role };
    return next();
  } catch {
    return next(new AppError('Not authorized — token expired or invalid', 401));
  }
}

module.exports = { protect };
