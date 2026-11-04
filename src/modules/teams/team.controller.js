const teamService = require('./team.service');

const createTeam = async (req, res, next) => {
  try {
    const { name, description, organizationId, leaderId } = req.body;
    const orgId = organizationId || req.organizationId;

    if (!name || !orgId) {
      return res.status(400).json({ success: false, message: 'Team name and organizationId are required' });
    }

    const team = await teamService.createTeam(orgId, name, description, leaderId || req.user?.userId);
    res.status(201).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

const getTeamById = async (req, res, next) => {
  try {
    const team = await teamService.getTeamById(req.params.id);
    res.status(200).json({ success: true, data: team });
  } catch (error) {
    next(error);
  }
};

const getOrganizationTeams = async (req, res, next) => {
  try {
    const orgId = req.params.organizationId || req.organizationId;
    if (!orgId) {
      return res.status(400).json({ success: false, message: 'organizationId is required' });
    }

    const teams = await teamService.getOrganizationTeams(orgId);
    res.status(200).json({ success: true, data: teams });
  } catch (error) {
    next(error);
  }
};

const updateTeam = async (req, res, next) => {
  try {
    const updated = await teamService.updateTeam(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const updated = await teamService.addMemberToTeam(req.params.id, userId);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const updated = await teamService.removeMemberFromTeam(req.params.id, userId);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteTeam = async (req, res, next) => {
  try {
    const result = await teamService.deleteTeam(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTeam,
  getTeamById,
  getOrganizationTeams,
  updateTeam,
  addMember,
  removeMember,
  deleteTeam,
};
