import { Router } from 'express';
import { getAvailableSchedules } from '../controllers/schedules.controller';

const router = Router();

router.get('/', getAvailableSchedules);

export default router;
