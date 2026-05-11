// services/electionService.js
import axiosPrivate from '../utils/axiosPrivate';

const API_URL = '/election';

export const electionService = {
  // Create new election
  createElection: async (electionData) => {
    const response = await axiosPrivate.post(API_URL, electionData);
    return response.data.data.election;
  },

  // Get all elections
  getAllElections: async (params = {}) => {
    const response = await axiosPrivate.get(API_URL, { params });
    console.log("RESPOSNSE  dajhahj bdjha",response)
    return response.data.data.elections;
  },

  // Get election by ID
  getElectionById: async (id) => {
    const response = await axiosPrivate.get(`${API_URL}/${id}`);
    return response.data.data.election;
  },

  // Get elections by institution
  getElectionsByInstitution: async (institutionId) => {
    const response = await axiosPrivate.get(`${API_URL}?institutionId=${institutionId}`);
  
    return response.data.data.elections;
  },

  // Update election
  updateElection: async (id, electionData) => {
    const response = await axiosPrivate.patch(`${API_URL}/${id}`, electionData);
    return response.data.data.election;
  },

  // Delete election
  deleteElection: async (id) => {
    await axiosPrivate.delete(`${API_URL}/${id}`);
    return id;
  },

  // Upload voter list
  uploadVoterList: async (electionId, file) => {
    const formData = new FormData();
    formData.append('voterList', file);
    const response = await axiosPrivate.post(`${API_URL}/${electionId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  // Get voter list
  getVoterList: async (electionId) => {
    const response = await axiosPrivate.get(`/voter-eligibility/election/${electionId}`);
    return response.data.data.voterList;
  },

  // Publish results
  publishResults: async (electionId) => {
    const response = await axiosPrivate.post(`/result/election/${electionId}/publish`);
    return response.data.data.result;
  },

  // Get results
  getResults: async (electionId) => {
    const response = await axiosPrivate.get(`/result/election/${electionId}`);
    return response.data.data.result;
  },

  // Get vote statistics (live)
  getVoteStatistics: async (electionId) => {
    const response = await axiosPrivate.get(`/vote/election/${electionId}/statistics`);
    return response.data.data;
  },

  // Get vote counts (per candidate)
  getVoteCounts: async (electionId) => {
    const response = await axiosPrivate.get(`/vote/election/${electionId}/counts`);
    return response.data.data.results;
  }
};

// Mock service for development (when backend is not ready)
export const mockElectionService = {
  createElection: async (electionData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newElection = {
          ...electionData,
          _id: `ELEC-${Date.now()}`,
          electionId: `ELEC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'draft',
          createdAt: new Date().toISOString(),
          statistics: {
            totalEligibleVoters: 0,
            totalVotesCast: 0,
            totalCandidates: 0
          }
        };
        resolve(newElection);
      }, 800);
    });
  },

  getAllElections: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            _id: '1',
            title: 'Student Union Election 2024',
            status: 'voting_open',
            timeline: {
              votingStart: new Date(),
              votingEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            }
          }
        ]);
      }, 500);
    });
  }
};