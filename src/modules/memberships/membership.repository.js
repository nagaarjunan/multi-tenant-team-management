const mongoose = require('mongoose');
const { MembershipModel } = require('./membership.model');

class MembershipRepository {
  async findByUserAndOrg(userId, organizationId) {
    return MembershipModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      organizationId: new mongoose.Types.ObjectId(organizationId),
    }).exec();
  }

  async findByOrganization(organizationId) {
    return MembershipModel.find({ organizationId: new mongoose.Types.ObjectId(organizationId) })
      .populate('userId', 'name email role')
      .exec();
  }

  async findByUser(userId) {
    return MembershipModel.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('organizationId', 'name slug')
      .exec();
  }

  async create(data) {
    const membership = new MembershipModel(data);
    return membership.save();
  }

  async updateRole(id, role) {
    return MembershipModel.findByIdAndUpdate(id, { role }, { new: true }).exec();
  }

  async delete(id) {
    return MembershipModel.findByIdAndDelete(id).exec();
  }
}

module.exports = {
  MembershipRepository,
  membershipRepository: new MembershipRepository(),
};
