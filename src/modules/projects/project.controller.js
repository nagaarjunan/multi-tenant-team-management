const projectService = require('./project.service');

const createProject = async (req, res, next) => {
  try {
    const organizationId = req.body.organizationId || req.organizationId;
    if (!organizationId) {
      return res.status(400).json({ success: false, message: 'organizationId is required' });
    }

    const project = await projectService.createProject(organizationId, req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

const getOrganizationProjects = async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId || req.organizationId;
    if (!organizationId) {
      return res.status(400).json({ success: false, message: 'organizationId is required' });
    }

    const projects = await projectService.getOrganizationProjects(organizationId);
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

const getTeamProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getTeamProjects(req.params.teamId);
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const updated = await projectService.updateProject(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const allocateMembers = async (req, res, next) => {
  try {
    const { memberIds } = req.body;
    const updated = await projectService.allocateMembers(req.params.id, memberIds);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const assignProjectLead = async (req, res, next) => {
  try {
    const { leadId } = req.body;
    const updated = await projectService.assignProjectLead(req.params.id, leadId);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const userId = req.params.userId || req.body.userId;
    const updated = await projectService.removeMember(req.params.id, userId);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
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
