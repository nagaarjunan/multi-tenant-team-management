const { OrganizationModel } = require('./organization.model');

class OrganizationRepository {
  async findById(id) {
    return OrganizationModel.findById(id).exec();
  }

  async findBySlug(slug) {
    return OrganizationModel.findOne({ slug }).exec();
  }

  async findByOwnerId(ownerId) {
    return OrganizationModel.find({ ownerId }).exec();
  }

  async create(data) {
    const org = new OrganizationModel(data);
    return org.save();
  }

  async update(id, updateData) {
    return OrganizationModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  async delete(id) {
    return OrganizationModel.findByIdAndDelete(id).exec();
  }

  async findAll() {
    return OrganizationModel.find().exec();
  }
}

module.exports = {
  OrganizationRepository,
  organizationRepository: new OrganizationRepository(),
};
