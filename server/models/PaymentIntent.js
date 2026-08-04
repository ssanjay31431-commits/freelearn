const mongoose = require('mongoose');

const paymentIntentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
      default: 'PENDING',
    },
    cashfreeOrderId: { type: String, default: '' },
    cashfreeOrderInternalId: { type: String, default: '' },
    amountPaid: { type: Number, required: true },
    amountDue: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentType: { type: String, default: 'full' },
    paymentMethod: { type: String, default: 'Cashfree' },
    couponCode: { type: String, default: '' },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    address: { type: String, default: '' },
    items: { type: Array, default: [] },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    cashfreeResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
    transactionId: { type: String, default: '' },
    paymentTimestamp: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentIntent', paymentIntentSchema);
