const express = require('express');
const router = express.Router();
const {
  createOrder,
  trackOrder,
  notifyAdminOrder,
  getOrderById,
  getMyOrders,
  verifyRazorpayPayment,
  sendConfirmationEmailHandler,
} = require('../controllers/orderController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');

router.post('/', optionalProtect, createOrder);
router.get('/track', trackOrder);
router.post('/track', trackOrder);
router.post('/send-confirmation', sendConfirmationEmailHandler);
router.post('/:id/send-confirmation', sendConfirmationEmailHandler);
router.post('/:id/send-confirmation-email', sendConfirmationEmailHandler);
router.post('/notify-admin', notifyAdminOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/:id', getOrderById);
router.post('/verify-payment', verifyRazorpayPayment);

module.exports = router;
