const AppError = require('../utils/AppError');

/**
 * @param {...string} allowedRoles
 */
function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError('Not authorized', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Forbidden — insufficient role', 403));
    }
    return next();
  };
}

module.exports = { requireRoles };
