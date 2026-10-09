const { membershipService } = require('./membership.service');

class MembershipController {
  constructor(memberSvc = membershipService) {
    this.memberSvc = memberSvc;
  }

  addMember = async (req, res, next) => {
    try {
      const { userId, organizationId, role } = req.body;
      const orgId = organizationId || req.organizationId;

      if (!userId || !orgId) {
        return res.status(400).json({ success: false, message: 'userId and organizationId are required' });
      }

      const membership = await this.memberSvc.addMember(userId, orgId, role);
      res.status(201).json({ success: true, data: membership });
    } catch (error) {
      next(error);
    }
  };

  getOrganizationMembers = async (req, res, next) => {
    try {
      const orgId = req.params.organizationId || req.organizationId;
      if (!orgId) {
        return res.status(400).json({ success: false, message: 'organizationId is required' });
      }

      const members = await this.memberSvc.getOrganizationMembers(orgId);
      res.status(200).json({ success: true, data: members });
    } catch (error) {
      next(error);
    }
  };

  getMyMemberships = async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const memberships = await this.memberSvc.getUserMemberships(userId);
      res.status(200).json({ success: true, data: memberships });
    } catch (error) {
      next(error);
    }
  };

  updateMemberRole = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ success: false, message: 'Role is required' });
      }

      const updated = await this.memberSvc.updateMemberRole(id, role);
      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      next(error);
    }
  };

  removeMember = async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await this.memberSvc.removeMember(id);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  MembershipController,
  membershipController: new MembershipController(),
};
