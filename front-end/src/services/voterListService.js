// services/voterListService.js
import axiosPrivate from '../utils/axiosPrivate';

const API_URL = '/voter-eligibility';

export const voterListService = {
  // Upload voter list (bulk)
  uploadVoterList: async (electionId, file) => {
    const formData = new FormData();
    formData.append('voterList', file);
    const response = await axiosPrivate.post(
      `${API_URL}/election/${electionId}/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  // Get voter list summary
  getVoterListSummary: async (electionId) => {
    const response = await axiosPrivate.get(`${API_URL}/election/${electionId}`);
    return response.data.data.voterList;
  },

  // Get detailed voters with pagination
  getVoterDetails: async (electionId, page = 1, limit = 10, search = '') => {
    const response = await axiosPrivate.get(
      `${API_URL}/election/${electionId}/voters?page=${page}&limit=${limit}&search=${search}`
    );
    return response.data;
  },

  // Add single voter
  addVoter: async (electionId, voterData) => {
    const response = await axiosPrivate.post(`${API_URL}/election/${electionId}/voter`, voterData);
    return response.data.data;
  },

  // Update voter
  updateVoter: async (electionId, voterId, voterData) => {
    const response = await axiosPrivate.put(`${API_URL}/election/${electionId}/voter/${voterId}`, voterData);
    return response.data.data;
  },

  // Delete voter
  deleteVoter: async (electionId, voterId) => {
    const response = await axiosPrivate.delete(`${API_URL}/election/${electionId}/voter/${voterId}`);
    return response.data;
  },

  // Download template
  downloadTemplate: async () => {
    const response = await axiosPrivate.get(`${API_URL}/template`, { responseType: 'blob' });
    return response.data;
  },

  // Delete entire voter list
  deleteVoterList: async (electionId) => {
    const response = await axiosPrivate.delete(`${API_URL}/election/${electionId}`);
    return response.data;
  },

  // Check eligibility
  checkEligibility: async (electionId, email) => {
    const response = await axiosPrivate.get(`${API_URL}/election/${electionId}/check/${email}`);
    return response.data.data;
  },

  registerForElection: async (electionId, email) => {
    const response = await axiosPrivate.post(
      `${API_URL}/election/${electionId}/register`,
      { email }
    );
    return response.data;
  },

 
  checkIsRegistered: async (electionId) => {
    const response = await axiosPrivate.get(`${API_URL}/election/${electionId}/is-registered`);
    return response.data.data;  
  },
  // services/voterListService.js - Add batch method

  // Batch check registration status for multiple elections
  batchCheckRegistration: async (electionIds) => {
    const response = await axiosPrivate.post(
      `${API_URL}/batch/registration-status`,
      { electionIds }
    );
    return response.data.data.statusMap;
  },

};

