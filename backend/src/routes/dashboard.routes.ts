import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';
import {
  getBDMStats,
  getBDMRecentLeads,
  getBDMUpcomingTasks,
  getLeadStageDistribution,
  getLeadStageTrend,
  getLeadSourceDistribution,
  getConversionRateTrend,
  getStatusDistribution,
  getAdminStats,
  getRecentActivity,
  getTopPerformers
} from '../controllers/dashboard.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// BDM Dashboard Routes (accessible by all authenticated users)
router.get('/bdm/stats', getBDMStats);
router.get('/bdm/recent-leads', getBDMRecentLeads);
router.get('/bdm/upcoming-tasks', getBDMUpcomingTasks);

// Shared Dashboard Routes (data filtered based on role)
router.get('/lead-stage-distribution', getLeadStageDistribution);
router.get('/lead-stage-trend', getLeadStageTrend);
router.get('/lead-source-distribution', getLeadSourceDistribution);
router.get('/conversion-rate-trend', getConversionRateTrend);
router.get('/status-distribution', getStatusDistribution);

// Admin Dashboard Routes (admin only)
router.get('/admin/stats', authorizeRoles('admin'), getAdminStats);
router.get('/admin/recent-activity', authorizeRoles('admin'), getRecentActivity);
router.get('/admin/top-performers', authorizeRoles('admin'), getTopPerformers);

export default router;
