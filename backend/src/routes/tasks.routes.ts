import express from 'express';
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../controllers/tasks.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', authenticateToken, getTasks);
router.get('/:id', authenticateToken, getTask);
router.post('/', authenticateToken, createTask);
router.patch('/:id', authenticateToken, updateTask);
router.delete('/:id', authenticateToken, deleteTask);

export default router;
