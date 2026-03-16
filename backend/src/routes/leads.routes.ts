import express from 'express';
import {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  addFollowUp,
  updateLeadStage,
  getBDMs,
  importLeads,
  getLeadStats,
  assignLeads
} from '../controllers/leads.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Lead CRUD routes
router.get('/', authenticateToken, getLeads);
router.get('/stats', authenticateToken, getLeadStats);
router.get('/bdms', authenticateToken, getBDMs);
router.get('/:id', authenticateToken, getLead);
router.post('/', authenticateToken, createLead);
router.post('/import', authenticateToken, importLeads);
router.post('/assign', authenticateToken, assignLeads);
router.patch('/:id', authenticateToken, updateLead);
router.patch('/:id/stage', authenticateToken, updateLeadStage);
router.patch('/:id/follow-up', authenticateToken, addFollowUp);
router.delete('/:id', authenticateToken, deleteLead);

export default router;
