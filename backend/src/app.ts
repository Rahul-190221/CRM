import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import connectDB from './config/db';

// Import routes
import authRoutes from './routes/auth.routes';
import tasksRoutes from './routes/tasks.routes';
import dashboardRoutes from './routes/dashboard.routes';
import coursesRoutes from './routes/courses.routes';
import mockTestsRoutes from './routes/mockTests.routes';
import examsRoutes from './routes/exams.routes';
import leadsRoutes from './routes/leads.routes';
import schedulesRoutes from './routes/schedules.routes';
import mockTestPackagesRoutes from './routes/mockTestPackages.routes';
import notificationRoutes from './routes/notification.routes';
import activitiesRoutes from './routes/activities.routes';
import reportsRoutes from './routes/reports.routes';
import { createAndEmitNotification } from './services/notification.service';
import { socketService } from './services/socket.service';

const app = express();

// Trust proxy (required for Vercel/reverse proxies with express-rate-limit)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001']
  ).map(o => o.trim())
);

const isLocalOrigin = (origin: string): boolean => {
  try {
    const parsed = new URL(origin);
    return ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
  } catch {
    return false;
  }
};

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow same-origin/server-to-server requests and local development origins.
    if (!origin || allowedOrigins.has(origin) || isLocalOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/dashboard'),
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forget-password', authLimiter);
app.use('/api', generalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure DB is connected before handling requests (required for serverless/Vercel)
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      console.error('DB connection failed:', err);
      res.status(500).json({ message: 'Database connection failed' });
      return;
    }
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/mock-tests', mockTestsRoutes);
app.use('/api/exams', examsRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/mock-test-packages', mockTestPackagesRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/reports', reportsRoutes);

// Internal socket bridge endpoint.
// When the API and Socket.IO server are deployed separately, the API can
// forward notifications here and the dedicated socket host will emit them.
app.post('/api/internal/socket/notifications', (req: Request, res: Response) => {
  const sharedSecret = process.env.SOCKET_SERVER_SECRET;
  const incomingSecret = req.header('x-socket-server-secret');

  if (!sharedSecret) {
    res.status(503).json({ success: false, message: 'Socket bridge is not configured' });
    return;
  }

  if (!incomingSecret || incomingSecret !== sharedSecret) {
    res.status(403).json({ success: false, message: 'Forbidden' });
    return;
  }

  const { recipientId, notification } = req.body ?? {};

  if (!recipientId || !notification) {
    res.status(400).json({ success: false, message: 'recipientId and notification are required' });
    return;
  }

  socketService.emitToUser(recipientId, 'new-notification', notification);
  res.json({ success: true });
});

// Test Socket.io trigger (Temp for Verification)
app.post('/api/test-notification', async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    await createAndEmitNotification(userId, title, message, 'success');
    res.json({ success: true, message: 'Test notification sent!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'CRM API is running' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;
