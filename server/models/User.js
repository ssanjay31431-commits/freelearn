const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const pointsHistorySchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['earned', 'redeemed'], required: true },
  description: { type: String, required: true },
  orderId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, default: '' },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['client', 'admin', 'super_admin', 'manager', 'developer', 'designer', 'video_editor', 'support'],
      default: 'client'
    },
    avatar: { type: String, default: '' },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    rewardPoints: { type: Number, default: 0 },
    pointsHistory: [pointsHistorySchema],
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: 'India' }
    },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    resetOtp: { type: String, default: null },
    resetOtpExpire: { type: Date, default: null },
    refreshTokens: [{ type: String }],
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

