import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [socket, setSocket] = useState(null);
    const [online, setOnline] = useState(false);

    useEffect(() => {
        if (isAuthenticated && user) {
            // Initialize socket connection
            const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
                auth: {
                    userId: user._id,
                },
                withCredentials: true,
            });

            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);
                setOnline(true);
            });

            newSocket.on('disconnect', () => {
                console.log('Socket disconnected');
                setOnline(false);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error);
                setOnline(false);
            });

            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        } else {
            // Disconnect socket if user logs out
            if (socket) {
                socket.close();
                setSocket(null);
                setOnline(false);
            }
        }
    }, [isAuthenticated, user]);

    const value = {
        socket,
        online,
    };

    return (
        <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
    );
};
