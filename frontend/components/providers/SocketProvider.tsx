'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { socketService } from '@/lib/socket';
import Cookies from 'js-cookie';

const SocketContext = createContext<typeof socketService | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const [connectionTick, setConnectionTick] = useState(0);

    useEffect(() => {
        const token = Cookies.get('accessToken') || localStorage.getItem('accessToken');

        if (token) {
            socketService.connect(token);
        } else {
            socketService.disconnect();
        }

        setConnectionTick(prev => prev + 1);
    }, [pathname]);

    useEffect(() => {
        return () => {
            socketService.disconnect();
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined' || !('Notification' in window)) return;

        if (Notification.permission === 'default') {
            Notification.requestPermission().catch(() => undefined);
        }
    }, [pathname]);

    useEffect(() => {
        const activeSocket = socketService.socket;
        if (!activeSocket || typeof window === 'undefined' || !('Notification' in window)) return;

        const handleBrowserNotification = (notif: { title: string; message: string }) => {
            const pageIsActive = document.visibilityState === 'visible' && document.hasFocus();
            if (pageIsActive || Notification.permission !== 'granted') {
                return;
            }

            const browserNotification = new Notification(notif.title, {
                body: notif.message,
                icon: '/assets/logo.png',
                tag: 'crm-notification'
            });

            browserNotification.onclick = () => {
                window.focus();
                browserNotification.close();
            };
        };

        activeSocket.on('new-notification', handleBrowserNotification);

        return () => {
            activeSocket.off('new-notification', handleBrowserNotification);
        };
    }, [connectionTick, pathname]);

    return (
        <SocketContext.Provider value={socketService}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
