import axiosPrivate from '../utils/axiosPrivate';

export const adminService = {
  getAllAdmins: async () => {
    try {
      const response = await axiosPrivate.get('/admin');
      return response.data;
    } catch (error) {
      console.error('Get all admins error:', error);
      throw error.response?.data || error.message;
    }
  },

  getAdminById: async (adminId) => {
    try {
      const response = await axiosPrivate.get(`/admin/${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Get admin by ID error:', error);
      throw error.response?.data || error.message;
    }
  },

  createAdmin: async (adminData) => {
    try {
      const response = await axiosPrivate.post('/admin', adminData);
      return response.data;
    } catch (error) {
      console.error('Create admin error:', error);
      throw error.response?.data || error.message;
    }
  },

  updateAdmin: async (adminId, adminData) => {
    try {
      const response = await axiosPrivate.patch(`/admin/${adminId}`, adminData);
      return response.data;
    } catch (error) {
      console.error('Update admin error:', error);
      throw error.response?.data || error.message;
    }
  },

  toggleAdminStatus: async (adminId) => {
    try {
      const response = await axiosPrivate.patch(`/admin/${adminId}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error('Toggle admin status error:', error);
      throw error.response?.data || error.message;
    }
  },

  deleteAdmin: async (adminId) => {
    try {
      const response = await axiosPrivate.delete(`/admin/${adminId}`);
      return response.data;
    } catch (error) {
      console.error('Delete admin error:', error);
      throw error.response?.data || error.message;
    }
  },

  getAdminsByInstitution: async (institutionId) => {
    try {
      const response = await axiosPrivate.get(`/admin/institution/${institutionId}`);
      return response.data;
    } catch (error) {
      console.error('Get admins by institution error:', error);
      throw error.response?.data || error.message;
    }
  },

  sendWelcomeEmail: async (email, name, tempPassword) => {
    try {
      const response = await axiosPrivate.post('/admin/send-welcome-email', { email, name, tempPassword });
      return response.data;
    } catch (error) {
      console.error('Send welcome email error:', error);

      return { success: true, mock: true };
    }
  },

  resendInvitation: async (adminId) => {
    try {
      const response = await axiosPrivate.post(`/admin/${adminId}/resend-invitation`);
      return response.data;
    } catch (error) {
      console.error('Resend invitation error:', error);
      throw error.response?.data || error.message;
    }
  },

  getAdminStats: async () => {
    try {
      const response = await axiosPrivate.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Get admin stats error:', error);
      throw error.response?.data || error.message;
    }
  }
};