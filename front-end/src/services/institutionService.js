// services/institutionService.js
import axiosPrivate from '../utils/axiosPrivate';

const API_URL = '/institution';

export const institutionService = {
  // Get all institutions (SuperAdmin)
  getAllInstitutions: async (params = {}) => {
    const response = await axiosPrivate.get(API_URL, { params });
    return response.data.data.institutions;
  },

  // Get pending requests (SuperAdmin)
  getPendingRequests: async () => {
    const response = await axiosPrivate.get(`${API_URL}/pending-requests`);
    return response.data.data.pendingInstitutions;
  },

  // Get institution by ID
  getInstitutionById: async (id) => {
    const response = await axiosPrivate.get(`${API_URL}/${id}`);
    return response.data.data.institution;
  },

  // Create institution (SuperAdmin)
  createInstitution: async (formData) => {
    const response = await axiosPrivate.post(`${API_URL}/request`, formData);
    return response.data.data?.institution || response.data;
  },

  // Update institution (SuperAdmin)
  updateInstitution: async (id, formData) => {
    const response = await axiosPrivate.patch(`${API_URL}/${id}`, formData);
    return response.data.data.institution;
  },

  // Delete institution (SuperAdmin)
  deleteInstitution: async (id) => {
    await axiosPrivate.delete(`${API_URL}/${id}`);
    return id;
  },

  // Approve institution (SuperAdmin)
  approveInstitution: async (id, adminNotes = '') => {
    const response = await axiosPrivate.post(`${API_URL}/${id}/approve`, { adminNotes });
    return response.data.data.institution;
  },

  // Reject institution (SuperAdmin)
  rejectInstitution: async (id, rejectionReason) => {
    const response = await axiosPrivate.post(`${API_URL}/${id}/reject`, { rejectionReason });
    return response.data.data.institution;
  },

  // Toggle institution status (activate/deactivate)
  toggleStatus: async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const response = await axiosPrivate.patch(`${API_URL}/${id}`, { status: newStatus });
    return response.data.data.institution;
  },

  // Get owner's institution (ElectionAdmin)
  getMyInstitution: async () => {
    const response = await axiosPrivate.get(`${API_URL}/owner/my-institution`);
    return response.data.data.institution;
  },

  // Update owner's institution (ElectionAdmin)
  updateMyInstitution: async (id, formData) => {
    const response = await axiosPrivate.patch(`${API_URL}/owner/${id}`, formData);
    return response.data.data.institution;
  },

  // Check if institution can be deleted
  canDeleteInstitution: (institution) => {
    if (institution.activeElectionCount > 0) {
      return {
        allowed: false,
        message: `Cannot delete institution with ${institution.activeElectionCount} active election(s). End all elections first.`
      };
    }
    return { allowed: true, message: '' };
  },

getPendingRequestById: async (id) => {
  const response = await axiosPrivate.get(`/institution/pending-requests/${id}`);
  return response.data.data.institution;
},
};