const AuditLog = require('../models/AuditLog');

const logAudit = async ({ req, userId, userName, userRole, action, resource, resourceId, details }) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '') : 'System';
    const userAgent = req ? (req.headers['user-agent'] || '') : 'System';

    await AuditLog.create({
      userId: userId || (req && req.user ? req.user.id : null),
      userName: userName || (req && req.user ? req.user.name : 'Admin'),
      userRole: userRole || (req && req.user ? req.user.role : 'admin'),
      action,
      resource,
      resourceId: resourceId || '',
      details,
      ipAddress,
      userAgent
    });
  } catch (error) {
    console.error('Failed to save audit log:', error.message);
  }
};

module.exports = { logAudit };
