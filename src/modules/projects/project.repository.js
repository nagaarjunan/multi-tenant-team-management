const mongoose = require('mongoose');
const { ProjectModel } = require('./project.model');

class ProjectRepository {
  async findById(id) {
    return ProjectModel.findById(id)
      .populate('organizationId', 'name slug')
      .populate('teamId', 'name description')
      .populate('leadId', 'name email role')
      .populate('members', 'name email role')
      .exec();
  }

  async findByOrganization(organizationId) {
    return ProjectModel.find({ organizationId: new mongoose.Types.ObjectId(organizationId) })
      .populate('teamId', 'name')
      .populate('leadId', 'name email')
      .populate('members', 'name email')
      .exec();
  }

  async findByTeam(teamId) {
    return ProjectModel.find({ teamId: new mongoose.Types.ObjectId(teamId) })
      .populate('leadId', 'name email')
      .populate('members', 'name email')
      .exec();
  }

  async create(data) {
    const project = new ProjectModel(data);
    return project.save();
  }

  async update(id, updateData) {
    return ProjectModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('leadId', 'name email')
      .populate('members', 'name email')
      .exec();
  }

  async allocateMembers(projectId, memberIds) {
    const objectIds = memberIds.map((mId) => new mongoose.Types.ObjectId(mId));
    return ProjectModel.findByIdAndUpdate(
      projectId,
      { $addToSet: { members: { $each: objectIds } } },
      { new: true }
    )
      .populate('leadId', 'name email')
      .populate('members', 'name email')
      .exec();
  }

  async removeMember(projectId, userId) {
    return ProjectModel.findByIdAndUpdate(
      projectId,
      { $pull: { members: new mongoose.Types.ObjectId(userId) } },
      { new: true }
    )
      .populate('leadId', 'name email')
      .populate('members', 'name email')
      .exec();
  }

  async assignLead(projectId, leadId) {
    return ProjectModel.findByIdAndUpdate(
      projectId,
      {
        leadId: new mongoose.Types.ObjectId(leadId),
        $addToSet: { members: new mongoose.Types.ObjectId(leadId) },
      },
      { new: true }
    )
      .populate('leadId', 'name email')
      .populate('members', 'name email')
      .exec();
  }

  async delete(id) {
    return ProjectModel.findByIdAndDelete(id).exec();
  }
}

module.exports = {
  ProjectRepository,
  projectRepository: new ProjectRepository(),
};
