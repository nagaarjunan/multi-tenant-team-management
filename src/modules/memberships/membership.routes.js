const { Router } = require('express');
const { membershipController } = require('./membership.controller');
const authenticate = require('../../middleware/authenticate');
const requireOrgMembership = require('../../middleware/requireOrgMembership');

const router = Router();

router.use(authenticate);

// View personal memberships across organizations
router.get('/my', membershipController.getMyMemberships);

// Invite/Add a member into an organization (only organization owners or admins)
router.post('/', requireOrgMembership(['owner', 'admin']), membershipController.addMember);

// View members of an organization (only actual members of that organization can see)
router.get(
  '/organization/:organizationId',
  requireOrgMembership(['owner', 'admin', 'member']),
  membershipController.getOrganizationMembers
);

// Update member role or remove member
router.put('/:id', membershipController.updateMemberRole);
router.delete('/:id', membershipController.removeMember);

module.exports = {
  membershipRoutes: router,
};
