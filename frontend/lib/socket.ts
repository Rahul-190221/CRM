import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '');

class ClientSocketService {
    public socket: Socket | null = null;

    public connect(token: string) {
        if (!this.socket) {
            this.socket = io(API_URL, {
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
    }

    public disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }
}

export const socketService = new ClientSocketService();
