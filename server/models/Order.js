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
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    gst: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentType: {
      type: String,
      default: 'full',
    },
    amountPaid: { type: Number, required: true },
    amountDue: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Cashfree' },
    paymentStatus: {
      type: String,
      default: 'PENDING',
    },
    cashfreeOrderId: { type: String, default: '' },
    cfOrderId: { type: String, default: '' },
    cashfreeOrderInternalId: { type: String, default: '' },
    cashfreePaymentSessionId: { type: String, default: '' },
    cashfreeResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
    cfPaymentId: { type: String, default: '' },
    paymentId: { type: String, default: '' },
    transactionId: { type: String, default: '' },
    transactionStatus: { type: String, default: '' },
    paymentTimestamp: { type: Date },
    paymentDate: { type: Date },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    orderStatus: {
      type: String,
      enum: ['PAYMENT_PENDING', 'CONFIRMED', 'PAYMENT_FAILED', 'Pending', 'Confirmed', 'Rejected', 'Order Received', 'Planning', 'Designing', 'Development', 'Review', 'Completed', 'Delivered'],
      default: 'PAYMENT_PENDING',
    },
    emailStatus: {
      type: String,
      enum: ['NOT_SENT', 'SENDING', 'SENT', 'FAILED', 'Not Sent', 'Sent'],
      default: 'NOT_SENT',
    },
    adminStatus: {
      type: String,
      default: 'WAITING_FOR_PAYMENT',
    },
    invoiceGenerated: { type: Boolean, default: false },
    confirmationEmailSent: { type: Boolean, default: false },
    invoicePath: { type: String, default: '' },
    invoiceUrl: { type: String, default: '' },
    emailSentAt: { type: Date },
    statusTimeline: {
      type: String,
      enum: [
        'PAYMENT_PENDING',
        'CONFIRMED',
        'PAYMENT_FAILED',
        'Pending',
        'Confirmed',
        'Rejected',
        'Order Received',
        'Planning',
        'Designing',
        'Development',
        'Review',
        'Completed',
        'Delivered',
      ],
      default: 'PAYMENT_PENDING',
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
