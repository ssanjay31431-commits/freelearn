import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [liveNotifications, setLiveNotifications] = useState([]);

  useEffect(() => {
    // Use environment override if provided, otherwise use the production Render URL.
    // Make sure to set VITE_SOCKET_URL in Vercel to https://vibeforge-hq68.onrender.com
    const socketUrl = import.meta.env.VITE_SOCKET_URL
      ? import.meta.env.VITE_SOCKET_URL.replace(/\/$/, '')
      : (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
        ? 'https://vibeforge-hq68.onrender.com'
        : 'http://localhost:5000');
    const newSocket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      secure: socketUrl.startsWith('https'),
      // If you need to pass auth headers/token, add here:
      // auth: { token: localStorage.getItem('token') || '' }
    });

    newSocket.on('connect', () => {
      console.log('⚡ Admin Socket Connected:', newSocket.id, 'to', socketUrl);
    });

    newSocket.on('connect_error', (err) => {
      console.error('⚡ Admin Socket Connection Error:', err && (err.message || err));
    });

    newSocket.on('notification:order', (data) => {
      setLiveNotifications(prev => [{ ...data, id: Date.now() }, ...prev]);
    });

    newSocket.on('broadcast:notification', (data) => {
      setLiveNotifications(prev => [{ ...data, title: data.subject, id: Date.now() }, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      try { newSocket.close(); } catch (e) {}
    };
  }, []);

  const clearNotifications = () => setLiveNotifications([]);

  return (
    <SocketContext.Provider value={{ socket, liveNotifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
