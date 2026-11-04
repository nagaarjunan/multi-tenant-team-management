const AppError = require('../utils/AppError');

const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required to perform this action.'));
    }

    if (!req.user.role || !allowedRoles.includes(req.user.role)) {
      return next(
        AppError.forbidden(`Forbidden: Access requires one of [${allowedRoles.join(', ')}] role.`)
      );
    }

    next();
  };
};

module.exports = authorizeRole;
