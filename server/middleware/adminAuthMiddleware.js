const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protectAdmin = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vibeforge_secret_key_2026');

      let user = null;
      try {
        user = await User.findById(decoded.id).select('-password');
      } catch (e) {}

      if (!user) {
        const { mockUsersDB } = require('../controllers/adminController');
        user = (mockUsersDB || []).find(u => 
          u._id === decoded.id || 
          (u.email && decoded.email && u.email.toLowerCase() === decoded.email.toLowerCase())
        );
      }

      if (!user) {
        return res.status(401).json({ message: 'User account no longer exists' });
      }

      if (user.status === 'suspended') {
        return res.status(403).json({ message: 'Account is suspended. Contact Super Admin.' });
      }

      const adminRoles = ['admin', 'super_admin', 'manager', 'developer', 'designer', 'video_editor', 'support'];
      if (!adminRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Access denied: Admin privileges required.' });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || (!roles.includes(req.user.role) && req.user.role !== 'super_admin' && req.user.role !== 'admin')) {
      return res.status(403).json({
        message: `Role (${req.user ? req.user.role : 'none'}) is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protectAdmin, authorizeRoles };
