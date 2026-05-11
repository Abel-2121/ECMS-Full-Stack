// services/authService.js - CORRECTED
import axiosPublic from '../utils/axiosPublic';
import axiosPrivate from '../utils/axiosPrivate';

export const authService = {
  // services/authService.js - Login method
  login: async (email, password) => {
    try {
      const response = await axiosPublic.post('/auth/login', { email, password });
      const { accessToken, data } = response.data;
      
      console.log('[Login] Token received:', accessToken ? 'Yes' : 'No');
      console.log('[Login] Token preview:', accessToken?.substring(0, 20) + '...');
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return response.data;
    } catch (error) {
      console.error('[Login] Error:', error.response?.data?.message);
      throw error;
    }
  },
  
  signup: async (userData) => {
    try {
      const response = await axiosPublic.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
  
  verifyOTP: async (email, otp) => {
    try {
      const response = await axiosPublic.post('/auth/verify-otp', { email, otp });
      const { accessToken, data } = response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return response.data;
    } catch (error) {
      console.error('Verify OTP error:', error);
      throw error;
    }
  },
  
  resendOTP: async (email) => {
    try {
      const response = await axiosPublic.post('/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  },
  
  forgotPassword: async (email) => {
    try {
      const response = await axiosPublic.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },
  
  resetPassword: async (token, password, passwordConfirm) => {
    try {
      const response = await axiosPublic.post(`/auth/reset-password/${token}`, { password, passwordConfirm });
      const { accessToken, data } = response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
  
  googleLogin: async (credential) => {
    try {
      const response = await axiosPublic.post('/auth/google-login', { credential });
      const { accessToken, data } = response.data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return response.data;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  },
  
  getProfile: async () => {
    try {
      const response = await axiosPrivate.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await axiosPrivate.patch('/user/profile', userData);
      const updatedUser = response.data.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await axiosPrivate.patch('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await axiosPrivate.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('verified_') || key.startsWith('voterId_')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  }
};