const crypto = require('crypto');
const logger = require('../utils/logger');
const { colors, sanitize } = logger;

const getMethodColor = (method) => {
  switch (method) {
    case 'GET':
      return colors.green;
    case 'POST':
      return colors.cyan;
    case 'PUT':
    case 'PATCH':
      return colors.yellow;
    case 'DELETE':
      return colors.red;
    default:
      return colors.magenta;
  }
};

const getStatusColor = (status) => {
  if (status >= 500) return colors.red;
  if (status >= 400) return colors.yellow;
  if (status >= 300) return colors.cyan;
  return colors.green;
};

/**
 * Production-ready HTTP Request Logger Middleware
 * - Ingress and egress request tracing
 * - Unique correlation ID per request (X-Request-Id)
 * - Safe sanitization of body/query parameters
 * - Precise millisecond execution timing
 */
const requestLogger = (req, res, next) => {
  // 1. Assign unique correlation ID
  const reqId = req.headers['x-request-id'] || `req-${crypto.randomBytes(4).toString('hex')}`;
  req.id = reqId;
  res.setHeader('X-Request-Id', reqId);

  const startTime = process.hrtime();
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const methodColor = getMethodColor(req.method);
  const formattedMethod = `${methodColor}${colors.bold}${req.method}${colors.reset}`;
  const reqPath = req.originalUrl || req.url;

  // 2. Ingress Log: Record request arrival with IP and params
  logger.http(`--> [${req.id}] ${formattedMethod} ${reqPath} (from: ${clientIp})`);

  // Log Query Parameters if present
  if (req.query && Object.keys(req.query).length > 0) {
    logger.debug(`    [${req.id}] Query:`, sanitize(req.query));
  }

  // Log sanitized Request Body if present
  if (req.body && Object.keys(req.body).length > 0 && req.method !== 'GET') {
    logger.debug(`    [${req.id}] Body:`, sanitize(req.body));
  }

  // 3. Egress Log: Record response completion, status code, timing & user identity
  res.on('finish', () => {
    const diff = process.hrtime(startTime);
    const durationMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

    const statusColor = getStatusColor(res.statusCode);
    const formattedStatus = `${statusColor}${colors.bold}${res.statusCode}${colors.reset}`;
    const formattedDuration = `${colors.gray}${durationMs}ms${colors.reset}`;

    let userTag = '';
    if (req.user?.userId || req.user?.id) {
      const uId = req.user.userId || req.user.id;
      const uRole = req.user.role ? ` [${req.user.role}]` : '';
      userTag = ` ${colors.dim}(user: ${uId}${uRole})${colors.reset}`;
    }

    logger.http(
      `<-- [${req.id}] ${formattedMethod} ${reqPath} -> ${formattedStatus} [${formattedDuration}]${userTag}`
    );
  });

  next();
};

module.exports = requestLogger;
