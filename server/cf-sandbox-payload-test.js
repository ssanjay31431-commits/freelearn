require('dotenv').config({ path: './.env' });
const axios = require('axios');

const tests = [
  {
    name: 'Minimal snake_case no order_meta',
    payload: {
      order_id: 'ORDER' + Date.now() + 'A',
      order_amount: 1,
      order_currency: 'INR',
      customer_details: {
        customer_id: 'CUST' + Date.now(),
        customer_name: 'John',
        customer_email: 'john+' + Date.now() + '@gmail.com',
        customer_phone: '9999999999',
      },
    },
  },
  {
    name: 'Snake_case with order_meta valid methods',
    payload: {
      order_id: 'ORDER' + Date.now() + 'B',
      order_amount: 1,
      order_currency: 'INR',
      customer_details: {
        customer_id: 'CUST' + Date.now(),
        customer_name: 'John',
        customer_email: 'john+' + Date.now() + '@gmail.com',
        customer_phone: '9999999999',
      },
      order_meta: {
        return_url: 'http://localhost:5173/track?id=abc',
        notify_url: 'http://localhost:5000/api/payment/webhook',
        payment_methods: 'upi,cc,nb',
      },
    },
  },
  {
    name: 'Snake_case with only order_meta URLs',
    payload: {
      order_id: 'ORDER' + Date.now() + 'C',
      order_amount: 1,
      order_currency: 'INR',
      customer_details: {
        customer_id: 'CUST' + Date.now(),
        customer_name: 'John',
        customer_email: 'john+' + Date.now() + '@gmail.com',
        customer_phone: '9999999999',
      },
      order_meta: {
        return_url: 'http://localhost:5173/track?id=abc',
        notify_url: 'http://localhost:5000/api/payment/webhook',
      },
    },
  },
  {
    name: 'Snake_case with payment_methods upi only',
    payload: {
      order_id: 'ORDER' + Date.now() + 'D',
      order_amount: 1,
      order_currency: 'INR',
      customer_details: {
        customer_id: 'CUST' + Date.now(),
        customer_name: 'John',
        customer_email: 'john+' + Date.now() + '@gmail.com',
        customer_phone: '9999999999',
      },
      order_meta: {
        return_url: 'http://localhost:5173/track?id=abc',
        notify_url: 'http://localhost:5000/api/payment/webhook',
        payment_methods: 'upi',
      },
    },
  },
];

(async () => {
  for (const test of tests) {
    try {
      const response = await axios.post('https://sandbox.cashfree.com/pg/orders', test.payload, {
        headers: {
          'x-client-id': process.env.CASHFREE_APP_ID,
          'x-client-secret': process.env.CASHFREE_SECRET_KEY,
          'x-api-version': process.env.CASHFREE_API_VERSION || '2022-09-01',
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
        timeout: 30000,
      });
      console.log('---', test.name, 'status', response.status);
      console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('ERROR', test.name, error.message);
      if (error.response) {
        console.error(error.response.status, JSON.stringify(error.response.data, null, 2));
      }
    }
  }
})();
