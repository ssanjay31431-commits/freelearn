import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vibeforge_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('vibeforge_admin_token');
      if (token) {
        try {
          const res = await axiosClient.get('/admin/me');
          setUser(res.data.user);
          localStorage.setItem('vibeforge_admin_user', JSON.stringify(res.data.user));
        } catch (err) {
          console.error('Failed to fetch admin profile', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axiosClient.post('/admin/login', { email, password });
    const { accessToken, refreshToken, user: userData } = res.data;
    localStorage.setItem('vibeforge_admin_token', accessToken);
    localStorage.setItem('vibeforge_admin_refresh_token', refreshToken);
    localStorage.setItem('vibeforge_admin_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('vibeforge_admin_token');
    localStorage.removeItem('vibeforge_admin_refresh_token');
    localStorage.removeItem('vibeforge_admin_user');
    setUser(null);
  };

  const hasRole = (allowedRoles) => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'admin') return true;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
