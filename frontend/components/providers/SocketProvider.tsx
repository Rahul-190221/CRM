'use client'

import React, { createContext, useContext, useEffect } from 'react';
import { socketService } from '@/lib/socket';
import Cookies from 'js-cookie';

const SocketContext = createContext<typeof socketService | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {

    useEffect(() => {
        // Find token from cookies or localStorage (Luminedge CRM typically uses cookies/localStorage)
        const token = Cookies.get('token') || localStorage.getItem('token');

        if (token) {
            socketService.connect(token);
        }

        return () => {
            socketService.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socketService}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
