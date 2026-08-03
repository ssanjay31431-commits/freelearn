const axios = require('axios');

(async () => {
  console.log('Starting testUpdateStatus script...');
  try {
    process.on('unhandledRejection', (reason) => { console.error('UnhandledRejection:', reason); process.exit(1); });
    process.on('uncaughtException', (err) => { console.error('UncaughtException:', err); process.exit(1); });
    const api = axios.create({ baseURL: 'http://localhost:5000/api', timeout: 10000 });

    // Login as fallback admin
    const loginRes = await api.post('/admin/login', { email: 'admin@vibeforge.com', password: 'adminpassword123' });
    const token = loginRes.data.accessToken;
    console.log('Admin token acquired:', !!token);

    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    const orderId = 'VF-736419';
    const res = await api.put(`/admin/orders/${orderId}/status`, { statusTimeline: 'Planning' });
    console.log('Update status response:', res.status);
    console.log('Updated order:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) console.error('Error response:', err.response.status, err.response.data);
    else console.error('Error:', err.message);
    process.exit(1);
  }
})();
