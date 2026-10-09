const { Router } = require('express');
const { teamController } = require('./team.controller');
const authenticate = require('../../middleware/authenticate');
const requireOrgMembership = require('../../middleware/requireOrgMembership');

const router = Router();

router.use(authenticate);

// Create team inside an organization (only owners or admins of that organization)
router.post('/', requireOrgMembership(['owner', 'admin']), teamController.createTeam);

// View all teams of an organization (only actual members of that organization can view)
router.get('/organization/:organizationId', requireOrgMembership(['owner', 'admin', 'member']), teamController.getOrganizationTeams);

// Team specific actions
router.get('/:id', teamController.getTeamById);
router.put('/:id', teamController.updateTeam);
router.post('/:id/members', teamController.addMember);
router.delete('/:id/members/:userId', teamController.removeMember);
router.delete('/:id', teamController.deleteTeam);

module.exports = {
  teamRoutes: router,
};
