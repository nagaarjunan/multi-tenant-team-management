const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.token;

  let token = null;

  if (cookieToken) {
    token = cookieToken;
  } else if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(AppError.unauthorized('Access denied. No authentication token provided.'));
  }

  const secret = process.env.JWT_SECRET || 'default_jwt_secret_key';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    next(AppError.unauthorized('Invalid or expired authentication token.'));
  }
};

module.exports = authenticate;
