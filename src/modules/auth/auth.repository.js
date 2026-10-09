const { UserModel } = require('../users/user.model');

class AuthRepository {
  async findByEmail(email) {
    return UserModel.findOne({ email }).select('+password').exec();
  }

  async createUser(userData) {
    const user = new UserModel(userData);
    return user.save();
  }

  async findById(id) {
    return UserModel.findById(id).exec();
  }
}

module.exports = {
  AuthRepository,
  authRepository: new AuthRepository(),
};
