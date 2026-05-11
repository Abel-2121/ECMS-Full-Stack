// services/resultsService.js
import axiosPrivate from '../utils/axiosPrivate';

export const resultService = {
  getPublicResults: async (electionId) => {
    const response = await axiosPrivate.get(`/result/election/${electionId}/public`);
    return response.data.data;
  },

  getDetailedResults: async (electionId) => {
    console.log('getDetailedResults called with electionId:', electionId);
    const response = await axiosPrivate.get(`/result/election/${electionId}/detailed`);
    console.log('getDetailedResults response:', response);
    return response.data;
  },

  resolveTie: async (electionId, positionId) => {
    const response = await axiosPrivate.post(`/result/election/${electionId}/resolve-tie/${positionId}`);
    return response.data;
  },

  publishResults: async (electionId) => {
    const response = await axiosPrivate.post(`/result/election/${electionId}/publish`);
    return response.data;
  },

  getAllResults: async () => {
    const response = await axiosPrivate.get('/result/admin/all');
    return response.data.data.results;
  },

  deleteResult: async (electionId) => {
    const response = await axiosPrivate.delete(`/result/${electionId}`);
    return response.data;
  }
};