// services/monitoringService.js
import axiosPrivate from '../utils/axiosPrivate';

export const monitoringService = {
  // Fetch all live monitoring data
  fetchElectionData: async (electionId) => {
    try {
      const [statisticsRes, voteCountsRes, recentVotesRes] = await Promise.all([
        axiosPrivate.get(`/vote/election/${electionId}/statistics`),
        axiosPrivate.get(`/vote/election/${electionId}/counts`),
        axiosPrivate.get(`/vote/election/${electionId}`, { params: { limit: 20, sort: '-castAt' } })
      ]);

      return {
        statistics: statisticsRes.data.data,
        voteCounts: voteCountsRes.data.data.results,
        recentVotes: recentVotesRes.data.data.votes || []
      };
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
      throw error;
    }
  },

  // Fetch only statistics (lighter)
  fetchStatistics: async (electionId) => {
    const response = await axiosPrivate.get(`/vote/election/${electionId}/statistics`);
    return response.data.data;
  },

  // Fetch only vote counts
  fetchVoteCounts: async (electionId) => {
    const response = await axiosPrivate.get(`/vote/election/${electionId}/counts`);
    return response.data.data.results;
  },

  // Fetch recent votes
  fetchRecentVotes: async (electionId, limit = 20) => {
    const response = await axiosPrivate.get(`/vote/election/${electionId}`, {
      params: { limit, sort: '-castAt' }
    });
    return response.data.data.votes;
  }
};