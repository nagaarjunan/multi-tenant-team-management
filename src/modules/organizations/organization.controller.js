const organizationService = require('./organization.service');

const createOrganization = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const org = await organizationService.createOrganization(userId, req.body);
    res.status(201).json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};

const getAllOrganizations = async (req, res, next) => {
  try {
    const orgs = await organizationService.getAllOrganizations();
    res.status(200).json({ success: true, data: orgs });
  } catch (error) {
    next(error);
  }
};

const getMyOrganizations = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const orgs = await organizationService.getUserOrganizations(userId);
    res.status(200).json({ success: true, data: orgs });
  } catch (error) {
    next(error);
  }
};

const getOrganizationById = async (req, res, next) => {
  try {
    const org = await organizationService.getOrganizationById(req.params.id);
    res.status(200).json({ success: true, data: org });
  } catch (error) {
    next(error);
  }
};

const updateOrganization = async (req, res, next) => {
  try {
    const updated = await organizationService.updateOrganization(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const deleteOrganization = async (req, res, next) => {
  try {
    const result = await organizationService.deleteOrganization(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrganization,
  getAllOrganizations,
  getMyOrganizations,
  getOrganizationById,
  updateOrganization,
  deleteOrganization,
};
