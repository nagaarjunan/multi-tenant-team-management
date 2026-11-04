const { OrganizationModel } = require('./organization.model');
const { MembershipModel } = require('../memberships/membership.model');
const AppError = require('../../utils/AppError');

const createOrganization = async (userId, data) => {
  const slug =
    data.slug ||
    data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const existing = await OrganizationModel.findOne({ slug });
  if (existing) {
    throw AppError.conflict('Organization slug already exists');
  }

  // 1. Create Organization
  const org = await OrganizationModel.create({
    name: data.name,
    slug,
    description: data.description,
    ownerId: userId,
  });

  // 2. Automatically grant creator owner membership
  await MembershipModel.create({
    userId,
    organizationId: org._id,
    role: 'owner',
  });

  return org;
};

const getOrganizationById = async (id) => {
  const org = await OrganizationModel.findById(id);
  if (!org) {
    throw AppError.notFound('Organization not found');
  }
  return org;
};

const getAllOrganizations = async () => {
  return OrganizationModel.find();
};

const getUserOrganizations = async (userId) => {
  return OrganizationModel.find({ ownerId: userId });
};

const updateOrganization = async (id, updateData) => {
  const updated = await OrganizationModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    throw AppError.notFound('Organization not found');
  }
  return updated;
};

const deleteOrganization = async (id) => {
  const deleted = await OrganizationModel.findByIdAndDelete(id);
  if (!deleted) {
    throw AppError.notFound('Organization not found');
  }
  // Clean up associated memberships
  await MembershipModel.deleteMany({ organizationId: id });
  return { message: 'Organization deleted successfully' };
};

module.exports = {
  createOrganization,
  getOrganizationById,
  getAllOrganizations,
  getUserOrganizations,
  updateOrganization,
  deleteOrganization,
};
