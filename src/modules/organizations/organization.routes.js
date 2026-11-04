const { Router } = require('express');
const organizationController = require('./organization.controller');
const authenticate = require('../../middleware/authenticate');
const authorizeRole = require('../../middleware/authorizeRole');

const router = Router();

router.use(authenticate);

// Create organization (authenticated user becomes owner)
router.post('/', organizationController.createOrganization);

// Superadmin only: view all organizations
router.get('/', authorizeRole('superadmin'), organizationController.getAllOrganizations);

// Regular user: view own organizations
router.get('/my', organizationController.getMyOrganizations);

// Specific organization
router.get('/:id', organizationController.getOrganizationById);
router.put('/:id', organizationController.updateOrganization);
router.delete('/:id', organizationController.deleteOrganization);

module.exports = {
  organizationRoutes: router,
};
