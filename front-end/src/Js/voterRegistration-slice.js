// Js/voterRegistration-slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { voterListService } from '../services/voterListService';

// Async Thunks
export const registerForElection = createAsyncThunk(
  'voterRegistration/register',
  async ({ electionId, email }, { rejectWithValue }) => {
    try {
      const response = await voterListService.registerForElection(electionId, email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const checkIsRegistered = createAsyncThunk(
  'voterRegistration/checkStatus',
  async (electionId, { rejectWithValue }) => {
    try {
      const response = await voterListService.checkIsRegistered(electionId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check registration status');
    }
  }
);

export const checkEligibilityOnly = createAsyncThunk(
  'voterRegistration/checkEligibility',
  async ({ electionId, email }, { rejectWithValue }) => {
    try {
      const response = await voterListService.checkEligibility(electionId, email);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check eligibility');
    }
  });
  

export const batchCheckRegistration = createAsyncThunk(
  'voterRegistration/batchCheck',
  async (electionIds, { rejectWithValue }) => {
    try {
      const statusMap = await voterListService.batchCheckRegistration(electionIds);
      return statusMap;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check registration status');
    }
  }
);


// Initial State
const initialState = {
  isLoading: false,
  error: null,
  isRegistered: false,
  isEligible: false,
  registrationSuccess: false,
  registrationData: null,
  checkingStatus: false
};

// Slice
const voterRegistrationSlice = createSlice({
  name: 'voterRegistration',
  initialState,
  reducers: {
    resetRegistrationState: (state) => {
      state.isLoading = false;
      state.error = null;
      state.registrationSuccess = false;
      state.registrationData = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register for Election
      .addCase(registerForElection.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.registrationSuccess = false;
      })
      .addCase(registerForElection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.registrationSuccess = true;
        state.isRegistered = true;
        state.registrationData = action.payload.data;
        state.error = null;
      })
      .addCase(registerForElection.rejected, (state, action) => {
        state.isLoading = false;
        state.registrationSuccess = false;
        state.error = action.payload;
      })

      // Check Is Registered
      .addCase(checkIsRegistered.pending, (state) => {
        state.checkingStatus = true;
        state.error = null;
      })
      .addCase(checkIsRegistered.fulfilled, (state, action) => {
        state.checkingStatus = false;
        state.isRegistered = action.payload.data?.isRegistered || false;
        state.error = null;
      })
      .addCase(checkIsRegistered.rejected, (state, action) => {
        state.checkingStatus = false;
        state.error = action.payload;
        state.isRegistered = false;
      })

      // Check Eligibility Only
      .addCase(checkEligibilityOnly.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkEligibilityOnly.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isEligible = action.payload?.isEligible || false;
        state.error = null;
      })
      .addCase(checkEligibilityOnly.rejected, (state, action) => {
        state.isLoading = false;
        state.isEligible = false;
        state.error = action.payload;
      });
  }
});

export const { resetRegistrationState, clearError } = voterRegistrationSlice.actions;

export default voterRegistrationSlice.reducer;