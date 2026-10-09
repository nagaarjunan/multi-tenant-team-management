const { projectService } = require('./project.service');

class ProjectController {
  constructor(projectSvc = projectService) {
    this.projectSvc = projectSvc;
  }

  createProject = async (req, res, next) => {
    try {
      const organizationId = req.body.organizationId || req.organizationId;
      if (!organizationId) {
        return res.status(400).json({ success: false, message: 'organizationId is required' });
      }

      const project = await this.projectSvc.createProject(organizationId, req.body);
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  };

  getProjectById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const project = await this.projectSvc.getProjectById(id);
      res.status(200).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  };

  getOrganizationProjects = async (req, res, next) => {
    try {
      const organizationId = req.params.organizationId || req.organizationId;
      if (!organizationId) {
        return res.status(400).json({ success: false, message: 'organizationId is required' });
      }

      const projects = await this.projectSvc.getOrganizationProjects(organizationId);
      res.status(200).json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  };

  getTeamProjects = async (req, res, next) => {
    try {
      const { teamId } = req.params;
      const projects = await this.projectSvc.getTeamProjects(teamId);
      res.status(200).json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  };

  updateProject = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await this.projectSvc.updateProject(id, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  allocateMembers = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { memberIds } = req.body;
      const updated = await this.projectSvc.allocateMembers(id, memberIds);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  assignProjectLead = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { leadId } = req.body;
      const updated = await this.projectSvc.assignProjectLead(id, leadId);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  removeMember = async (req, res, next) => {
    try {
      const { id, userId } = req.params;
      const targetUserId = userId || req.body.userId;
      const updated = await this.projectSvc.removeMember(id, targetUserId);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  deleteProject = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await this.projectSvc.deleteProject(id);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  ProjectController,
  projectController: new ProjectController(),
};
