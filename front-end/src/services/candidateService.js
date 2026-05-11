import axiosPrivate from '../utils/axiosPrivate';

const API_URL = '/candidate';

export const candidateService = {
  submitNomination: async (nominationData) => {
    const formData = new FormData();
    formData.append('electionId', nominationData.electionId);
    formData.append('positionId', nominationData.positionId);
    formData.append('positionName', nominationData.positionName);
    formData.append('manifesto', nominationData.manifesto);
    formData.append('biography', nominationData.biography || '');
    formData.append('slogan', nominationData.slogan || '');
    formData.append('declarations', JSON.stringify(nominationData.declarations));
    
    if (nominationData.campaignPhoto) {
      formData.append('campaignPhoto', nominationData.campaignPhoto);
    }
    
    if (nominationData.supportingDocuments) {
      nominationData.supportingDocuments.forEach(doc => {
        formData.append('supportingDocuments', doc);
      });
    }

    const response = await axiosPrivate.post(`${API_URL}/nomination`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data.nomination;
  },

  hasNomination: async (electionId) => {
    const response = await axiosPrivate.get(`${API_URL}/election/${electionId}/has-nomination`);
    return response.data.data;
  },

  getMyNominations: async () => {
    const response = await axiosPrivate.get(`${API_URL}/my-nominations`);
    return response.data.data.nominations;
  },

  getNominationById: async (id) => {
    const response = await axiosPrivate.get(`${API_URL}/nomination/${id}`);
    return response.data.data.nomination;
  },

  withdrawNomination: async (nominationId) => {
    const response = await axiosPrivate.patch(`${API_URL}/nomination/${nominationId}/withdraw`);
    return response.data.data.nomination;
  },

  requestAppeal: async (nominationId, appealMessage) => {
    const response = await axiosPrivate.patch(`${API_URL}/nomination/${nominationId}/appeal`, { appealMessage });
    return response.data.data.nomination;
  },

  getAllCandidates: async (params = {}) => {
    const response = await axiosPrivate.get(`${API_URL}/admin/candidates`, { params });
    return response.data;
  },

  getNominationsByElection: async (electionId, params = {}) => {
    const response = await axiosPrivate.get(`${API_URL}/election/${electionId}/nominations`, { params });
    return response.data.data;
  },

  getCandidateStats: async (electionId) => {
    const response = await axiosPrivate.get(`${API_URL}/admin/election/${electionId}/stats`);
    return response.data.data.stats;
  },

  getNominationByIdAdmin: async (id) => {
    const response = await axiosPrivate.get(`${API_URL}/admin/nomination/${id}`);
    return response.data.data.nomination;
  },

  getCandidateByIdAdmin: async (id) => {
    const response = await axiosPrivate.get(`${API_URL}/admin/candidate/${id}`);
    return response.data.data.candidate;
  },

  approveNomination: async (nominationId, data) => {
    const response = await axiosPrivate.patch(`${API_URL}/nomination/${nominationId}/approve`, data);
    return response.data.data.nomination;
  },

  rejectNomination: async (nominationId, data) => {
    const response = await axiosPrivate.patch(`${API_URL}/nomination/${nominationId}/reject`, data);
    return response.data.data.nomination;
  },

  updateCandidate: async (candidateId, data) => {
    const response = await axiosPrivate.patch(`${API_URL}/admin/candidate/${candidateId}`, data);
    return response.data.data.candidate;
  },

  // Delete candidate (Admin)
  deleteCandidate: async (candidateId) => {
    const response = await axiosPrivate.delete(`${API_URL}/admin/candidate/${candidateId}`);
    return response.data;
  },

  bulkApproveNominations: async (electionId, nominationIds) => {
    const response = await axiosPrivate.post(`${API_URL}/election/${electionId}/nominations/bulk-approve`, { nominationIds });
    return response.data.data;
  },

  // Assign ballot positions (Admin)
  assignBallotPositions: async (electionId, ballotAssignments) => {
    const response = await axiosPrivate.patch(`${API_URL}/election/${electionId}/ballot-positions`, { ballotAssignments });
    return response.data;
  },

  getApprovedCandidates: async (electionId) => {
    const response = await axiosPrivate.get(`${API_URL}/election/${electionId}/candidates`);
    return response.data.data;
  },

  getCandidatePublic: async (id) => {
    const response = await axiosPrivate.get(`${API_URL}/candidate/${id}`);
    return response.data.data.candidate;
  },

  batchNominationStatus: async (electionIds) => {
    const response = await axiosPrivate.post(`${API_URL}/batch/nomination-status`, { electionIds });
    return response.data.data.statusMap;
  },
  
getCandidateHistory: async () => {
  const response = await axiosPrivate.get(`${API_URL}/my-history`);
  return response.data.data;
},
};