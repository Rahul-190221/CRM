import { Request, Response } from 'express';
import Lead from '../models/Lead';
import Task from '../models/Task';
import User from '../models/User';

// BDM Dashboard Stats - Filtered by logged-in user
export const getBDMStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    // Get counts for the BDM's leads
    const totalLeads = await Lead.countDocuments({ assignedTo: userId });
    const converted = await Lead.countDocuments({ assignedTo: userId, lifecycleStage: 'Converted' });
    const inProgress = await Lead.countDocuments({
      assignedTo: userId,
      lifecycleStage: { $in: ['Intake', 'Processing', 'Hot'] }
    });

    // Calculate target percentage (converted / total * 100)
    const targetPercentage = totalLeads > 0 ? Math.round((converted / totalLeads) * 100) : 0;

    // Get previous period stats for comparison (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const currentPeriodLeads = await Lead.countDocuments({
      assignedTo: userId,
      createdAt: { $gte: thirtyDaysAgo }
    });
    const previousPeriodLeads = await Lead.countDocuments({
      assignedTo: userId,
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    });

    const leadsChange = previousPeriodLeads > 0
      ? Math.round(((currentPeriodLeads - previousPeriodLeads) / previousPeriodLeads) * 100)
      : currentPeriodLeads > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        totalLeads: { value: totalLeads, change: leadsChange },
        converted: { value: converted, change: 8 }, // Mock change for now
        inProgress: { value: inProgress, change: 5 },
        target: { value: `${targetPercentage}%`, change: 3 }
      }
    });
  } catch (error) {
    console.error('Error fetching BDM stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard stats' });
  }
};

// BDM Recent Leads
export const getBDMRecentLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 5;

    const recentLeads = await Lead.find({ assignedTo: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const leads = recentLeads.map((lead) => ({
      id: lead._id,
      name: lead.fullName,
      service: lead.serviceInterest || 'General Inquiry',
      phone: lead.phone || 'N/A',
      createdAt: lead.createdAt,
      stage: lead.lifecycleStage
    }));

    res.json({ success: true, data: leads });
  } catch (error) {
    console.error('Error fetching recent leads:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent leads' });
  }
};

// BDM Upcoming Tasks
export const getBDMUpcomingTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 5;

    const tasks = await Task.find({
      assignedTo: userId,
      status: { $ne: 'completed' },
      dueDate: { $gte: new Date() }
    })
      .sort({ dueDate: 1 })
      .limit(limit)
      .populate('entityId')
      .lean();

    const upcomingTasks = tasks.map(task => ({
      id: task._id,
      title: task.title,
      dueDate: task.dueDate,
      priority: task.priority,
      entityType: task.entityType
    }));

    res.json({ success: true, data: upcomingTasks });
  } catch (error) {
    console.error('Error fetching upcoming tasks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming tasks' });
  }
};

// Lead Stage Distribution (works for both BDM and Admin)
export const getLeadStageDistribution = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const filter = isAdmin ? {} : { assignedTo: userId };

    const stages = ['Intake', 'Processing', 'Hot', 'Converted', 'Dead'];
    const distribution = await Promise.all(
      stages.map(async (stage) => ({
        stage,
        count: await Lead.countDocuments({ ...filter, lifecycleStage: stage })
      }))
    );

    res.json({ success: true, data: distribution });
  } catch (error) {
    console.error('Error fetching lead stage distribution:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lead stage distribution' });
  }
};

// Lead Stage Trend (last 6 months)
export const getLeadStageTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const filter = isAdmin ? {} : { assignedTo: userId };

    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthData = {
        month: date.toLocaleString('default', { month: 'short' }),
        Converted: await Lead.countDocuments({
          ...filter,
          lifecycleStage: 'Converted',
          updatedAt: { $gte: date, $lt: nextMonth }
        }),
        Hot: await Lead.countDocuments({
          ...filter,
          lifecycleStage: 'Hot',
          createdAt: { $gte: date, $lt: nextMonth }
        }),
        Intake: await Lead.countDocuments({
          ...filter,
          lifecycleStage: 'Intake',
          createdAt: { $gte: date, $lt: nextMonth }
        }),
        Processing: await Lead.countDocuments({
          ...filter,
          lifecycleStage: 'Processing',
          createdAt: { $gte: date, $lt: nextMonth }
        })
      };

      months.push(monthData);
    }

    res.json({ success: true, data: months });
  } catch (error) {
    console.error('Error fetching lead stage trend:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lead stage trend' });
  }
};

// Lead Source Distribution
export const getLeadSourceDistribution = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const filter = isAdmin ? {} : { assignedTo: userId };

    const sources = ['Website', 'Referral', 'Social Media', 'Email Campaign', 'Walk-in', 'Phone', 'Other'];
    const total = await Lead.countDocuments(filter);

    const distribution = await Promise.all(
      sources.map(async (source) => {
        const count = await Lead.countDocuments({ ...filter, source });
        return {
          source,
          count,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0
        };
      })
    );

    res.json({ success: true, data: distribution });
  } catch (error) {
    console.error('Error fetching lead source distribution:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch lead source distribution' });
  }
};

