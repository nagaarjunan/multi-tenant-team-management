const mongoose = require('mongoose');
const { organizationRepository } = require('./organization.repository');
const { membershipRepository } = require('../memberships/membership.repository');

class OrganizationService {
  constructor(
    orgRepo = organizationRepository,
    membershipRepo = membershipRepository
  ) {
    this.orgRepo = orgRepo;
    this.membershipRepo = membershipRepo;
  }

  async createOrganization(userId, data) {
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await this.orgRepo.findBySlug(slug);
    if (existing) {
      const error = new Error('Organization slug already exists');
      error.statusCode = 409;
      throw error;
    }

    // 1. Create Organization with ownerId
    const org = await this.orgRepo.create({
      name: data.name,
      slug,
      description: data.description,
      ownerId: new mongoose.Types.ObjectId(userId),
    });

    // 2. Automatically grant the creator the 'owner' membership role in this organization
    await this.membershipRepo.create({
      userId: new mongoose.Types.ObjectId(userId),
      organizationId: org._id,
      role: 'owner',
    });

    return org;
  }

  async getOrganizationById(id) {
    const org = await this.orgRepo.findById(id);
    if (!org) {
      const error = new Error('Organization not found');
      error.statusCode = 404;
      throw error;
    }
    return org;
  }

  async getAllOrganizations() {
    return this.orgRepo.findAll();
  }

  async getUserOrganizations(userId) {
    return this.orgRepo.findByOwnerId(userId);
  }

  async updateOrganization(id, updateData) {
    const updated = await this.orgRepo.update(id, updateData);
    if (!updated) {
      const error = new Error('Organization not found');
      error.statusCode = 404;
      throw error;
    }
    return updated;
  }

  async deleteOrganization(id) {
    const deleted = await this.orgRepo.delete(id);
    if (!deleted) {
      const error = new Error('Organization not found');
      error.statusCode = 404;
      throw error;
    }
    return { message: 'Organization deleted successfully' };
  }
}

module.exports = {
  OrganizationService,
  organizationService: new OrganizationService(),
};
