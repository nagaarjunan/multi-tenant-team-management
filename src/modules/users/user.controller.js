const { userService } = require('./user.service');

class UserController {
  constructor(userSvc = userService) {
    this.userSvc = userSvc;
  }

  getUserProfile = async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const user = await this.userSvc.getUserById(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  getUserById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await this.userSvc.getUserById(id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req, res, next) => {
    try {
      const users = await this.userSvc.getAllUsers();
      res.status(200).json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  };

  updateUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updatedUser = await this.userSvc.updateUser(id, req.body);
      res.status(200).json({ success: true, data: updatedUser });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await this.userSvc.deleteUser(id);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  UserController,
  userController: new UserController(),
};
