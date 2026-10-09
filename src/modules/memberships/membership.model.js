const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member'],
      default: 'member',
    },
  },
  {
    timestamps: true,
  }
);

membershipSchema.index({ userId: 1, organizationId: 1 }, { unique: true });

const MembershipModel = mongoose.model('Membership', membershipSchema);

module.exports = {
  MembershipModel,
};
