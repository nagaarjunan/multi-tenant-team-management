const { Router } = require('express');
const { authController } = require('./auth.controller');
const authenticate = require('../../middleware/authenticate');

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);

module.exports = {
  authRoutes: router,
};
