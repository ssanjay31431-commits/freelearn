const path = require('path');
// Load server env explicitly
require('dotenv').config({ path: path.join(__dirname, '..', 'server', '.env') });

const { sendAdminNotification, sendOrderConfirmation } = require('../server/utils/sendEmail');

(async () => {
  try {
    console.log('\n=== Running email tests (admin + customer) ===');

    const testOrder = {
      orderId: 'VF-TEST-' + Date.now(),
      customerName: 'Test User',
      customerEmail: process.env.ADMIN_EMAIL || 'vibeforgemrs@gmail.com',
      customerPhone: '9999999999',
      items: [{ title: 'Test Service', quantity: 1, price: 100 }],
      totalAmount: 100,
      amountPaid: 100,
      amountDue: 0,
      createdAt: new Date(),
    };

    console.log('\n-> Sending admin notification...');
    const adminOk = await sendAdminNotification({
      subject: 'TEST: New Order Received',
      customerName: testOrder.customerName,
      customerEmail: testOrder.customerEmail,
      customerPhone: testOrder.customerPhone,
      message: 'This is a test order for verifying email setup.',
      details: testOrder,
    });
    console.log('Admin email send result:', adminOk);

    console.log('\n-> Sending customer confirmation email...');
    const customerOk = await sendOrderConfirmation(testOrder);
    console.log('Customer email send result:', customerOk);

    console.log('\n=== Email tests complete ===\n');
    process.exit(0);
  } catch (err) {
    console.error('Error running email tests:', err);
    process.exit(1);
  }
})();
