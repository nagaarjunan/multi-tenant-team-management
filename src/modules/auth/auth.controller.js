const authService = require('./auth.service');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
};

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.cookie('token', result.token, COOKIE_OPTIONS);
    res.status(201).json({
      success: true,
      status: 0,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.cookie('token', result.token, COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      status: 0,
      message: 'Logged in successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  res.clearCookie('token', COOKIE_OPTIONS);
  res.status(200).json({
    success: true,
    status: 0,
    message: 'Logged out successfully',
  });
};

const getMe = async (req, res, next) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ success: false, status: -1, message: 'Unauthorized' });
    }
    const user = await authService.getCurrentUser(req.user.userId);
    res.status(200).json({ success: true, status: 0, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
};
