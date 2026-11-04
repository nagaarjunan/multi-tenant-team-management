const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserModel } = require('../users/user.model');
const AppError = require('../../utils/AppError');
const logger = require('../../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (userId, email, role) => {
  return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const formatAuthResponse = (user, token) => ({
  user: {
    id: user._id.toString(),
    _id: user._id,
    name: user.name,
    username: user.name,
    email: user.email,
    role: user.role,
    roles: [{ id: user.role, name: user.role }],
  },
  token,
  accessToken: token,
  refreshToken: token,
});

const register = async ({ name, username, email, password, role }) => {
  const displayName = name || username;
  if (!displayName || !email || !password) {
    throw AppError.badRequest('Name, email, and password are required');
  }

  logger.info(`[Auth] Attempting registration for "${displayName}" <${email}>`);

  const existingUser = await UserModel.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    logger.warn(`[Auth] Registration conflict: email "${email}" already exists`);
    throw AppError.conflict('Email is already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await UserModel.create({
    name: displayName.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    role: role || 'member',
  });

  logger.success(`[Auth] Registered user "${user.name}" [id: ${user._id}, role: ${user.role}]`);
  const token = generateToken(user._id.toString(), user.email, user.role);
  return formatAuthResponse(user, token);
};

const login = async ({ email, username, password }) => {
  const rawIdentifier = (email || username || '').trim();
  const identifier = rawIdentifier.toLowerCase();
  if (!identifier || !password) {
    throw AppError.badRequest('Email/username and password are required');
  }

  logger.debug(`[Auth] Attempting login for identifier: "${rawIdentifier}"`);

  const escaped = rawIdentifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const user = await UserModel.findOne({
    $or: [
      { email: identifier },
      { name: new RegExp(`^${escaped}$`, 'i') },
    ],
  }).select('+password');

  if (!user) {
    logger.warn(`[Auth] Login failed: User not found for "${rawIdentifier}"`);
    throw AppError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    logger.warn(`[Auth] Login failed: Invalid password for user "${user.name}" (${user.email})`);
    throw AppError.unauthorized('Invalid email or password');
  }

  logger.success(`[Auth] Login successful for user "${user.name}" [role: ${user.role}]`);
  const token = generateToken(user._id.toString(), user.email, user.role);
  return formatAuthResponse(user, token);
};

const getCurrentUser = async (userId) => {
  logger.debug(`[Auth] Querying user profile for userId: ${userId}`);
  const user = await UserModel.findById(userId);
  if (!user) {
    logger.warn(`[Auth] User profile not found for userId: ${userId}`);
    throw AppError.notFound('User not found');
  }
  return {
    id: user._id.toString(),
    _id: user._id,
    name: user.name,
    username: user.name,
    email: user.email,
    role: user.role,
    roles: [{ id: user.role, name: user.role, code: user.role }],
    permissions: [],
  };
};

module.exports = {
  register,
  login,
  getCurrentUser,
  generateToken,
};
