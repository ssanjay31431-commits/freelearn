const mongoose = require('mongoose');

const customQuoteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    serviceType: { type: String, required: true },
    budget: { type: String, required: true },
    expectedDelivery: { type: String, required: true },
    projectDetails: { type: String, required: true },
    referenceFileUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'Reviewed', 'Quoted', 'Rejected'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CustomQuote', customQuoteSchema);
