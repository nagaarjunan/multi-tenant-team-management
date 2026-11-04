const logger = require('../utils/logger');
const AppError = require('../utils/AppError');

/**
 * Handle Mongoose CastError (e.g. invalid ObjectId format)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: "${err.value}". Expected a valid ID format.`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose duplicate key error (code 11000)
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : '';
  const formattedField = field.charAt(0).toUpperCase() + field.slice(1);
  const message = `${formattedField} "${value}" is already registered. Please choose another.`;
  return new AppError(message, 409);
};

/**
 * Handle Mongoose schema validation errors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors || {}).map((el) => el.message);
  const message = `Validation error: ${errors.join(', ')}`;
  return new AppError(message, 400, errors);
};

/**
 * Handle JWT verification errors
 */
const handleJWTError = () => {
  return new AppError('Invalid authentication token. Please log in again.', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Authentication token has expired. Please log in again.', 401);
};

/**
 * Centralized Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // Transform known library errors into standardized AppErrors
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    error = new AppError('Malformed JSON payload in request body.', 400);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const isOperational = error.isOperational || statusCode < 500;

  // Log error with detailed context
  const reqId = req.id ? `[${req.id}] ` : '';
  const reqContext = `${reqId}${req.method} ${req.originalUrl || req.url}`;
  if (statusCode >= 500) {
    const sanitizedBody = req.body ? JSON.stringify(logger.sanitize(req.body)) : 'none';
    logger.error(
      `[Server ${statusCode}] ${reqContext} -> ${message}\n` +
      `Payload: ${sanitizedBody}\n` +
      `${err.stack || ''}`
    );
  } else {
    logger.warn(`[Client ${statusCode}] ${reqContext} -> ${message}`);
  }

  // Response payload compatible with both standard REST and slash-admin frontend
  const responsePayload = {
    success: false,
    status: -1,
    message: isOperational ? message : 'An unexpected error occurred. Please try again later.',
  };

  if (error.details) {
    responsePayload.details = error.details;
  }

  // Attach stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
};

module.exports = errorHandler;
