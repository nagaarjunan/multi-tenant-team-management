const { organizationService } = require('./organization.service');

class OrganizationController {
  constructor(orgSvc = organizationService) {
    this.orgSvc = orgSvc;
  }

  createOrganization = async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const org = await this.orgSvc.createOrganization(userId, req.body);
      res.status(201).json({ success: true, data: org });
    } catch (error) {
      next(error);
    }
  };

  getAllOrganizations = async (req, res, next) => {
    try {
      const orgs = await this.orgSvc.getAllOrganizations();
      res.status(200).json({ success: true, data: orgs });
    } catch (error) {
      next(error);
    }
  };

  getMyOrganizations = async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      const orgs = await this.orgSvc.getUserOrganizations(userId);
      res.status(200).json({ success: true, data: orgs });
    } catch (error) {
      next(error);
    }
  };

  getOrganizationById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const org = await this.orgSvc.getOrganizationById(id);
      res.status(200).json({ success: true, data: org });
    } catch (error) {
      next(error);
    }
  };

  updateOrganization = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updated = await this.orgSvc.updateOrganization(id, req.body);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  deleteOrganization = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await this.orgSvc.deleteOrganization(id);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  OrganizationController,
  organizationController: new OrganizationController(),
};
