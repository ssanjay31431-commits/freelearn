import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [liveNotifications, setLiveNotifications] = useState([]);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      autoConnect: true,
      reconnection: true
    });

    newSocket.on('connect', () => {
      console.log('⚡ Admin Socket Connected:', newSocket.id);
    });

    newSocket.on('notification:order', (data) => {
      setLiveNotifications(prev => [{ ...data, id: Date.now() }, ...prev]);
    });

    newSocket.on('broadcast:notification', (data) => {
      setLiveNotifications(prev => [{ ...data, title: data.subject, id: Date.now() }, ...prev]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
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
