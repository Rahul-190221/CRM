import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SOCKET_URL = (() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
    if (socketUrl) {
        return socketUrl.replace(/\/+$/, '');
    }

    if (API_URL && /localhost|127\.0\.0\.1|\[::1\]/.test(API_URL)) {
        return API_URL.replace(/\/api\/?$/, '');
    }

    return null;
})();

class ClientSocketService {
    public socket: Socket | null = null;
    private connectedToken: string | null = null;

    public connect(token: string) {
        if (!token) {
            return;
        }

        if (!SOCKET_URL) {
            // Production deployments without a dedicated Socket.IO host should
            // fall back to HTTP polling for notifications instead of erroring.
            if (process.env.NODE_ENV === 'production') {
                console.warn('NEXT_PUBLIC_SOCKET_URL is not set; realtime notifications are disabled.');
            }
            this.disconnect();
            return;
        }

        if (this.socket && this.connectedToken === token) {
            if (!this.socket.connected) {
                this.socket.connect();
            }
            return;
        }

        this.disconnect();

        this.connectedToken = token;
        this.socket = io(SOCKET_URL, {
            auth: { token },
            withCredentials: true,
            transports: ['polling'],
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
            reconnectionDelayMax: 10000,
            timeout: 20000,
        });

        this.socket.on('connect', () => {
            console.log('Connected to socket server', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        this.socket.on('connect_error', (err) => {
            console.warn('Socket connect error:', err.message);
        });
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.connectedToken = null;
    }
}

export const socketService = new ClientSocketService();
