// services/dashboardService.js (updated)
import axiosPrivate from '../utils/axiosPrivate';

export const dashboardService = {
  // Get platform summary
  getPlatformSummary: async () => {
    const response = await axiosPrivate.get('/dashboard/platform-summary');
    return response.data.data;
  },

  // Get user growth data
  getUserGrowth: async () => {
    const response = await axiosPrivate.get('/dashboard/user-growth');
    return response.data.data;
  },

  // Get election trend
  getElectionTrend: async () => {
    const response = await axiosPrivate.get('/dashboard/election-trend');
    return response.data.data;
  },

  // Get institution activity
  getInstitutionActivity: async () => {
    const response = await axiosPrivate.get('/dashboard/institution-activity');
    return response.data.data;
  },

  // Get top institutions
  getTopInstitutions: async () => {
    const response = await axiosPrivate.get('/dashboard/top-institutions');
    return response.data.data.topInstitutions;
  },

  // Get recent activities
  getRecentActivities: async () => {
    const response = await axiosPrivate.get('/dashboard/recent-activities');
    return response.data.data.recentActivities;
  },

  // Legacy - for backward compatibility
  getDashboardStats: async () => {
    const response = await axiosPrivate.get('/dashboard/stats');
    return response.data.data;
  },


getSystemAnalytics: async () => {
  const response = await axiosPrivate.get('/dashboard/system-analytics');
  return response.data.data;
},
};