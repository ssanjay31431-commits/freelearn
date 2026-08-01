const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    address: { type: String, default: '' },
    items: [
      {
        serviceId: { type: String },
        title: { type: String, required: true },
        categoryName: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
        requirements: { type: String, default: '' },
        priority: { type: String, enum: ['standard', 'fast', 'express'], default: 'standard' },
        referenceFile: { type: String, default: '' },
      },
    ],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    gst: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    paymentType: {
      type: String,
      enum: ['full', 'advance_50', 'pay_later'],
      default: 'full',
    },
    amountPaid: { type: Number, required: true },
    amountDue: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Razorpay' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partially_paid', 'paid', 'failed'],
      default: 'pending',
    },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    statusTimeline: {
      type: String,
      enum: [
        'Order Received',
        'Planning',
        'Designing',
        'Development',
        'Review',
        'Completed',
        'Delivered',
      ],
      default: 'Order Received',
    },
    notes: { type: String, default: '' },
    assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    expectedDeliveryDate: { type: Date },
    deliveryFiles: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    internalNotes: [
      {
        note: { type: String, required: true },
        authorName: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    pointsEarned: { type: Number, default: 0 },
    pointsRedeemed: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
