const mongoose = require('mongoose');
const { projectRepository } = require('./project.repository');
const { teamRepository } = require('../teams/team.repository');

class ProjectService {
  constructor(
    projectRepo = projectRepository,
    teamRepo = teamRepository
  ) {
    this.projectRepo = projectRepo;
    this.teamRepo = teamRepo;
  }

  async createProject(organizationId, data) {
    const { name, description, teamId, leadId, members = [], status, startDate, endDate } = data;

    if (!name || !teamId || !leadId) {
      const error = new Error('Project name, teamId, and leadId (Product Manager/Lead) are required');
      error.statusCode = 400;
      throw error;
    }

    // Verify team exists and belongs to the specified organization
    const team = await this.teamRepo.findById(teamId);
    if (!team) {
      const error = new Error('Assigned team not found');
      error.statusCode = 404;
      throw error;
    }

    const teamOrgId = team.organizationId?._id || team.organizationId;
    if (teamOrgId.toString() !== organizationId.toString()) {
      const error = new Error('The specified team does not belong to this organization');
      error.statusCode = 400;
      throw error;
    }

    // Verify team members list (strings for comparison)
    const teamMemberIds = (team.members || []).map((m) => (m._id ? m._id.toString() : m.toString()));
    if (team.leaderId) {
      teamMemberIds.push(team.leaderId._id ? team.leaderId._id.toString() : team.leaderId.toString());
    }

    // Check if the chosen Lead / Product Manager is in the team
    if (!teamMemberIds.includes(leadId.toString())) {
      const error = new Error('The assigned Project Lead / Product Manager must be a member of the selected team');
      error.statusCode = 400;
      throw error;
    }

    // Verify allocated members are part of the team
    for (const memberId of members) {
      if (!teamMemberIds.includes(memberId.toString())) {
        const error = new Error(`Member ${memberId} is not part of team "${team.name}". Can only allocate from the team.`);
        error.statusCode = 400;
        throw error;
      }
    }

    // Ensure lead is also included in project members list
    const combinedMembers = Array.from(new Set([leadId.toString(), ...members.map((m) => m.toString())])).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    return this.projectRepo.create({
      name,
      description,
      organizationId: new mongoose.Types.ObjectId(organizationId),
      teamId: new mongoose.Types.ObjectId(teamId),
      leadId: new mongoose.Types.ObjectId(leadId),
      members: combinedMembers,
      status: status || 'planning',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  async getProjectById(id) {
    const project = await this.projectRepo.findById(id);
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }
    return project;
  }

  async getOrganizationProjects(organizationId) {
    return this.projectRepo.findByOrganization(organizationId);
  }

  async getTeamProjects(teamId) {
    return this.projectRepo.findByTeam(teamId);
  }

  async updateProject(id, updateData) {
    const updated = await this.projectRepo.update(id, updateData);
    if (!updated) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }
    return updated;
  }

  async allocateMembers(projectId, memberIds) {
    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      const error = new Error('memberIds array is required');
      error.statusCode = 400;
      throw error;
    }

    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify memberIds exist in the project's team
    const team = await this.teamRepo.findById(project.teamId._id || project.teamId);
    if (team) {
      const teamMemberIds = (team.members || []).map((m) => (m._id ? m._id.toString() : m.toString()));
      if (team.leaderId) {
        teamMemberIds.push(team.leaderId._id ? team.leaderId._id.toString() : team.leaderId.toString());
      }
      for (const mId of memberIds) {
        if (!teamMemberIds.includes(mId.toString())) {
          const error = new Error(`User ${mId} is not a member of team "${team.name}"`);
          error.statusCode = 400;
          throw error;
        }
      }
    }

    return this.projectRepo.allocateMembers(projectId, memberIds);
  }

  async assignProjectLead(projectId, leadId) {
    if (!leadId) {
      const error = new Error('leadId is required');
      error.statusCode = 400;
      throw error;
    }

    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify lead is part of the project's team
    const team = await this.teamRepo.findById(project.teamId._id || project.teamId);
    if (team) {
      const teamMemberIds = (team.members || []).map((m) => (m._id ? m._id.toString() : m.toString()));
      if (team.leaderId) {
        teamMemberIds.push(team.leaderId._id ? team.leaderId._id.toString() : team.leaderId.toString());
      }
      if (!teamMemberIds.includes(leadId.toString())) {
        const error = new Error(`User ${leadId} is not a member of team "${team.name}"`);
        error.statusCode = 400;
        throw error;
      }
    }

    return this.projectRepo.assignLead(projectId, leadId);
  }

  async removeMember(projectId, userId) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }

    if (project.leadId?._id?.toString() === userId.toString() || project.leadId?.toString() === userId.toString()) {
      const error = new Error('Cannot remove the project lead. Reassign the lead before removing them.');
      error.statusCode = 400;
      throw error;
    }

    return this.projectRepo.removeMember(projectId, userId);
  }

  async deleteProject(id) {
    const deleted = await this.projectRepo.delete(id);
    if (!deleted) {
      const error = new Error('Project not found');
      error.statusCode = 404;
      throw error;
    }
    return { message: 'Project deleted successfully' };
  }
}

module.exports = {
  ProjectService,
  projectService: new ProjectService(),
};
