const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get auth token
const getAuthHeader = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// BDM Dashboard APIs
export const getBDMStats = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/bdm/stats`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch BDM stats');
  return response.json();
};

export const getRecentLeads = async (limit: number = 5) => {
  const response = await fetch(`${API_BASE_URL}/dashboard/bdm/recent-leads?limit=${limit}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch recent leads');
  return response.json();
};

export const getUpcomingTasks = async (limit: number = 5) => {
  const response = await fetch(`${API_BASE_URL}/dashboard/bdm/upcoming-tasks?limit=${limit}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch upcoming tasks');
  return response.json();
};

// Shared Dashboard APIs
export const getLeadStageDistribution = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/lead-stage-distribution`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch lead stage distribution');
  return response.json();
};

export const getLeadStageTrend = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/lead-stage-trend`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch lead stage trend');
  return response.json();
};

export const getLeadSourceDistribution = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/lead-source-distribution`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch lead source distribution');
  return response.json();
};

export const getConversionRateTrend = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/conversion-rate-trend`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch conversion rate trend');
  return response.json();
};

export const getStatusDistribution = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/status-distribution`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch status distribution');
  return response.json();
};

// Admin Dashboard APIs
export const getAdminStats = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard/admin/stats`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch admin stats');
  return response.json();
};

export const getRecentActivity = async (limit: number = 5) => {
  const response = await fetch(`${API_BASE_URL}/dashboard/admin/recent-activity?limit=${limit}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch recent activity');
  return response.json();
};

export const getTopPerformers = async (limit: number = 4) => {
  const response = await fetch(`${API_BASE_URL}/dashboard/admin/top-performers?limit=${limit}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch top performers');
  return response.json();
};
