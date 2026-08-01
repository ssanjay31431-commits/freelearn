const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discountPercentage: { type: Number, required: true },
    maxDiscount: { type: Number, default: 500 },
    minOrderAmount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
