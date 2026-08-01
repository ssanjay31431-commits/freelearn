const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    group: {
      type: String,
      required: true,
      enum: ['website', 'poster', 'video', 'app', 'ai'],
    },
    categoryName: { type: String, required: true },
    startingPrice: { type: Number, required: true },
    description: { type: String, required: true },
    features: [{ type: String }],
    portfolioImages: [{ type: String }],
    sampleVideoUrl: { type: String, default: '' },
    deliveryDays: { type: Number, default: 3 },
    rating: { type: Number, default: 4.9 },
    reviewCount: { type: Number, default: 28 },
    isPopular: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
