const { UserModel } = require('./user.model');

class UserRepository {
  async findById(id) {
    return UserModel.findById(id).exec();
  }

  async findByEmail(email, includePassword = false) {
    const query = UserModel.findOne({ email });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  async create(userData) {
    const user = new UserModel(userData);
    return user.save();
  }

  async update(id, updateData) {
    return UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  async delete(id) {
    return UserModel.findByIdAndDelete(id).exec();
  }

  async findAll() {
    return UserModel.find().exec();
  }
}

module.exports = {
  UserRepository,
  userRepository: new UserRepository(),
};
