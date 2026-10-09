const mongoose = require('mongoose');
const { teamRepository } = require('./team.repository');

class TeamService {
  constructor(teamRepo = teamRepository) {
    this.teamRepo = teamRepo;
  }

  async createTeam(organizationId, name, description, leaderId) {
    return this.teamRepo.create({
      name,
      description,
      organizationId: new mongoose.Types.ObjectId(organizationId),
      ...(leaderId ? { leaderId: new mongoose.Types.ObjectId(leaderId) } : {}),
      ...(leaderId ? { members: [new mongoose.Types.ObjectId(leaderId)] } : { members: [] }),
    });
  }

  async getTeamById(id) {
    const team = await this.teamRepo.findById(id);
    if (!team) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }
    return team;
  }

  async getOrganizationTeams(organizationId) {
    return this.teamRepo.findByOrganization(organizationId);
  }

  async updateTeam(id, updateData) {
    const updated = await this.teamRepo.update(id, updateData);
    if (!updated) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }
    return updated;
  }

  async addMemberToTeam(teamId, userId) {
    const updated = await this.teamRepo.addMember(teamId, userId);
    if (!updated) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }
    return updated;
  }

  async removeMemberFromTeam(teamId, userId) {
    const updated = await this.teamRepo.removeMember(teamId, userId);
    if (!updated) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }
    return updated;
  }

  async deleteTeam(id) {
    const deleted = await this.teamRepo.delete(id);
    if (!deleted) {
      const error = new Error('Team not found');
      error.statusCode = 404;
      throw error;
    }
    return { message: 'Team deleted successfully' };
  }
}

module.exports = {
  TeamService,
  teamService: new TeamService(),
};
