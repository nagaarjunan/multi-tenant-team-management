const membershipService = require('./membership.service');

const addMember = async (req, res, next) => {
  try {
    const { userId, organizationId, role } = req.body;
    const orgId = organizationId || req.organizationId;

    if (!userId || !orgId) {
      return res.status(400).json({ success: false, message: 'userId and organizationId are required' });
    }

    const membership = await membershipService.addMember(userId, orgId, role);
    res.status(201).json({ success: true, data: membership });
  } catch (error) {
    next(error);
  }
};

const getOrganizationMembers = async (req, res, next) => {
  try {
    const orgId = req.params.organizationId || req.organizationId;
    if (!orgId) {
      return res.status(400).json({ success: false, message: 'organizationId is required' });
    }

    const members = await membershipService.getOrganizationMembers(orgId);
    res.status(200).json({ success: true, data: members });
  } catch (error) {
    next(error);
  }
};

const getMyMemberships = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const memberships = await membershipService.getUserMemberships(userId);
    res.status(200).json({ success: true, data: memberships });
  } catch (error) {
    next(error);
  }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: 'Role is required' });
    }

    const updated = await membershipService.updateMemberRole(id, role);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await membershipService.removeMember(id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addMember,
  getOrganizationMembers,
  getMyMemberships,
  updateMemberRole,
  removeMember,
};
