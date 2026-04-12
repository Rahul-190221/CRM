import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL
    || (API_URL && API_URL.includes('localhost')
        ? API_URL.replace('/api', '')
        : null);

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
            withCredentials: true
        });

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket server', this.socket?.id);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
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
