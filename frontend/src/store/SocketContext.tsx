import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { Platform } from 'react-native';

const SOCKET_URL =
  process.env.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL.replace(/\/api$/, '')
    : Platform.OS === 'web'
    ? 'http://localhost:5001'
    : 'http://10.84.95.53:5001';

interface SocketContextData {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextData>({
  socket: null,
  isConnected: false,
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { token, currentUser } = useAuth();

  useEffect(() => {
    // Only connect if the user is logged in
    if (!token || !currentUser) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log(`[Socket] Connected as ${currentUser.fullName}`);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log(`[Socket] Disconnected`);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.log(`[Socket] Connect error:`, err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token, currentUser]); // Re-connect if token or user changes

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
