import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}
const JWT_SECRET_SAFE: string = JWT_SECRET;

class SocketService {
    private io: SocketIOServer | null = null;

    public init(server: HttpServer): void {
        const allowedOrigins = process.env.ALLOWED_ORIGINS
            ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
            : ['http://localhost:3000', 'http://localhost:3001'];

        this.io = new SocketIOServer(server, {
            cors: {
                origin: allowedOrigins,
                methods: ['GET', 'POST'],
                credentials: true
            },
        });

        this.io.use((socket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            try {
                const decoded = jwt.verify(token as string, JWT_SECRET_SAFE) as unknown as { userId: string, role: string };
                socket.data.user = decoded;
                next();
            } catch (err) {
                next(new Error('Authentication error'));
            }
        });

        this.io.on('connection', (socket) => {
            const userId = socket.data.user.userId;

            // Join a room unique to this user
            socket.join(userId);
            console.log(`Socket connected & joined room ${userId} (Socket ID: ${socket.id})`);

            socket.on('disconnect', () => {
                console.log(`Socket disconnected: ${socket.id}`);
            });
        });
    }

    public getIO(): SocketIOServer {
        if (!this.io) {
            throw new Error('Socket.io not initialized');
        }
        return this.io;
    }

    // Emit to a specific user using their room
    public emitToUser(userId: string, event: string, data: any) {
        if (this.io) {
            this.io.to(userId.toString()).emit(event, data);
        }
    }
}

export const socketService = new SocketService();
