const express = require('express');
const router = express.Router();
const {
  createCashfreeOrder,
  verifyCashfreePayment,
  getPaymentStatusHandler,
  cashfreeWebhookHandler,
} = require('../controllers/paymentController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.post('/create-order', optionalProtect, createCashfreeOrder);
router.post('/verify', verifyCashfreePayment);
router.get('/status/:orderId', getPaymentStatusHandler);
router.post('/webhook', cashfreeWebhookHandler);
router.post('/cashfree/webhook', cashfreeWebhookHandler);

module.exports = router;
