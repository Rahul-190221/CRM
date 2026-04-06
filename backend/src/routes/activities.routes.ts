import express from 'express';
import { getActivities } from '../controllers/activities.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticateToken, getActivities);

export default router;
