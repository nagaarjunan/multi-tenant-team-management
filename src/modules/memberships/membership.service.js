const mongoose = require('mongoose');
const { membershipRepository } = require('./membership.repository');

class MembershipService {
  constructor(memberRepo = membershipRepository) {
    this.memberRepo = memberRepo;
  }

  async addMember(userId, organizationId, role = 'member') {
    const existing = await this.memberRepo.findByUserAndOrg(userId, organizationId);
    if (existing) {
      const error = new Error('User is already a member of this organization');
      error.statusCode = 409;
      throw error;
    }

    return this.memberRepo.create({
      userId: new mongoose.Types.ObjectId(userId),
      organizationId: new mongoose.Types.ObjectId(organizationId),
      role,
    });
  }

  async getOrganizationMembers(organizationId) {
    return this.memberRepo.findByOrganization(organizationId);
  }

  async getUserMemberships(userId) {
    return this.memberRepo.findByUser(userId);
  }

  async updateMemberRole(id, role) {
    const updated = await this.memberRepo.updateRole(id, role);
    if (!updated) {
      const error = new Error('Membership not found');
      error.statusCode = 404;
      throw error;
    }
    return updated;
  }

  async removeMember(id) {
    const deleted = await this.memberRepo.delete(id);
    if (!deleted) {
      const error = new Error('Membership not found');
      error.statusCode = 404;
      throw error;
    }
    return { message: 'Member removed successfully' };
  }
}

module.exports = {
  MembershipService,
  membershipService: new MembershipService(),
};
