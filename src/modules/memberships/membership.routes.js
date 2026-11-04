const { Router } = require('express');
const membershipController = require('./membership.controller');
const authenticate = require('../../middleware/authenticate');
const requireOrgMembership = require('../../middleware/requireOrgMembership');

const router = Router();

router.use(authenticate);

// View personal memberships
router.get('/my', membershipController.getMyMemberships);

// Add a member into an organization (owner/admin only)
router.post('/', requireOrgMembership(['owner', 'admin']), membershipController.addMember);

// View members of an organization
router.get(
  '/organization/:organizationId',
  requireOrgMembership(['owner', 'admin', 'member']),
  membershipController.getOrganizationMembers
);

// Update role / remove member
router.put('/:id', membershipController.updateMemberRole);
router.delete('/:id', membershipController.removeMember);

module.exports = {
  membershipRoutes: router,
};
