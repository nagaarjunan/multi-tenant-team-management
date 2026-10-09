const { MembershipModel } = require('../modules/memberships/membership.model');

/**
 * Middleware ensuring the authenticated user is an actual member of the organization.
 * Crucial for privacy: Even a platform 'superadmin' CANNOT see inside an organization
 * unless they are an explicit member of that organization.
 *
 * @param {string[]} allowedOrgRoles - Optional allowed roles within the organization (e.g. ['owner', 'admin'])
 */
const requireOrgMembership = (allowedOrgRoles = []) => {
  return async (req, res, next) => {
    try {
      const organizationId =
        req.params.organizationId ||
        req.body.organizationId ||
        req.headers['x-organization-id'] ||
        req.query.organizationId;

      if (!organizationId) {
        return res.status(400).json({
          success: false,
          message: 'Organization ID is required to verify membership.',
        });
      }

      // Check if user is an explicit member of this organization
      const membership = await MembershipModel.findOne({
        userId: req.user.userId,
        organizationId,
      }).exec();

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You are not a member of this organization. Organization data is private.',
        });
      }

      // If specific organization roles are required (e.g. ['owner', 'admin'])
      if (allowedOrgRoles.length > 0 && !allowedOrgRoles.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: This action requires [${allowedOrgRoles.join(', ')}] role in this organization.`,
        });
      }

      req.membership = membership;
      req.organizationId = organizationId;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = requireOrgMembership;
