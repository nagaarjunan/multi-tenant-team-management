const { MembershipModel } = require('./membership.model');
const AppError = require('../../utils/AppError');

const addMember = async (userId, organizationId, role = 'member') => {
  const existing = await MembershipModel.findOne({ userId, organizationId });
  if (existing) {
    throw AppError.conflict('User is already a member of this organization');
  }

  return MembershipModel.create({
    userId,
    organizationId,
    role,
  });
};

const getOrganizationMembers = async (organizationId) => {
  return MembershipModel.find({ organizationId }).populate('userId', 'name email role');
};

const getUserMemberships = async (userId) => {
  return MembershipModel.find({ userId }).populate('organizationId', 'name slug');
};

const updateMemberRole = async (id, role) => {
  const updated = await MembershipModel.findByIdAndUpdate(id, { role }, { new: true });
  if (!updated) {
    throw AppError.notFound('Membership not found');
  }
  return updated;
};

const removeMember = async (id) => {
  const deleted = await MembershipModel.findByIdAndDelete(id);
  if (!deleted) {
    throw AppError.notFound('Membership not found');
  }
  return { message: 'Member removed successfully' };
};

module.exports = {
  addMember,
  getOrganizationMembers,
  getUserMemberships,
  updateMemberRole,
  removeMember,
};
