import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

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
import { createAndEmitNotification } from './services/notification.service';

const app = express();

// Trust proxy (required for Vercel/reverse proxies with express-rate-limit)
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
}));

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
  max: 200,
  message: { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/forget-password', authLimiter);
app.use('/api', generalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
