require('dotenv').config({ path: './.env' });
const axios = require('axios');
(async () => {
  try {
    const payload = {
      order_id: 'ORDER12345',
      order_amount: 1,
      order_currency: 'INR',
      customer_details: {
        customer_id: 'CUST001',
        customer_name: 'John',
        customer_email: 'john@gmail.com',
        customer_phone: '9876543210',
      },
    };
    const response = await axios.post('https://sandbox.cashfree.com/pg/orders', payload, {
      headers: {
        'x-client-id': process.env.CASHFREE_APP_ID,
        'x-client-secret': process.env.CASHFREE_SECRET_KEY,
        'x-api-version': process.env.CASHFREE_API_VERSION || '2022-09-01',
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
      timeout: 30000,
    });
    console.log('STATUS', response.status);
    console.log('HEADERS', JSON.stringify(response.headers, null, 2));
    console.log('DATA', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('ERROR', error.message);
    if (error.response) {
      console.error('STATUS', error.response.status);
      console.error('DATA', JSON.stringify(error.response.data, null, 2));
    }
    console.error(error.stack);
  }
})();
