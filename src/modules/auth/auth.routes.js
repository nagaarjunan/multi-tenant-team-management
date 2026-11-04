const { Router } = require('express');
const authController = require('./auth.controller');
const authenticate = require('../../middleware/authenticate');

const router = Router();

// Registration
router.post('/register', authController.register);
router.post('/signup', authController.register);

// Login
router.post('/login', authController.login);
router.post('/signin', authController.login);

// Session
router.post('/logout', authController.logout);
router.get('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = {
  authRoutes: router,
};
