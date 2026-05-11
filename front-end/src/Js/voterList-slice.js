// Js/voterList-slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { voterListService } from '../services/voterListService';

// Async Thunks
export const uploadVoterList = createAsyncThunk(
  'voterList/upload',
  async ({ electionId, file }, { rejectWithValue }) => {
    try {
      const response = await voterListService.uploadVoterList(electionId, file);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

export const fetchVoterDetails = createAsyncThunk(
  'voterList/fetchDetails',
  async ({ electionId, page, limit, search }, { rejectWithValue }) => {
    try {
      const response = await voterListService.getVoterDetails(electionId, page, limit, search);

      return response;
    } catch (error) {
      console.error('API Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch');
    }
  }
);

export const addVoter = createAsyncThunk(
  'voterList/add',
  async ({ electionId, voterData }, { rejectWithValue }) => {
    try {
      return await voterListService.addVoter(electionId, voterData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add voter');
    }
  }
);

export const updateVoter = createAsyncThunk(
  'voterList/update',
  async ({ electionId, voterId, voterData }, { rejectWithValue }) => {
    try {
      return await voterListService.updateVoter(electionId, voterId, voterData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update voter');
    }
  }
);

export const deleteVoter = createAsyncThunk(
  'voterList/delete',
  async ({ electionId, voterId }, { rejectWithValue }) => {
    try {
      await voterListService.deleteVoter(electionId, voterId);
      return voterId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete voter');
    }
  }
);

export const deleteVoterList = createAsyncThunk(
  'voterList/deleteList',
  async (electionId, { rejectWithValue }) => {
    try {
      await voterListService.deleteVoterList(electionId);
      return electionId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete list');
    }
  }
);

// Initial State
const initialState = {
  voters: [],
  summary: null,
  loading: false,
  error: null,
  uploadStatus: 'idle',
  validRecordsPreview: [],
  invalidRecordsPreview: [],
  totalRecords: 0,
  currentPage: 1,
  totalPages: 0,
  limit: 8,
  searchTerm: ''
};

// Slice
const voterListSlice = createSlice({
  name: 'voterList',
  initialState,
  reducers: {
    setPreviewData: (state, action) => {
      state.validRecordsPreview = action.payload.valid;
      state.invalidRecordsPreview = action.payload.invalid;
      state.uploadStatus = 'idle';
      state.error = null;
    },
    clearPreviewData: (state) => {
      state.validRecordsPreview = [];
      state.invalidRecordsPreview = [];
      state.uploadStatus = 'idle';
      state.error = null;
    },
    clearVoters: (state) => {
      state.voters = [];
      state.summary = null;
      state.uploadStatus = 'idle';
      state.error = null;
      state.totalRecords = 0;
      state.totalPages = 0;
      state.currentPage = 1;
    },
    resetUploadStatus: (state) => {
      state.uploadStatus = 'idle';
      state.loading = false;
      state.error = null;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
      state.currentPage = 1;
    },
    // ✅ ADD THIS - Clear error from Redux state
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Upload
      .addCase(uploadVoterList.pending, (state) => {
        state.loading = true;
        state.uploadStatus = 'loading';
        state.error = null;
      })
      .addCase(uploadVoterList.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadStatus = 'success';
        state.summary = action.payload.summary;
        state.totalRecords = action.payload.summary?.total || 0;
        state.totalPages = Math.ceil(state.totalRecords / state.limit);
      })
      .addCase(uploadVoterList.rejected, (state, action) => {
        state.loading = false;
        state.uploadStatus = 'failed';
        state.error = action.payload;
      })
      
      // Fetch Voter Details
      .addCase(fetchVoterDetails.pending, (state) => {
        state.loading = true;
        state.error = null; // ✅ Clear previous error
      })
      .addCase(fetchVoterDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null; // ✅ Clear error on success
        const responseData = action.payload;
        
        console.log('Processing response:', responseData);
        
        if (responseData && responseData.status === 'success') {
          state.voters = responseData.data?.voters || [];
          state.totalRecords = responseData.total || 0;
          state.currentPage = responseData.page || 1;
          state.limit = responseData.limit || state.limit;
          state.totalPages = Math.ceil(state.totalRecords / state.limit);
        } else if (responseData && responseData.voters) {
          state.voters = responseData.voters;
          state.totalRecords = responseData.total || responseData.voters.length;
          state.currentPage = responseData.page || 1;
          state.totalPages = Math.ceil(state.totalRecords / state.limit);
        } else {
          state.voters = [];
          state.totalRecords = 0;
          state.totalPages = 0;
        }
      })
      .addCase(fetchVoterDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.voters = [];
        state.totalRecords = 0;
        state.totalPages = 0;
      })
      
      // Add Voter
      .addCase(addVoter.pending, (state) => {
        state.error = null; // ✅ Clear previous error
      })
      .addCase(addVoter.fulfilled, (state, action) => {
        state.error = null; // ✅ Clear error on success
        state.voters.unshift(action.payload);
        state.totalRecords++;
        state.totalPages = Math.ceil(state.totalRecords / state.limit);
      })
      .addCase(addVoter.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Update Voter
      .addCase(updateVoter.pending, (state) => {
        state.error = null; // ✅ Clear previous error
      })
      .addCase(updateVoter.fulfilled, (state, action) => {
        state.error = null; // ✅ Clear error on success
        const index = state.voters.findIndex(v => v._id === action.payload._id);
        if (index !== -1) {
          state.voters[index] = action.payload;
        }
      })
      .addCase(updateVoter.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Delete Voter
      .addCase(deleteVoter.pending, (state) => {
        state.error = null; // ✅ Clear previous error
      })
      .addCase(deleteVoter.fulfilled, (state, action) => {
        state.error = null; // ✅ Clear error on success
        state.voters = state.voters.filter(v => v._id !== action.payload);
        state.totalRecords--;
        state.totalPages = Math.ceil(state.totalRecords / state.limit);
        if (state.voters.length === 0 && state.currentPage > 1) {
          state.currentPage--;
        }
      })
      .addCase(deleteVoter.rejected, (state, action) => {
        state.error = action.payload;
      })
      
      // Delete Entire List
      .addCase(deleteVoterList.pending, (state) => {
        state.error = null; // ✅ Clear previous error
      })
      .addCase(deleteVoterList.fulfilled, (state) => {
        state.error = null; // ✅ Clear error on success
        state.voters = [];
        state.totalRecords = 0;
        state.totalPages = 0;
        state.currentPage = 1;
        state.summary = null;
      })
      .addCase(deleteVoterList.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { 
  setPreviewData, 
  clearPreviewData, 
  clearVoters,
  resetUploadStatus,
  setSearchTerm,
  setPage,
  setLimit,
  clearError  // ✅ EXPORT clearError
} = voterListSlice.actions;

export default voterListSlice.reducer;