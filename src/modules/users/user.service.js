const { UserModel } = require('./user.model');
const AppError = require('../../utils/AppError');

const getUserById = async (id) => {
  const user = await UserModel.findById(id);
  if (!user) {
    throw AppError.notFound('User not found');
  }
  return user;
};

const getAllUsers = async () => {
  return UserModel.find();
};

const updateUser = async (id, updateData) => {
  const safeData = { ...updateData };
  delete safeData.password;

  const user = await UserModel.findByIdAndUpdate(id, safeData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw AppError.notFound('User not found');
  }
  return user;
};

const deleteUser = async (id) => {
  const deleted = await UserModel.findByIdAndDelete(id);
  if (!deleted) {
    throw AppError.notFound('User not found');
  }
  return { message: 'User deleted successfully' };
};

module.exports = {
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
};
