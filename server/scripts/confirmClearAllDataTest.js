const axios = require('axios');

(async () => {
  try {
    const auth = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'admin@vibeforge.com',
      password: 'adminpassword123'
    });
    const token = auth.data.accessToken;
    console.log('token', !!token);

    const otpRequest = await axios.post('http://localhost:5000/api/admin/request-clear-otp', { password: 'Kavi@2005' }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('OTP request:', otpRequest.status, otpRequest.data);

    // Ask user to paste the OTP value from email / logs, or read from a file if available.
    const otp = otpRequest.data?.otp || '000000';
    console.log('NOTE: this test cannot auto-confirm without the actual OTP. Use the OTP from email or server logs.');
  } catch (err) {
    if (err.response) console.error('Error response:', err.response.status, err.response.data);
    else console.error('Error:', err.message);
    process.exit(1);
  }
})();
