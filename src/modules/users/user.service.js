const { userRepository } = require('./user.repository');

class UserService {
  constructor(userRepo = userRepository) {
    this.userRepo = userRepo;
  }

  async getUserById(id) {
    const user = await this.userRepo.findById(id);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return user;
  }

  async getAllUsers() {
    return this.userRepo.findAll();
  }

  async updateUser(id, updateData) {
    const updatedUser = await this.userRepo.update(id, updateData);
    if (!updatedUser) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return updatedUser;
  }

  async deleteUser(id) {
    const deleted = await this.userRepo.delete(id);
    if (!deleted) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    return { message: 'User deleted successfully' };
  }
}

module.exports = {
  UserService,
  userService: new UserService(),
};
