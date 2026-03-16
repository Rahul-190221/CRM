import http from 'http';
import app from './app';
import connectDB from './config/db';
import { socketService } from './services/socket.service';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
socketService.init(server);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
