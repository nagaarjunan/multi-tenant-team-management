const { Router } = require('express');
const { organizationController } = require('./organization.controller');
const authenticate = require('../../middleware/authenticate');
const authorizeRole = require('../../middleware/authorizeRole');

const router = Router();

router.use(authenticate);

// Regular authenticated users can create an organization (creator becomes owner)
router.post('/', organizationController.createOrganization);

// Only platform superadmin can view all organizations in the platform (metadata only)
router.get('/', authorizeRole('superadmin'), organizationController.getAllOrganizations);

// Regular users fetch organizations they own
router.get('/my', organizationController.getMyOrganizations);

// Fetch specific organization
router.get('/:id', organizationController.getOrganizationById);

// Update / delete organization
router.put('/:id', organizationController.updateOrganization);
router.delete('/:id', organizationController.deleteOrganization);

module.exports = {
  organizationRoutes: router,
};
