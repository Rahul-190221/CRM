import express from 'express';
import { getBDMReport, getBDMTaskStatus } from '../controllers/reports.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/bdm', authenticateToken, getBDMReport);
router.get('/task-status', authenticateToken, getBDMTaskStatus);

export default router;
