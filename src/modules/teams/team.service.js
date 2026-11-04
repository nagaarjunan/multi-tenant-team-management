const { TeamModel } = require('./team.model');
const AppError = require('../../utils/AppError');

const createTeam = async (organizationId, name, description, leaderId) => {
  return TeamModel.create({
    name,
    description,
    organizationId,
    leaderId: leaderId || undefined,
    members: leaderId ? [leaderId] : [],
  });
};

const getTeamById = async (id) => {
  const team = await TeamModel.findById(id)
    .populate('leaderId', 'name email role')
    .populate('members', 'name email role');

  if (!team) {
    throw AppError.notFound('Team not found');
  }
  return team;
};

const getOrganizationTeams = async (organizationId) => {
  return TeamModel.find({ organizationId })
    .populate('leaderId', 'name email role')
    .populate('members', 'name email role');
};

const updateTeam = async (id, updateData) => {
  const updated = await TeamModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    throw AppError.notFound('Team not found');
  }
  return updated;
};

const addMemberToTeam = async (teamId, userId) => {
  const updated = await TeamModel.findByIdAndUpdate(
    teamId,
    { $addToSet: { members: userId } },
    { new: true }
  );
  if (!updated) {
    throw AppError.notFound('Team not found');
  }
  return updated;
};

const removeMemberFromTeam = async (teamId, userId) => {
  const updated = await TeamModel.findByIdAndUpdate(
    teamId,
    { $pull: { members: userId } },
    { new: true }
  );
  if (!updated) {
    throw AppError.notFound('Team not found');
  }
  return updated;
};

const deleteTeam = async (id) => {
  const deleted = await TeamModel.findByIdAndDelete(id);
  if (!deleted) {
    throw AppError.notFound('Team not found');
  }
  return { message: 'Team deleted successfully' };
};

module.exports = {
  createTeam,
  getTeamById,
  getOrganizationTeams,
  updateTeam,
  addMemberToTeam,
  removeMemberFromTeam,
  deleteTeam,
};
