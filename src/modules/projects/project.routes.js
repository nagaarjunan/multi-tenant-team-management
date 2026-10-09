const { Router } = require('express');
const { projectController } = require('./project.controller');
const authenticate = require('../../middleware/authenticate');
const requireOrgMembership = require('../../middleware/requireOrgMembership');

const router = Router();

router.use(authenticate);

// Create a project in an organization (owners/admins only)
router.post('/', requireOrgMembership(['owner', 'admin']), projectController.createProject);

// View projects of an organization (only organization members)
router.get(
  '/organization/:organizationId',
  requireOrgMembership(['owner', 'admin', 'member']),
  projectController.getOrganizationProjects
);

// View projects for a specific team
router.get('/team/:teamId', projectController.getTeamProjects);

// View single project details
router.get('/:id', projectController.getProjectById);

// Update project information
router.put('/:id', requireOrgMembership(['owner', 'admin']), projectController.updateProject);

// Allocate/Add team members to project
router.post('/:id/members', requireOrgMembership(['owner', 'admin']), projectController.allocateMembers);

// Assign or reassign Project Lead / Product Manager
router.put('/:id/lead', requireOrgMembership(['owner', 'admin']), projectController.assignProjectLead);

// Remove a member from the project
router.delete('/:id/members/:userId', requireOrgMembership(['owner', 'admin']), projectController.removeMember);

// Delete project
router.delete('/:id', requireOrgMembership(['owner', 'admin']), projectController.deleteProject);

module.exports = {
  projectRoutes: router,
};
