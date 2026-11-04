const { MembershipModel } = require('../modules/memberships/membership.model');
const AppError = require('../utils/AppError');

/**
 * Middleware ensuring the authenticated user is an explicit member of the organization.
 * Enforces organization boundary privacy.
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
        return next(AppError.badRequest('Organization ID is required to verify membership.'));
      }

      // Check if user is an explicit member of this organization
      const membership = await MembershipModel.findOne({
        userId: req.user.userId,
        organizationId,
      });

      if (!membership) {
        return next(
          AppError.forbidden(
            'Access denied: You are not a member of this organization. Organization data is private.'
          )
        );
      }

      // If specific organization roles are required (e.g. ['owner', 'admin'])
      if (allowedOrgRoles.length > 0 && !allowedOrgRoles.includes(membership.role)) {
        return next(
          AppError.forbidden(
            `Forbidden: This action requires [${allowedOrgRoles.join(', ')}] role in this organization.`
          )
        );
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
