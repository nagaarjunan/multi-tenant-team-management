const mongoose = require('mongoose');
const { TeamModel } = require('./team.model');

class TeamRepository {
  async findById(id) {
    return TeamModel.findById(id)
      .populate('leaderId', 'name email role')
      .populate('members', 'name email role')
      .exec();
  }

  async findByOrganization(organizationId) {
    return TeamModel.find({ organizationId: new mongoose.Types.ObjectId(organizationId) })
      .populate('leaderId', 'name email role')
      .populate('members', 'name email role')
      .exec();
  }

  async create(data) {
    const team = new TeamModel(data);
    return team.save();
  }

  async update(id, updateData) {
    return TeamModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  async addMember(teamId, userId) {
    return TeamModel.findByIdAndUpdate(
      teamId,
      { $addToSet: { members: new mongoose.Types.ObjectId(userId) } },
      { new: true }
    ).exec();
  }

  async removeMember(teamId, userId) {
    return TeamModel.findByIdAndUpdate(
      teamId,
      { $pull: { members: new mongoose.Types.ObjectId(userId) } },
      { new: true }
    ).exec();
  }

  async delete(id) {
    return TeamModel.findByIdAndDelete(id).exec();
  }
}

module.exports = {
  TeamRepository,
  teamRepository: new TeamRepository(),
};
