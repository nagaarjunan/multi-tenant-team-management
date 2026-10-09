const { teamService } = require('./team.service');

class TeamController {
  constructor(teamSvc = teamService) {
    this.teamSvc = teamSvc;
  }

  createTeam = async (req, res, next) => {
    try {
      const { name, description, organizationId, leaderId } = req.body;
      const orgId = organizationId || req.organizationId;

      if (!name || !orgId) {
        return res.status(400).json({ success: false, message: 'Team name and organizationId are required' });
      }

      const team = await this.teamSvc.createTeam(orgId, name, description, leaderId || req.user?.userId);
      res.status(201).json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  };

  getTeamById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const team = await this.teamSvc.getTeamById(id);
      res.status(200).json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  };

  getOrganizationTeams = async (req, res, next) => {
    try {
      const orgId = req.params.organizationId || req.organizationId;
      if (!orgId) {
        return res.status(400).json({ success: false, message: 'organizationId is required' });
      }

      const teams = await this.teamSvc.getOrganizationTeams(orgId);
      res.status(200).json({ success: true, data: teams });
    } catch (error) {
      next(error);
    }
  };

  updateTeam = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await this.teamSvc.updateTeam(id, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  addMember = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId is required' });
      }

      const updated = await this.teamSvc.addMemberToTeam(id, userId);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  removeMember = async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.params.userId || req.body.userId;

      if (!userId) {
        return res.status(400).json({ success: false, message: 'userId is required' });
      }

      const updated = await this.teamSvc.removeMemberFromTeam(id, userId);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  deleteTeam = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await this.teamSvc.deleteTeam(id);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  TeamController,
  teamController: new TeamController(),
};
