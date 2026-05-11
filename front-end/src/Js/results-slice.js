// Js/results-slice.js - FIXED
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { resultService } from '../services/resultsService';

export const fetchPublicResults = createAsyncThunk(
  'results/fetchPublic',
  async (electionId, { rejectWithValue }) => {
    try {
      return await resultService.getPublicResults(electionId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch results');
    }
  }
);

export const fetchDetailedResults = createAsyncThunk(
  'results/fetchDetailed',
  async (electionId, { rejectWithValue }) => {
    try {
      const response = await resultService.getDetailedResults(electionId);
      console.log('fetchDetailedResults response:', response);
      // Return the data from response.data.result
      return response.data?.result || response;
    } catch (error) {
      console.error('fetchDetailedResults error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch results');
    }
  }
);

export const resolveTie = createAsyncThunk(
  'results/resolveTie',
  async ({ electionId, positionId }, { rejectWithValue }) => {
    try {
      const response = await resultService.resolveTie(electionId, positionId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to resolve tie');
    }
  }
);

export const publishResults = createAsyncThunk(
  'results/publish',
  async (electionId, { rejectWithValue }) => {
    try {
      const response = await resultService.publishResults(electionId);
      return response.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to publish results');
    }
  }
);

export const fetchAllResults = createAsyncThunk(
  'results/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await resultService.getAllResults();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch results list');
    }
  }
);

const initialState = {
  currentResults: null,
  publishedResults: [],
  loading: false,
  error: null,
  publishLoading: false,
  publishSuccess: false,
  isPublished: false
};

const resultsSlice = createSlice({
  name: 'results',
  initialState,
  reducers: {
    clearResults: (state) => {
      state.currentResults = null;
      state.isPublished = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPublishSuccess: (state) => {
      state.publishSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Public Results
      .addCase(fetchPublicResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicResults.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResults = action.payload;
        state.isPublished = action.payload?.isPublished || false;
      })
      .addCase(fetchPublicResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ✅ FIXED: Fetch Detailed Results
      .addCase(fetchDetailedResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDetailedResults.fulfilled, (state, action) => {
        state.loading = false;
        // Store the results directly
        state.currentResults = action.payload;
        state.isPublished = action.payload?.isPublished || false;
       
      })
      .addCase(fetchDetailedResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
       
      })
      
      // Resolve Tie
      .addCase(resolveTie.pending, (state) => {
        state.error = null;
      })
      .addCase(resolveTie.fulfilled, (state, action) => {
        state.currentResults = action.payload.result;
      })
      .addCase(resolveTie.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Publish Results
      .addCase(publishResults.pending, (state) => {
        state.publishLoading = true;
        state.error = null;
      })
      .addCase(publishResults.fulfilled, (state, action) => {
        state.publishLoading = false;
        state.publishSuccess = true;
        state.currentResults = action.payload;
        state.isPublished = true;
      })
      .addCase(publishResults.rejected, (state, action) => {
        state.publishLoading = false;
        state.error = action.payload;
      })
      
      // Fetch All Results
      .addCase(fetchAllResults.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllResults.fulfilled, (state, action) => {
        state.loading = false;
        state.publishedResults = action.payload;
      })
      .addCase(fetchAllResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearResults, clearError, clearPublishSuccess } = resultsSlice.actions;
export default resultsSlice.reducer;