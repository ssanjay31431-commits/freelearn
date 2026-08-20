const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.Mixed, ref: 'User' },
    userName: { type: String, default: 'System' },
    userRole: { type: String, default: 'admin' },
    action: { type: String, required: true }, // e.g. LOGIN, LOGOUT, UPDATE_ORDER, DELETE_SERVICE, OFFER_CREATE
    resource: { type: String, required: true }, // e.g. Order, User, Service, Offer
    resourceId: { type: String, default: '' },
    details: { type: String, required: true },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
