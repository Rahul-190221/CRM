import express from 'express';
import { getExams, getExam, createExam, updateExam, deleteExam } from '../controllers/exams.controller';

const router = express.Router();

router.get('/', getExams);
router.get('/:id', getExam);
router.post('/', createExam);
router.patch('/:id', updateExam);
router.delete('/:id', deleteExam);

export default router;
