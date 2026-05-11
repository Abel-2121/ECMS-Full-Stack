// services/userService.js
import axiosPrivate from '../utils/axiosPrivate';

export const userService = {
  // Get current user profile
  getMyProfile: async () => {
    const response = await axiosPrivate.get('/auth/me');
    return response.data.data.user;
  },

  // Update profile
  updateProfile: async (profileData) => {
    const response = await axiosPrivate.patch('/auth/me', profileData);
    return response.data.data.user;
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await axiosPrivate.patch('/auth/change-password', passwordData);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await axiosPrivate.post('/auth/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data.user;
  },

  // Remove avatar
  removeAvatar: async () => {
    const response = await axiosPrivate.delete('/auth/avatar');
    return response.data.data.user;
  }
};