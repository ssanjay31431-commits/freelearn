const express = require('express');
const router = express.Router();
const {
  createCashfreeOrder,
  verifyCashfreePayment,
  cashfreeWebhookHandler,
} = require('../controllers/paymentController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.post('/create-order', optionalProtect, createCashfreeOrder);
router.post('/verify', verifyCashfreePayment);
router.post('/webhook', cashfreeWebhookHandler);

module.exports = router;
