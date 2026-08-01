import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vibeforge_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('vibeforge_admin_refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/admin/refresh`, { refreshToken });
          const newAccessToken = res.data.accessToken;
          localStorage.setItem('vibeforge_admin_token', newAccessToken);
          axiosClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        } catch (refreshErr) {
          localStorage.removeItem('vibeforge_admin_token');
          localStorage.removeItem('vibeforge_admin_refresh_token');
          localStorage.removeItem('vibeforge_admin_user');
          window.location.href = '/admin/login';
        }
      } else {
        localStorage.removeItem('vibeforge_admin_token');
        localStorage.removeItem('vibeforge_admin_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
