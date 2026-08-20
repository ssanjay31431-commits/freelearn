const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true },
    role: { type: String, default: 'client' },
    status: { type: String, enum: ['success', 'failed', 'locked'], required: true },
    ipAddress: { type: String, default: '' },
    browser: { type: String, default: '' },
    os: { type: String, default: '' },
    device: { type: String, default: '' },
    location: { type: String, default: 'Unknown' },
    failReason: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
