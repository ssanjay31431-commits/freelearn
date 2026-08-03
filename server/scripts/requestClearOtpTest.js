const axios = require('axios');

(async () => {
  try {
    // Login as admin to obtain token
    const auth = await axios.post('http://localhost:5000/api/admin/login', { email: 'admin@vibeforge.com', password: 'adminpassword123' });
    const token = auth.data.accessToken;
    console.log('Logged in, got token:', !!token);

    const res = await axios.post('http://localhost:5000/api/admin/request-clear-otp', { password: 'Kavi@2005' }, { timeout: 15000, headers: { Authorization: `Bearer ${token}` } });
    console.log('Response:', res.status, res.data);
  } catch (err) {
    if (err.response) console.error('Error response:', err.response.status, err.response.data);
    else console.error('Error:', err.message);
    process.exit(1);
  }
})();
