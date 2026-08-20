const express = require('express');
const router = express.Router();
const {
  adminLogin,
  getAdminProfile,
  refreshAdminToken,
  getAdminStats,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  assignEmployeeToOrder,
  addInternalNote,
  uploadDeliveryFiles,
  deleteOrder,
  getCustomers,
  getCustomerById,
  toggleCustomerStatus,
  deleteCustomer,
  getOffers,
  createOffer,
  deleteOffer,
  getEmployees,
  createEmployee,
  getAuditLogsList,
  getSettings,
  updateSettings,
  sendBroadcastNotification,
  forgotAdminPassword,
  verifyAdminOtp,
  resetAdminPassword,
  requestClearDataOtp,
  confirmClearAllData,
  sendAdminConfirmationEmail
} = require('../controllers/adminController');
const { protectAdmin, authorizeRoles } = require('../middleware/adminAuthMiddleware');

// Public Admin Auth Routes
router.post('/login', adminLogin);
router.post('/refresh', refreshAdminToken);
router.post('/forgot-password', forgotAdminPassword);
router.post('/verify-otp', verifyAdminOtp);
router.post('/reset-password', resetAdminPassword);
router.post('/orders/:id/send-confirmation-email', sendAdminConfirmationEmail);

// Protected Admin Routes
router.use(protectAdmin);

router.get('/me', getAdminProfile);
router.get('/dashboard', getAdminStats);
router.get('/stats', getAdminStats); // Legacy support

// Orders
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.post('/orders/:id/send-confirmation-email', sendAdminConfirmationEmail);
router.put('/orders/:id/status', updateOrderStatus);
router.put('/order/:id', updateOrderStatus); // Legacy support
router.put('/orders/:id/assign', assignEmployeeToOrder);
router.post('/orders/:id/notes', addInternalNote);
router.post('/orders/:id/files', uploadDeliveryFiles);
router.delete('/orders/:id', authorizeRoles('super_admin', 'manager', 'admin'), deleteOrder);

// Customers
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);
router.put('/customers/:id/status', toggleCustomerStatus);
router.delete('/customers/:id', authorizeRoles('super_admin'), deleteCustomer);

// Offers
router.get('/offers', getOffers);
router.post('/offers', authorizeRoles('super_admin', 'manager'), createOffer);
router.delete('/offers/:id', authorizeRoles('super_admin', 'manager'), deleteOffer);

// Employees
router.get('/employees', authorizeRoles('super_admin', 'manager'), getEmployees);
router.post('/employees', authorizeRoles('super_admin'), createEmployee);

// Audit Logs & Settings & Notifications & Purge Data
router.get('/audit-logs', authorizeRoles('super_admin', 'manager'), getAuditLogsList);
router.get('/settings', getSettings);
router.put('/settings', authorizeRoles('super_admin'), updateSettings);
router.post('/notifications', sendBroadcastNotification);
router.post('/request-clear-otp', requestClearDataOtp);
router.post('/clear-all-data', authorizeRoles('super_admin', 'admin'), confirmClearAllData);

module.exports = router;
