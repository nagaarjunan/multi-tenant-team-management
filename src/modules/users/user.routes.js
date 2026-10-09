const { Router } = require('express');
const { userController } = require('./user.controller');
const authenticate = require('../../middleware/authenticate');

const router = Router();

router.get('/profile', authenticate, userController.getUserProfile);
router.get('/', authenticate, userController.getAllUsers);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);

module.exports = {
  userRoutes: router,
};
