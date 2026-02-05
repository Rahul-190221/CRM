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

const router = express.Router();

// Lead CRUD routes
router.get('/', getLeads);
router.get('/stats', getLeadStats);
router.get('/bdms', getBDMs);
router.get('/:id', getLead);
router.post('/', createLead);
router.post('/import', importLeads);
router.post('/assign', assignLeads);
router.patch('/:id', updateLead);
router.patch('/:id/stage', updateLeadStage);
router.patch('/:id/follow-up', addFollowUp);
router.delete('/:id', deleteLead);

export default router;
