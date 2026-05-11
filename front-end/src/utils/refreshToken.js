// utils/refreshToken.js
import axiosPublic from './axiosPublic';

export const refreshAccessToken = async () => {
  console.log('[Refresh] 1. Starting refresh attempt...');
  
  try {
    console.log('[Refresh] 2. Making request to /auth/refresh');
    const response = await axiosPublic.post('/auth/refresh');
    
    console.log('[Refresh] 3. Response received:', {
      status: response.status,
      hasData: !!response.data,
      hasAccessToken: !!response.data?.accessToken
    });
    
    const newToken = response.data.accessToken;
    
    if (newToken) {
      console.log('[Refresh] 4. Token received, saving to localStorage');
      localStorage.setItem('token', newToken);
      console.log('[Refresh] 5. Refresh SUCCESS');
      return newToken;
    } else {
      console.log('[Refresh] 4. No token in response');
      throw new Error('No access token received');
    }
  } catch (error) {
    console.log('[Refresh] ERROR OCCURRED:');
    console.log('  - Status:', error.response?.status);
    console.log('  - Message:', error.response?.data?.message);
    console.log('  - Full error:', error.message);
    
    throw error;
  }
};