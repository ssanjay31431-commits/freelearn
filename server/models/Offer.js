const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    couponCode: { type: String, required: true, uppercase: true, unique: true },
    discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },
    bannerUrl: { type: String, default: '' },
    targetCustomers: {
      type: String,
      enum: ['everyone', 'selected', 'returning', 'premium'],
      default: 'everyone'
    },
    selectedCustomerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    usageCount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Offer', offerSchema);
