const fs = require('fs');
const path = require('path');
const util = require('util');

/**
 * ANSI Color Palette for Terminal Output
 */
const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  brightWhite: '\x1b[97m',
  bgRed: '\x1b[41m\x1b[37m',
  bgGreen: '\x1b[42m\x1b[30m',
  bgYellow: '\x1b[43m\x1b[30m',
  bgBlue: '\x1b[44m\x1b[37m',
  bgCyan: '\x1b[46m\x1b[30m',
};

const LOG_LEVELS = {
  debug: 0,
  db: 1,
  http: 2,
  info: 3,
  success: 3,
  warn: 4,
  error: 5,
};

const SENSITIVE_KEYS = new Set([
  'password',
  'pass',
  'confirmpassword',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'secret',
  'cookie',
  'creditcard',
]);

/**
 * Deeply sanitizes sensitive data (passwords, tokens, secrets) from objects
 */
const sanitize = (data, seen = new WeakSet()) => {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (seen.has(data)) return '[Circular]';
  seen.add(data);

  if (Array.isArray(data)) {
    return data.map((item) => sanitize(item, seen));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey)) {
      sanitized[key] = '[FILTERED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitize(value, seen);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Get configured log level from environment
 */
const getActiveLogLevel = () => {
  const envLevel = (process.env.LOG_LEVEL || '').toLowerCase();
  if (envLevel in LOG_LEVELS) return LOG_LEVELS[envLevel];
  return process.env.NODE_ENV === 'production' ? LOG_LEVELS.info : LOG_LEVELS.debug;
};

/**
 * Setup optional file logger directory
 */
const LOG_DIR = path.resolve(process.cwd(), 'logs');
const SHOULD_LOG_TO_FILE = process.env.LOG_TO_FILE !== 'false';

let isLogDirReady = false;
const ensureLogDir = () => {
  if (!isLogDirReady && SHOULD_LOG_TO_FILE) {
    try {
      if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
      }
      isLogDirReady = true;
    } catch {
      // Ignore directory creation failure in read-only environments
    }
  }
};

const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, '');

const writeLogToFile = (filename, message) => {
  if (!SHOULD_LOG_TO_FILE) return;
  ensureLogDir();
  try {
    const plainText = stripAnsi(message) + '\n';
    fs.appendFile(path.join(LOG_DIR, filename), plainText, () => {});
  } catch {
    // Ignore file write errors
  }
};

const getTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`;
};

const formatOutput = (levelLabel, levelColor, message, ...args) => {
  const time = getTimestamp();
  const timeStr = `${COLORS.gray}${time}${COLORS.reset}`;
  const badge = `${levelColor}${levelLabel.padEnd(7)}${COLORS.reset}`;

  let formattedMsg = typeof message === 'object' && message !== null
    ? util.inspect(sanitize(message), { depth: 5, colors: true })
    : String(message);

  const formattedArgs = args.map((arg) => {
    if (typeof arg === 'object' && arg !== null) {
      return util.inspect(sanitize(arg), { depth: 5, colors: true });
    }
    return arg;
  });

  const fullTerminalText = [`[${timeStr}] ${badge} ${formattedMsg}`, ...formattedArgs].join(' ');
  const fullPlainRecord = `[${time}] ${levelLabel.padEnd(7)} ${formattedMsg} ${formattedArgs.join(' ')}`;

  return { fullTerminalText, fullPlainRecord };
};

const logger = {
  colors: COLORS,
  sanitize,

  debug: (message, ...args) => {
    if (getActiveLogLevel() > LOG_LEVELS.debug) return;
    const { fullTerminalText, fullPlainRecord } = formatOutput('DEBUG', COLORS.magenta, message, ...args);
    console.log(fullTerminalText);
    writeLogToFile('app.log', fullPlainRecord);
  },

  db: (message, ...args) => {
    if (getActiveLogLevel() > LOG_LEVELS.db) return;
    const { fullTerminalText, fullPlainRecord } = formatOutput('DB', COLORS.cyan, message, ...args);
    console.log(fullTerminalText);
    writeLogToFile('app.log', fullPlainRecord);
  },

  http: (message, ...args) => {
    if (getActiveLogLevel() > LOG_LEVELS.http) return;
    const { fullTerminalText, fullPlainRecord } = formatOutput('HTTP', COLORS.blue, message, ...args);
    console.log(fullTerminalText);
    writeLogToFile('app.log', fullPlainRecord);
  },

  info: (message, ...args) => {
    if (getActiveLogLevel() > LOG_LEVELS.info) return;
    const { fullTerminalText, fullPlainRecord } = formatOutput('INFO', COLORS.cyan, message, ...args);
    console.log(fullTerminalText);
    writeLogToFile('app.log', fullPlainRecord);
  },

  success: (message, ...args) => {
    if (getActiveLogLevel() > LOG_LEVELS.success) return;
    const { fullTerminalText, fullPlainRecord } = formatOutput('SUCCESS', COLORS.green, message, ...args);
    console.log(fullTerminalText);
    writeLogToFile('app.log', fullPlainRecord);
  },

  warn: (message, ...args) => {
    if (getActiveLogLevel() > LOG_LEVELS.warn) return;
    const { fullTerminalText, fullPlainRecord } = formatOutput('WARN', COLORS.yellow, message, ...args);
    console.warn(fullTerminalText);
    writeLogToFile('app.log', fullPlainRecord);
  },

  error: (message, ...args) => {
    const { fullTerminalText, fullPlainRecord } = formatOutput('ERROR', COLORS.red, message, ...args);
    console.error(fullTerminalText);
    writeLogToFile('app.log', fullPlainRecord);
    writeLogToFile('error.log', fullPlainRecord);
  },
};

module.exports = logger;