// Conversion Rate Trend (last 6 months)
export const getConversionRateTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const filter = isAdmin ? {} : { assignedTo: userId };

    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const totalInMonth = await Lead.countDocuments({
        ...filter,
        createdAt: { $gte: date, $lt: nextMonth }
      });

      const convertedInMonth = await Lead.countDocuments({
        ...filter,
        lifecycleStage: 'Converted',
        updatedAt: { $gte: date, $lt: nextMonth }
      });

      months.push({
        month: date.toLocaleString('default', { month: 'short' }),
        rate: totalInMonth > 0 ? Math.round((convertedInMonth / totalInMonth) * 100) : 0
      });
    }

    res.json({ success: true, data: months });
  } catch (error) {
    console.error('Error fetching conversion rate trend:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversion rate trend' });
  }
};

// Status Distribution (for task/lead status breakdown)
export const getStatusDistribution = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role === 'admin';
    const filter = isAdmin ? {} : { assignedTo: userId };

    // Using lifecycle stages as status
    const statuses = [
      { label: 'New', stage: 'Intake', color: '#3B82F6' },
      { label: 'In Progress', stage: 'Processing', color: '#F59E0B' },
      { label: 'Contacted', stage: 'Hot', color: '#22C55E' },
      { label: 'Qualified', stage: 'Hot', color: '#10B981' },
      { label: 'Converted', stage: 'Converted', color: '#06B6D4' },
      { label: 'Dead', stage: 'Dead', color: '#EF4444' }
    ];

    const distribution = await Promise.all(
      statuses.map(async (status) => ({
        label: status.label,
        count: await Lead.countDocuments({ ...filter, lifecycleStage: status.stage }),
        color: status.color
      }))
    );

    res.json({ success: true, data: distribution });
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch status distribution' });
  }
};

// ============ ADMIN SPECIFIC ENDPOINTS ============

// Admin Dashboard Stats
export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeBDMs = await User.countDocuments({
      role: { $in: ['bdm', 'senior-bdm', 'junior-bdm'] },
      isActive: true
    });
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalLeads = await Lead.countDocuments();
    const convertedLeads = await Lead.countDocuments({ lifecycleStage: 'Converted' });

    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0';

    // Mock changes for now
    res.json({
      success: true,
      data: {
        activeBDMs: { value: activeBDMs, change: 2 },
        totalUsers: { value: totalUsers, change: 12 },
        totalLeads: { value: totalLeads, change: 23 },
        conversionRate: { value: `${conversionRate}%`, change: 5 }
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats' });
  }
};

// Admin Recent Activity
export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 5;

    // Get recent leads with their assigned BDMs
    const recentLeads = await Lead.find()
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('assignedTo', 'name')
      .lean();

    const activities = recentLeads.map((lead) => {
      let action = 'Added new lead';
      let type: 'success' | 'info' | 'warning' = 'info';

      if (lead.lifecycleStage === 'Converted') {
        action = `Converted lead "${lead.fullName}"`;
        type = 'success';
      } else if (lead.lifecycleStage === 'Dead') {
        action = `Marked lead as dead`;
        type = 'warning';
      } else {
        action = `Added new lead "${lead.fullName}"`;
      }

      return {
        id: lead._id,
        user: (lead.assignedTo as any)?.name || 'Unassigned',
        action,
        type,
        timestamp: lead.updatedAt
      };
    });

    res.json({ success: true, data: activities });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch recent activity' });
  }
};

// Admin Top Performers
export const getTopPerformers = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 4;

    // Get all BDMs
    const bdms = await User.find({
      role: { $in: ['bdm', 'senior-bdm', 'junior-bdm'] },
      isActive: true
    }).lean();

    // Calculate conversion rate for each BDM
    const performersData = await Promise.all(
      bdms.map(async (bdm) => {
        const totalLeads = await Lead.countDocuments({ assignedTo: bdm._id });
        const convertedLeads = await Lead.countDocuments({
          assignedTo: bdm._id,
          lifecycleStage: 'Converted'
        });

        return {
          id: bdm._id,
          name: bdm.name,
          totalLeads,
          convertedLeads,
          conversionRate: totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0'
        };
      })
    );

    // Sort by conversion rate and get top performers
    const topPerformers = performersData
      .sort((a, b) => parseFloat(b.conversionRate) - parseFloat(a.conversionRate))
      .slice(0, limit)
      .map((performer, index) => ({
        rank: index + 1,
        ...performer
      }));

    res.json({ success: true, data: topPerformers });
  } catch (error) {
    console.error('Error fetching top performers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch top performers' });
  }
};
