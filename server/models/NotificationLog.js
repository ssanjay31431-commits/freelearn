const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema(
  {
    channel: { type: String, enum: ['email', 'whatsapp', 'website'], required: true },
    targetAudience: { type: String, enum: ['everyone', 'selected', 'returning', 'premium'], default: 'everyone' },
    recipientsCount: { type: Number, default: 0 },
    subject: { type: String, default: '' },
    message: { type: String, required: true },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['sent', 'failed'], default: 'sent' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
