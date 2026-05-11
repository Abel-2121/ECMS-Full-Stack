// services/voteService.js
import axiosPrivate from '../utils/axiosPrivate';

const API_URL = '/vote';

export const voteService = {
  verifyCredentials: async (electionId, electionCode, voterId) => {
    const response = await axiosPrivate.post(`${API_URL}/verify`, {
      electionId,
      electionCode,
      voterId
    });
    return response.data;
  },

  getVotingData: async (electionId) => {
    const response = await axiosPrivate.get(`${API_URL}/election/${electionId}/voting-data`);
    return response.data.data;
  },

  castVote: async (electionId, votes) => {
    const response = await axiosPrivate.post(`${API_URL}/cast`, {
      electionId,
      votes
    });
    return response.data.data.vote;
  },
  hasVoted: async (electionId) => {
    const response = await axiosPrivate.get(`${API_URL}/has-voted/${electionId}`);
    return response.data.data.hasVoted;
  },

  // Get user's voting history
  getMyVotes: async () => {
    const response = await axiosPrivate.get(`${API_URL}/my-votes`);
    return response.data.data.votes;
  },

  getPublicResults: async (electionId) => {
    const response = await axiosPrivate.get(`${API_URL}/public/election/${electionId}/results`);
    return response.data.data;
  },
  verifyVote: async (confirmationCode) => {
    const response = await axiosPrivate.post('/vote/verify-confirmation', { confirmationCode });
    return response.data;
  },
};