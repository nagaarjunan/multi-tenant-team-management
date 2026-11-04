const { ProjectModel } = require('./project.model');
const { TeamModel } = require('../teams/team.model');
const AppError = require('../../utils/AppError');

// Helper to get all user IDs that belong to a team (members + leader)
const getTeamMemberIdStrings = (team) => {
  const ids = (team.members || []).map((m) => (m._id ? m._id.toString() : m.toString()));
  if (team.leaderId) {
    ids.push(team.leaderId._id ? team.leaderId._id.toString() : team.leaderId.toString());
  }
  return ids;
};

const createProject = async (organizationId, data) => {
  const { name, description, teamId, leadId, members = [], status, startDate, endDate } = data;

  if (!name || !teamId || !leadId) {
    throw AppError.badRequest('Project name, teamId, and leadId (Product Manager/Lead) are required');
  }

  // Verify team exists and belongs to the specified organization
  const team = await TeamModel.findById(teamId);
  if (!team) {
    throw AppError.notFound('Assigned team not found');
  }

  const teamOrgId = team.organizationId?._id || team.organizationId;
  if (teamOrgId.toString() !== organizationId.toString()) {
    throw AppError.badRequest('The specified team does not belong to this organization');
  }

  const teamMemberIds = getTeamMemberIdStrings(team);

  // Validate Project Lead is part of the team
  if (!teamMemberIds.includes(leadId.toString())) {
    throw AppError.badRequest('The assigned Project Lead / Product Manager must be a member of the selected team');
  }

  // Validate allocated members are part of the team
  for (const memberId of members) {
    if (!teamMemberIds.includes(memberId.toString())) {
      throw AppError.badRequest(`Member ${memberId} is not part of team "${team.name}". Can only allocate from the team.`);
    }
  }

  // Combine lead and members uniquely
  const uniqueMemberIds = Array.from(new Set([leadId.toString(), ...members.map((m) => m.toString())]));

  return ProjectModel.create({
    name,
    description,
    organizationId,
    teamId,
    leadId,
    members: uniqueMemberIds,
    status: status || 'planning',
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });
};

const getProjectById = async (id) => {
  const project = await ProjectModel.findById(id)
    .populate('organizationId', 'name slug')
    .populate('teamId', 'name description')
    .populate('leadId', 'name email role')
    .populate('members', 'name email role');

  if (!project) {
    throw AppError.notFound('Project not found');
  }
  return project;
};

const getOrganizationProjects = async (organizationId) => {
  return ProjectModel.find({ organizationId })
    .populate('teamId', 'name')
    .populate('leadId', 'name email')
    .populate('members', 'name email');
};

const getTeamProjects = async (teamId) => {
  return ProjectModel.find({ teamId })
    .populate('leadId', 'name email')
    .populate('members', 'name email');
};

const updateProject = async (id, updateData) => {
  const updated = await ProjectModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('leadId', 'name email')
    .populate('members', 'name email');

  if (!updated) {
    throw AppError.notFound('Project not found');
  }
  return updated;
};

const allocateMembers = async (projectId, memberIds) => {
  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    throw AppError.badRequest('memberIds array is required');
  }

  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw AppError.notFound('Project not found');
  }

  // Verify all memberIds belong to the project's assigned team
  const team = await TeamModel.findById(project.teamId);
  if (team) {
    const teamMemberIds = getTeamMemberIdStrings(team);
    for (const mId of memberIds) {
      if (!teamMemberIds.includes(mId.toString())) {
        throw AppError.badRequest(`User ${mId} is not a member of team "${team.name}"`);
      }
    }
  }

  return ProjectModel.findByIdAndUpdate(
    projectId,
    { $addToSet: { members: { $each: memberIds } } },
    { new: true }
  )
    .populate('leadId', 'name email')
    .populate('members', 'name email');
};

const assignProjectLead = async (projectId, leadId) => {
  if (!leadId) {
    throw AppError.badRequest('leadId is required');
  }

  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw AppError.notFound('Project not found');
  }

  const team = await TeamModel.findById(project.teamId);
  if (team) {
    const teamMemberIds = getTeamMemberIdStrings(team);
    if (!teamMemberIds.includes(leadId.toString())) {
      throw AppError.badRequest(`User ${leadId} is not a member of team "${team.name}"`);
    }
  }

  return ProjectModel.findByIdAndUpdate(
    projectId,
    {
      leadId,
      $addToSet: { members: leadId },
    },
    { new: true }
  )
    .populate('leadId', 'name email')
    .populate('members', 'name email');
};

const removeMember = async (projectId, userId) => {
  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw AppError.notFound('Project not found');
  }

  if (project.leadId?.toString() === userId.toString()) {
    throw AppError.badRequest('Cannot remove the project lead. Reassign the lead before removing them.');
  }

  return ProjectModel.findByIdAndUpdate(
    projectId,
    { $pull: { members: userId } },
    { new: true }
  )
    .populate('leadId', 'name email')
    .populate('members', 'name email');
};

const deleteProject = async (id) => {
  const deleted = await ProjectModel.findByIdAndDelete(id);
  if (!deleted) {
    throw AppError.notFound('Project not found');
  }
  return { message: 'Project deleted successfully' };
};

module.exports = {
  createProject,
  getProjectById,
  getOrganizationProjects,
  getTeamProjects,
  updateProject,
  allocateMembers,
  assignProjectLead,
  removeMember,
  deleteProject,
};
