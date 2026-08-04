const axios = require('axios');

(async () => {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'admin@vibeforge.com',
      password: 'adminpassword123'
    });
    const token = loginRes.data.accessToken;
    console.log('Logged in, token:', !!token);

    const orderId = process.argv[2] || 'VF-736419';
    const response = await axios.delete(`http://localhost:5000/api/admin/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Delete response:', response.status, response.data);
  } catch (err) {
    if (err.response) console.error('Error response:', err.response.status, err.response.data);
    else console.error('Error:', err.message);
    process.exit(1);
  }
})();
