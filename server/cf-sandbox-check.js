require('dotenv').config({ path: './.env' });
const util = require('util');
const { createCashfreeOrder } = require('./utils/cashfreeHelper');

(async () => {
  try {
    const resp = await createCashfreeOrder({
      orderId: 'TEST-CF-' + Math.floor(100000 + Math.random() * 900000),
      totalAmount: 1.00,
      customerName: 'Demo User',
      customerEmail: 'demo@example.com',
      customerPhone: '9943380320',
      notifyUrl: 'http://localhost:5000/api/payment/webhook',
      returnUrl: 'http://localhost:5173/track?id=TEST&paymentReturn=true&newOrder=true',
      paymentMethods: 'upi,card,netbanking'
    });
    console.log('CF_RESPONSE_OK');
    console.log(util.inspect(resp, { depth: null, colors: false }));
  } catch (err) {
    console.error('CF_RESPONSE_ERROR');
    console.error('name:', err.name);
    console.error('message:', err.message);
    console.error('statusCode:', err.statusCode || 'N/A');
    console.error('retryAfter:', err.retryAfter || 'N/A');
    console.error('details:', util.inspect(err, { depth: 4, colors: false }));
    process.exit(1);
  }
})();
