const { Router } = require('express');
const projectController = require('./project.controller');
const authenticate = require('../../middleware/authenticate');
const requireOrgMembership = require('../../middleware/requireOrgMembership');

const router = Router();

router.use(authenticate);

// Create project (org owner/admin only)
router.post('/', requireOrgMembership(['owner', 'admin']), projectController.createProject);

// View projects of an organization (org members only)
router.get(
  '/organization/:organizationId',
  requireOrgMembership(['owner', 'admin', 'member']),
  projectController.getOrganizationProjects
);

// View projects for a specific team
router.get('/team/:teamId', projectController.getTeamProjects);

// Single project
router.get('/:id', projectController.getProjectById);
router.put('/:id', requireOrgMembership(['owner', 'admin']), projectController.updateProject);

// Members and lead management
router.post('/:id/members', requireOrgMembership(['owner', 'admin']), projectController.allocateMembers);
router.put('/:id/lead', requireOrgMembership(['owner', 'admin']), projectController.assignProjectLead);
router.delete('/:id/members/:userId', requireOrgMembership(['owner', 'admin']), projectController.removeMember);

// Delete project
router.delete('/:id', requireOrgMembership(['owner', 'admin']), projectController.deleteProject);

module.exports = {
  projectRoutes: router,
};
