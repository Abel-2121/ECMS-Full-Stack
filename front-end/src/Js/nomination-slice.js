// Js/nomination-slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { candidateService } from '../services/candidateService';

// ==================== ASYNC THUNKS ====================

// Fetch nominations by election (Admin)
export const fetchNominationsByElection = createAsyncThunk(
  'nomination/fetchByElection',
  async ({ electionId, status, positionId, page, limit, search }, { rejectWithValue }) => {
    try {
      const params = { status, positionId, page, limit, search };
      const result = await candidateService.getNominationsByElection(electionId, params);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch nominations');
    }
  }
);

// Fetch all candidates (Admin) - with filters
export const fetchAllCandidates = createAsyncThunk(
  'nomination/fetchAllCandidates',
  async ({ electionId, status, positionId, page, limit, search }, { rejectWithValue }) => {
    try {
      const params = { electionId, status, positionId, page, limit, search };
      const result = await candidateService.getAllCandidates(params);
      return result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch candidates');
    }
  }
);

// Fetch candidate statistics (Admin)
export const fetchCandidateStats = createAsyncThunk(
  'nomination/fetchStats',
  async (electionId, { rejectWithValue }) => {
    try {
      const stats = await candidateService.getCandidateStats(electionId);
      return stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

// Fetch my nominations (Candidate)
export const fetchMyNominations = createAsyncThunk(
  'nomination/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      return await candidateService.getMyNominations();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch nominations');
    }
  }
);

// Fetch nomination by ID (Candidate)
export const fetchNominationById = createAsyncThunk(
  'nomination/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await candidateService.getNominationById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch nomination');
    }
  }
);

