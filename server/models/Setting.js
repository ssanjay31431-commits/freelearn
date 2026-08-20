const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    websiteName: { type: String, default: 'VibeForge Digital Agency' },
    logoUrl: { type: String, default: '/logo.png' },
    phone: { type: String, default: '+91 98765 43210' },
    email: { type: String, default: 'contact@vibeforge.com' },
    whatsappNumber: { type: String, default: '+91 98765 43210' },
    upiQrUrl: { type: String, default: '' },
    smtpHost: { type: String, default: 'smtp.resend.com' },
    smtpPort: { type: Number, default: 587 },
    smtpUser: { type: String, default: '' },
    resendApiKey: { type: String, default: '' },
    cloudinaryCloudName: { type: String, default: '' },
    cloudinaryApiKey: { type: String, default: '' },
    socialLinks: {
      instagram: { type: String, default: 'https://instagram.com/vibeforge' },
      twitter: { type: String, default: 'https://twitter.com/vibeforge' },
      linkedin: { type: String, default: 'https://linkedin.com/company/vibeforge' },
      youtube: { type: String, default: 'https://youtube.com/vibeforge' }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
