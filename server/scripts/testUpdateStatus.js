const axios = require('axios');

 (async () => {
  console.log('Starting testUpdateStatus script...');
  try {
    process.on('unhandledRejection', (reason) => { console.error('UnhandledRejection:', reason); process.exit(1); });
    process.on('uncaughtException', (err) => { console.error('UncaughtException:', err); process.exit(1); });
    const api = axios.create({ baseURL: 'http://localhost:5000/api', timeout: 10000 });

    console.log('Attempting admin login...');
    let loginRes;
    try {
      loginRes = await api.post('/admin/login', { email: 'admin@vibeforge.com', password: 'adminpassword123' });
      console.log('Login response status:', loginRes.status);
    } catch (le) {
      console.error('Login failed:', le.response ? { status: le.response.status, data: le.response.data } : le.message);
      process.exit(1);
    }

    const token = loginRes.data?.accessToken;
    console.log('Admin token acquired:', !!token);

    api.defaults.headers.common.Authorization = `Bearer ${token}`;

    const orderId = 'VF-736419';
    console.log('Attempting to update order status for', orderId);
    let res;
    try {
      res = await api.put(`/admin/orders/${orderId}/status`, { statusTimeline: 'Planning' });
      console.log('Update status response:', res.status);
      console.log('Updated order:', JSON.stringify(res.data, null, 2));
    } catch (ue) {
      console.error('Update failed:', ue.response ? { status: ue.response.status, data: ue.response.data } : ue.message);
      process.exit(1);
    }
  } catch (err) {
    console.error('Outer error:', err && (err.stack || err));
    process.exit(1);
  }
 })();
