// utils/axiosPublic.js
import axios from 'axios';

const axiosPublic = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4001/api',
  withCredentials: true,  // ✅ CRITICAL: Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosPublic;