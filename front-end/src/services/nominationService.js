import axiosPrivate from '../utils/axiosPrivate';

const API_URL = '/candidate';

export const nominationService = {

  getNominationsByElection: async (electionId, params = {}) => {
    const response = await axiosPrivate.get(`${API_URL}/election/${electionId}/nominations`, { params });
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

  hasNomination: async (electionId) => {
    const response = await axiosPrivate.get(`/candidate/election/${electionId}/has-nomination`);
    return response.data.data; 
  },
    submitNomination: async (nominationData) => {
      console.log('Service - Received nomination data:', nominationData);
      console.log('Service - electionId:', nominationData.electionId);
      
      if (!nominationData.electionId) {
        throw new Error('Election ID is required. Please select an election first.');
      }
      
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
      
      if (nominationData.supportingDocuments && nominationData.supportingDocuments.length > 0) {
        nominationData.supportingDocuments.forEach(doc => {
          formData.append('supportingDocuments', doc);
        });
      }
  
      console.log('Sending to API - electionId:', nominationData.electionId);
      
      const response = await axiosPrivate.post(`${API_URL}/nomination`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return response.data.data.nomination;
    },
    
  
  approveNomination: async (nominationId, data) => {
    const response = await axiosPrivate.patch(`${API_URL}/nomination/${nominationId}/approve`, data);
    return response.data.data.nomination;
  },

  rejectNomination: async (nominationId, data) => {
    const response = await axiosPrivate.patch(`${API_URL}/nomination/${nominationId}/reject`, data);
    return response.data.data.nomination;
  },

  bulkApproveNominations: async (electionId, nominationIds) => {
    const response = await axiosPrivate.post(`${API_URL}/election/${electionId}/nominations/bulk-approve`, { nominationIds });
    return response.data.data;
  },

  assignBallotPositions: async (electionId, ballotAssignments) => {
    const response = await axiosPrivate.patch(`${API_URL}/election/${electionId}/ballot-positions`, { ballotAssignments });
    return response.data;
  },

  withdrawNomination: async (nominationId) => {
    const response = await axiosPrivate.patch(`${API_URL}/nomination/${nominationId}/withdraw`);
    return response.data.data.nomination;
  },

  requestAppeal: async (nominationId, appealMessage) => {
    const response = await axiosPrivate.patch(`${API_URL}/nomination/${nominationId}/appeal`, { appealMessage });
    return response.data.data.nomination;
  },


batchCheckNomination: async (electionIds) => {
  const response = await axiosPrivate.post(
    '/candidate/batch/nomination-status',
    { electionIds }
  );
  return response.data.data.statusMap;
},

deleteCandidate: async (candidateId) => {
  const response = await axiosPrivate.delete(`/candidate/admin/candidate/${candidateId}`);
  return response.data;
},
};