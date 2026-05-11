import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import { resetVotingSession, clearAllSelections } from './voting-slice';

export const login = createAsyncThunk(
  'auth/login', 
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      return response;
    } catch (error) {
     
      let errorMessage = 'Login failed. Please try again.';
      
      // Your backend sends: { success: false, message: "..." }
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
     
      return rejectWithValue(errorMessage);
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup', 
  async (userData, { rejectWithValue }) => {
    try {
      return await authService.signup(userData);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verify-otp', 
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      return await authService.verifyOTP(email, otp);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Verification failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const resendOTP = createAsyncThunk(
  'auth/resend-otp', 
  async ({ email }, { rejectWithValue }) => {
    try {
      return await authService.resendOTP(email);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to resend OTP';
      return rejectWithValue(errorMessage);
    }
  }
);

export const forgotPassword = createAsyncThunk(
  'auth/forgot-password', 
  async ({ email }, { rejectWithValue }) => {
    try {
      return await authService.forgotPassword(email);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send reset link';
      return rejectWithValue(errorMessage);
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/reset-password', 
  async ({ token, password, passwordConfirm }, { rejectWithValue }) => {
    try {
      return await authService.resetPassword(token, password, passwordConfirm);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin', 
  async ({ credential }, { rejectWithValue }) => {
    try {
      return await authService.googleLogin(credential);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Google login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile', 
  async (userData, { rejectWithValue }) => {
    try {
      return await authService.updateProfile(userData);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Profile update failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword', 
  async (passwordData, { rejectWithValue }) => {
    try {
      return await authService.changePassword(passwordData);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Password change failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  authService.logout();
  dispatch(resetVotingSession());
  dispatch(clearAllSelections());
  return {};
});

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  error: null,
  passwordResetSent: false,
  passwordResetSuccess: false,
  otpResendCooldown: 0
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    clearPasswordResetState: (state) => {
      state.passwordResetSent = false;
      state.passwordResetSuccess = false;
    },
    decrementResendCooldown: (state) => {
      if (state.otpResendCooldown > 0) {
        state.otpResendCooldown--;
      }
    },
    startResendCooldown: (state) => {
      state.otpResendCooldown = 60;
    }
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.isLoading = true;
      state.error = null;
    };
    
    const handleFulfilled = (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload?.data?.user || null;
      state.token = action.payload?.accessToken || null;
    };
    
    const handleRejected = (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = action.payload; // ✅ This is the error message string
      state.token = null;
      state.user = null;
    };
    
    builder
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, handleFulfilled)
      .addCase(login.rejected, handleRejected)
      
      .addCase(signup.pending, handlePending)
      .addCase(signup.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signup.rejected, handleRejected)
      
      .addCase(verifyOTP.pending, handlePending)
      .addCase(verifyOTP.fulfilled, handleFulfilled)
      .addCase(verifyOTP.rejected, handleRejected)
      
      .addCase(resendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(resendOTP.rejected, handleRejected)
      
      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.passwordResetSent = false;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.passwordResetSent = true;
      })
      .addCase(forgotPassword.rejected, handleRejected)
      
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.passwordResetSuccess = false;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.passwordResetSuccess = true;
        state.isAuthenticated = true;
        state.user = action.payload?.data?.user || null;
        state.token = action.payload?.accessToken || null;
      })
      .addCase(resetPassword.rejected, handleRejected)
      
      .addCase(googleLogin.pending, handlePending)
      .addCase(googleLogin.fulfilled, handleFulfilled)
      .addCase(googleLogin.rejected, handleRejected)
      
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (action.payload?.data?.user) {
          state.user = action.payload.data.user;
          localStorage.setItem('user', JSON.stringify(state.user));
        }
      })
      .addCase(updateProfile.rejected, handleRejected)
      
      .addCase(changePassword.fulfilled, (state) => {})
      .addCase(changePassword.rejected, handleRejected)
      
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        state.passwordResetSent = false;
        state.passwordResetSuccess = false;
        state.otpResendCooldown = 0;
      });
  }
});

export const { 
  clearError, 
  updateUser, 
  clearPasswordResetState,
  decrementResendCooldown,  
  startResendCooldown       
} = authSlice.actions;

export default authSlice.reducer;