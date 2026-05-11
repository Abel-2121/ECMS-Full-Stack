// Js/election-slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosPrivate from '../utils/axiosPrivate';
import { electionService } from '../services/electionService';

// API URL
const API_URL = '/election';

// ==================== ASYNC THUNKS ====================

// Create election
export const createElection = createAsyncThunk(
  'election/create',
  async (electionData, { rejectWithValue }) => {
    try {
      const response = await axiosPrivate.post(API_URL, electionData);
      return response.data.data.election;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create election');
    }
  }
);

// Fetch elections by institution
export const fetchElectionsByInstitution = createAsyncThunk(
  'election/fetchByInstitution',
  async (institutionId, { rejectWithValue }) => {
    try {
      const response = await axiosPrivate.get(`${API_URL}?institutionId=${institutionId}`);
      return response.data.data.elections;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch elections');
    }
  }
);

// Fetch all elections
export const fetchAllElections = createAsyncThunk(
  'election/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosPrivate.get(API_URL, { params });
      return response.data.data.elections;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch elections');
    }
  }
);

// Fetch election by ID
export const fetchElectionById = createAsyncThunk(
  'election/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosPrivate.get(`${API_URL}/${id}`);
      return response.data.data.election;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch election');
    }
  }
);

// Update election
export const updateElection = createAsyncThunk(
  'election/update',
  async ({ id, electionData }, { rejectWithValue }) => {
    try {
      const response = await axiosPrivate.patch(`${API_URL}/${id}`, electionData);
      return response.data.data.election;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update election');
    }
  }
);

// Delete election
export const deleteElection = createAsyncThunk(
  'election/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosPrivate.delete(`${API_URL}/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete election');
    }
  }
);

// Upload voter list
export const uploadVoterList = createAsyncThunk(
  'election/uploadVoterList',
  async ({ electionId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('voterList', file);
      const response = await axiosPrivate.post(`${API_URL}/${electionId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload voter list');
    }
  }
);

// Publish results
export const publishResults = createAsyncThunk(
  'election/publishResults',
  async (electionId, { rejectWithValue }) => {
    try {
      const response = await axiosPrivate.post(`/result/election/${electionId}/publish`);
      return response.data.data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to publish results');
    }
  }
);

// ==================== INITIAL STATE ====================
const initialState = {
  elections: [],
  currentElection: null,
  loading: false,
  error: null,
  success: false,
  totalCount: 0,
  uploadProgress: 0,
  publishProgress: false
};

// ==================== SLICE ====================
const electionSlice = createSlice({
  name: 'election',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCurrentElection: (state) => {
      state.currentElection = null;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    resetUploadProgress: (state) => {
      state.uploadProgress = 0;
    },
    // Manual actions for direct state updates (for components that don't use thunks)
    createElectionPending: (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    },
    createElectionSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      state.elections.unshift(action.payload);
    },
    createElectionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.success = false;
    },
    updateElectionPending: (state) => {
      state.loading = true;
      state.error = null;
    },
    updateElectionSuccess: (state, action) => {
      state.loading = false;
      state.success = true;
      const index = state.elections.findIndex(e => e._id === action.payload._id);
      if (index !== -1) {
        state.elections[index] = action.payload;
      }
      if (state.currentElection?._id === action.payload._id) {
        state.currentElection = action.payload;
      }
    },
    updateElectionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteElectionPending: (state) => {
      state.loading = true;
    },
    deleteElectionSuccess: (state, action) => {
      state.loading = false;
      state.elections = state.elections.filter(e => e._id !== action.payload);
    },
    deleteElectionFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Election
      .addCase(createElection.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createElection.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.elections.unshift(action.payload);
      })
      .addCase(createElection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Fetch Elections by Institution
      .addCase(fetchElectionsByInstitution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchElectionsByInstitution.fulfilled, (state, action) => {
        state.loading = false;
        state.elections = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchElectionsByInstitution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch All Elections
      .addCase(fetchAllElections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllElections.fulfilled, (state, action) => {
        state.loading = false;
        state.elections = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchAllElections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Election by ID
      .addCase(fetchElectionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchElectionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentElection = action.payload;
      })
      .addCase(fetchElectionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Election
      .addCase(updateElection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateElection.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.elections.findIndex(e => e._id === action.payload._id);
        if (index !== -1) {
          state.elections[index] = action.payload;
        }
        if (state.currentElection?._id === action.payload._id) {
          state.currentElection = action.payload;
        }
      })
      .addCase(updateElection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Election
      .addCase(deleteElection.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteElection.fulfilled, (state, action) => {
        state.loading = false;
        state.elections = state.elections.filter(e => e._id !== action.payload);
      })
      .addCase(deleteElection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Upload Voter List
      .addCase(uploadVoterList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadVoterList.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(uploadVoterList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Publish Results
      .addCase(publishResults.pending, (state) => {
        state.loading = true;
        state.publishProgress = true;
      })
      .addCase(publishResults.fulfilled, (state, action) => {
        state.loading = false;
        state.publishProgress = false;
        state.success = true;
        if (state.currentElection) {
          state.currentElection.status = 'results_published';
        }
      })
      .addCase(publishResults.rejected, (state, action) => {
        state.loading = false;
        state.publishProgress = false;
        state.error = action.payload;
      });
  }
});

// ==================== EXPORTS ====================
export const {
  clearError,
  clearSuccess,
  clearCurrentElection,
  setUploadProgress,
  resetUploadProgress,
  createElectionPending,
  createElectionSuccess,
  createElectionFailure,
  updateElectionPending,
  updateElectionSuccess,
  updateElectionFailure,
  deleteElectionPending,
  deleteElectionSuccess,
  deleteElectionFailure
} = electionSlice.actions;

export default electionSlice.reducer;