// Fetch nomination by ID (Admin)
export const fetchNominationByIdAdmin = createAsyncThunk(
  'nomination/fetchByIdAdmin',
  async (id, { rejectWithValue }) => {
    try {
      return await candidateService.getNominationByIdAdmin(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch nomination');
    }
  }
);

// Check if user has nomination for an election
export const checkHasNomination = createAsyncThunk(
  'nomination/checkHasNomination',
  async (electionId, { rejectWithValue }) => {
    try {
      const response = await candidateService.hasNomination(electionId);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check nomination status');
    }
  }
);

// Submit nomination (Candidate)
export const submitNomination = createAsyncThunk(
  'nomination/submit',
  async (nominationData, { rejectWithValue }) => {
    try {
      return await candidateService.submitNomination(nominationData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit nomination');
    }
  }
);

// Approve nomination (Admin)
export const approveNomination = createAsyncThunk(
  'nomination/approve',
  async ({ id, adminComments, ballotPosition }, { rejectWithValue }) => {
    try {
      return await candidateService.approveNomination(id, { adminComments, ballotPosition });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve nomination');
    }
  }
);

// Reject nomination (Admin)
export const rejectNomination = createAsyncThunk(
  'nomination/reject',
  async ({ id, rejectionReason, adminComments }, { rejectWithValue }) => {
    try {
      return await candidateService.rejectNomination(id, { rejectionReason, adminComments });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject nomination');
    }
  }
);

// Update candidate (Admin)
export const updateCandidate = createAsyncThunk(
  'nomination/updateCandidate',
  async ({ id, ballotPosition, adminComments }, { rejectWithValue }) => {
    try {
      return await candidateService.updateCandidate(id, { ballotPosition, adminComments });
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update candidate');
    }
  }
);

// Delete candidate (Admin)
export const deleteCandidate = createAsyncThunk(
  'nomination/deleteCandidate',
  async (id, { rejectWithValue }) => {
    try {
      await candidateService.deleteCandidate(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete candidate');
    }
  }
);

// Bulk approve nominations (Admin)
export const bulkApproveNominations = createAsyncThunk(
  'nomination/bulkApprove',
  async ({ electionId, nominationIds }, { rejectWithValue }) => {
    try {
      return await candidateService.bulkApproveNominations(electionId, nominationIds);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to bulk approve');
    }
  }
);

// Withdraw nomination (Candidate)
export const withdrawNomination = createAsyncThunk(
  'nomination/withdraw',
  async (id, { rejectWithValue }) => {
    try {
      return await candidateService.withdrawNomination(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to withdraw nomination');
    }
  }
);

// Request appeal (Candidate)
export const requestAppeal = createAsyncThunk(
  'nomination/appeal',
  async ({ id, appealMessage }, { rejectWithValue }) => {
    try {
      return await candidateService.requestAppeal(id, appealMessage);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit appeal');
    }
  }
);

// Batch check nomination status
export const batchCheckNomination = createAsyncThunk(
  'nomination/batchCheck',
  async (electionIds, { rejectWithValue }) => {
    try {
      const statusMap = await candidateService.batchNominationStatus(electionIds);
      return statusMap;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check nomination status');
    }
  },
);// Add this thunk to your nomination-slice.js

// Fetch complete candidate history (dashboard)
export const fetchCandidateHistory = createAsyncThunk(
  'nomination/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      return await candidateService.getCandidateHistory();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch candidate history');
    }
  }
);

// ==================== INITIAL STATE ====================
const initialState = {
  nominations: [],
  candidates: [],
  currentNomination: null,
  currentCandidate: null,
  hasNominationForElection: false,
  nominationStatusForElection: null,
  checkingNomination: false,
  loading: false,
  error: null,
  success: false,
  totalCount: 0,
  currentPage: 1,
  totalPages: 1,
  limit: 20,
  filterStatus: 'all',
  filterPosition: '',
  searchTerm: '',
  stats: {
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    withdrawn: 0
  }
};

// ==================== SLICE ====================
const nominationSlice = createSlice({
  name: 'nomination',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCurrentNomination: (state) => {
      state.currentNomination = null;
    },
    clearCurrentCandidate: (state) => {
      state.currentCandidate = null;
    },
    setFilterStatus: (state, action) => {
      state.filterStatus = action.payload;
      state.currentPage = 1;
    },
    setFilterPosition: (state, action) => {
      state.filterPosition = action.payload;
      state.currentPage = 1;
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
    updateLocalNominationStatus: (state, action) => {
      const { id, status, rejectionReason, ballotPosition, adminComments } = action.payload;
      const nomination = state.nominations.find(n => n._id === id);
      if (nomination) {
        nomination.status = status;
        if (rejectionReason) nomination.rejectionReason = rejectionReason;
        if (ballotPosition) nomination.ballotPosition = ballotPosition;
        if (adminComments) nomination.adminComments = adminComments;
      }
      if (state.currentNomination && state.currentNomination._id === id) {
        state.currentNomination.status = status;
        if (rejectionReason) state.currentNomination.rejectionReason = rejectionReason;
        if (ballotPosition) state.currentNomination.ballotPosition = ballotPosition;
        if (adminComments) state.currentNomination.adminComments = adminComments;
      }
      // Update stats
      const oldStatus = nomination?.status;
      if (oldStatus && oldStatus !== status) {
        if (oldStatus === 'pending') state.stats.pending--;
        if (oldStatus === 'approved') state.stats.approved--;
        if (oldStatus === 'rejected') state.stats.rejected--;
        if (oldStatus === 'withdrawn') state.stats.withdrawn--;
        if (status === 'pending') state.stats.pending++;
        if (status === 'approved') state.stats.approved++;
        if (status === 'rejected') state.stats.rejected++;
        if (status === 'withdrawn') state.stats.withdrawn++;
      }
    },
    addNominationLocal: (state, action) => {
      state.nominations.unshift(action.payload);
      state.stats.total++;
      state.stats.pending++;
    },
    removeNominationLocal: (state, action) => {
      const removed = state.nominations.find(n => n._id === action.payload);
      if (removed) {
        state.nominations = state.nominations.filter(n => n._id !== action.payload);
        state.stats.total--;
        if (removed.status === 'pending') state.stats.pending--;
        if (removed.status === 'approved') state.stats.approved--;
        if (removed.status === 'rejected') state.stats.rejected--;
        if (removed.status === 'withdrawn') state.stats.withdrawn--;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // ==================== FETCH NOMINATIONS BY ELECTION ====================
      .addCase(fetchNominationsByElection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNominationsByElection.fulfilled, (state, action) => {
        state.loading = false;
        state.nominations = action.payload.nominations || [];
        state.totalCount = action.payload.total || 0;
        state.currentPage = action.payload.page || 1;
        state.totalPages = Math.ceil((action.payload.total || 0) / (action.payload.limit || 20));
      })
      .addCase(fetchNominationsByElection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== FETCH ALL CANDIDATES ====================
      .addCase(fetchAllCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.candidates = action.payload.data?.candidates || [];
        state.totalCount = action.payload.total || 0;
        state.currentPage = action.payload.page || 1;
        state.totalPages = action.payload.totalPages || 1;
      })
      .addCase(fetchAllCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== FETCH CANDIDATE STATS ====================
      .addCase(fetchCandidateStats.fulfilled, (state, action) => {
        state.stats = action.payload || state.stats;
      })
      // Add inside extraReducers builder

      // ==================== FETCH CANDIDATE HISTORY ====================
      .addCase(fetchCandidateHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCandidateHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.historyData = action.payload;
      })
      .addCase(fetchCandidateHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ==================== FETCH MY NOMINATIONS ====================
      .addCase(fetchMyNominations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyNominations.fulfilled, (state, action) => {
        state.loading = false;
        state.nominations = action.payload || [];
      })
      .addCase(fetchMyNominations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== FETCH NOMINATION BY ID ====================
      .addCase(fetchNominationById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNominationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentNomination = action.payload;
      })
      .addCase(fetchNominationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== CHECK HAS NOMINATION ====================
      .addCase(checkHasNomination.pending, (state) => {
        state.checkingNomination = true;
        state.error = null;
      })
      .addCase(checkHasNomination.fulfilled, (state, action) => {
        state.checkingNomination = false;
        state.hasNominationForElection = action.payload.hasNomination;
        state.nominationStatusForElection = action.payload.status;
      })
      .addCase(checkHasNomination.rejected, (state, action) => {
        state.checkingNomination = false;
        state.error = action.payload;
        state.hasNominationForElection = false;
      })

      // ==================== SUBMIT NOMINATION ====================
      .addCase(submitNomination.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(submitNomination.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.currentNomination = action.payload;
        state.nominations.unshift(action.payload);
        state.stats.total++;
        state.stats.pending++;
      })
      .addCase(submitNomination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // ==================== APPROVE NOMINATION ====================
      .addCase(approveNomination.pending, (state) => {
        state.loading = true;
      })
      .addCase(approveNomination.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.nominations.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          const oldStatus = state.nominations[index].status;
          if (oldStatus === 'pending') state.stats.pending--;
          state.stats.approved++;
          state.nominations[index] = action.payload;
        }
        if (state.currentNomination?._id === action.payload._id) {
          state.currentNomination = action.payload;
        }
      })
      .addCase(approveNomination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== REJECT NOMINATION ====================
      .addCase(rejectNomination.pending, (state) => {
        state.loading = true;
      })
      .addCase(rejectNomination.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.nominations.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          const oldStatus = state.nominations[index].status;
          if (oldStatus === 'pending') state.stats.pending--;
          state.stats.rejected++;
          state.nominations[index] = action.payload;
        }
        if (state.currentNomination?._id === action.payload._id) {
          state.currentNomination = action.payload;
        }
      })
      .addCase(rejectNomination.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== UPDATE CANDIDATE ====================
      .addCase(updateCandidate.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCandidate.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.nominations.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          state.nominations[index] = action.payload;
        }
        if (state.currentNomination?._id === action.payload._id) {
          state.currentNomination = action.payload;
        }
      })
      .addCase(updateCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== DELETE CANDIDATE ====================
      .addCase(deleteCandidate.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCandidate.fulfilled, (state, action) => {
        state.loading = false;
        const removed = state.nominations.find(n => n._id === action.payload);
        if (removed) {
          state.nominations = state.nominations.filter(n => n._id !== action.payload);
          state.stats.total--;
          if (removed.status === 'pending') state.stats.pending--;
          if (removed.status === 'approved') state.stats.approved--;
          if (removed.status === 'rejected') state.stats.rejected--;
        }
      })
      .addCase(deleteCandidate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ==================== WITHDRAW NOMINATION ====================
      .addCase(withdrawNomination.fulfilled, (state, action) => {
        const index = state.nominations.findIndex(n => n._id === action.payload._id);
        if (index !== -1) {
          const oldStatus = state.nominations[index].status;
          if (oldStatus === 'pending') state.stats.pending--;
          state.stats.withdrawn++;
          state.nominations[index] = action.payload;
        }
      });
  }
});

// ==================== EXPORTS ====================
export const { 
  clearError, 
  clearSuccess,
  clearCurrentNomination,
  clearCurrentCandidate,
  setFilterStatus,
  setFilterPosition,
  setSearchTerm,
  setPage,
  setLimit,
  updateLocalNominationStatus,
  addNominationLocal,
  removeNominationLocal
} = nominationSlice.actions;

export default nominationSlice.reducer;