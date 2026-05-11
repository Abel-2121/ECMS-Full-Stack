// utils/axiosPrivate.js - WITH DETAILED DEBUGGING
import axios from 'axios';
import { refreshAccessToken } from './refreshToken';

const axiosPrivate = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor
axiosPrivate.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {

      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with detailed debugging
axiosPrivate.interceptors.response.use(
  (response) => {
    console.log(`[Response SUCCESS] ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
   
    const originalRequest = error.config;
    
    // Check if it's a 401
    if (error.response?.status === 401) {
      console.log('[Error] 401 detected - token may be expired');
      
      // Check if it's the refresh endpoint itself
      if (originalRequest.url?.includes('/auth/refresh')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // Check if already retrying
      if (originalRequest._retry) {

        return Promise.reject(error);
      }
      
   
      // If already refreshing, queue this request
      if (isRefreshing) {
  
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {

          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosPrivate(originalRequest);
        }).catch(err => {

          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
 

      try {
  
        const newToken = await refreshAccessToken();
   
        
        if (newToken) {
        
          processQueue(null, newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        
          return axiosPrivate(originalRequest);
        } else {
          throw new Error('No token returned from refresh');
        }
      } catch (refreshError) {
        console.error('[Auth] Refresh FAILED:', refreshError);
        console.error('[Auth] Refresh error details:', {
          message: refreshError.message,
          response: refreshError.response?.data,
          status: refreshError.response?.status
        });
        processQueue(refreshError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
 
      }
    } else {
      console.log(`[Error] Not a 401 error (status: ${error.response?.status}), passing through`);
    }
    
    
    return Promise.reject(error);
  }
);

export default axiosPrivate;