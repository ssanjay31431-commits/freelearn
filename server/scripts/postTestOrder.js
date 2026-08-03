const axios = require('axios');

(async () => {
  try {
    const payload = {
      customerName: 'Integration Test User',
      customerEmail: 'integration-test@example.com',
      customerPhone: '9999999999',
      items: [{ title: 'Integration Test Service', quantity: 1, price: 500 }],
      paymentType: 'full'
    };

    const res = await axios.post('http://localhost:5000/api/orders', payload, { timeout: 10000 });
    console.log('Create Order Response Status:', res.status);
    console.log('Create Order Response Data:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Error Response:', err.response.status, err.response.data);
    } else {
      console.error('Request Error:', err.message);
    }
    process.exit(1);
  }
})();
