// Js/institution-slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { institutionService } from '../services/institutionService';

// ==================== ASYNC THUNKS ====================

// Fetch all institutions
export const fetchInstitutions = createAsyncThunk(
  'institution/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      return await institutionService.getAllInstitutions(params);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch institutions');
    }
  }
);

// Fetch pending requests
export const fetchPendingRequests = createAsyncThunk(
  'institution/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      return await institutionService.getPendingRequests();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending requests');
    }
  }
);

// Create institution
export const createInstitution = createAsyncThunk(
  'institution/create',
  async (formData, { rejectWithValue }) => {
    try {
      return await institutionService.createInstitution(formData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create institution');
    }
  }
);

// Update institution (SuperAdmin)
export const updateInstitution = createAsyncThunk(
  'institution/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await institutionService.updateInstitution(id, formData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update institution');
    }
  }
);

// Delete institution
export const deleteInstitution = createAsyncThunk(
  'institution/delete',
  async (id, { rejectWithValue }) => {
    try {
      await institutionService.deleteInstitution(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete institution');
    }
  }
);

// Approve institution
export const approveInstitution = createAsyncThunk(
  'institution/approve',
  async ({ id, adminNotes }, { rejectWithValue }) => {
    try {
      return await institutionService.approveInstitution(id, adminNotes);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve institution');
    }
  }
);

// Reject institution
export const rejectInstitution = createAsyncThunk(
  'institution/reject',
  async ({ id, rejectionReason }, { rejectWithValue }) => {
    try {
      return await institutionService.rejectInstitution(id, rejectionReason);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject institution');
    }
  }
);

// Toggle status
export const toggleInstitutionStatus = createAsyncThunk(
  'institution/toggleStatus',
  async ({ id, currentStatus }, { rejectWithValue }) => {
    try {
      return await institutionService.toggleStatus(id, currentStatus);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle status');
    }
  }
);

// ✅ Get my institution (Election Admin)
export const getMyInstitution = createAsyncThunk(
  'institution/getMy',
  async (_, { rejectWithValue }) => {
    try {
      return await institutionService.getMyInstitution();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch institution');
    }
  }
);

// ✅ Update my institution (Election Admin)
export const updateMyInstitution = createAsyncThunk(
  'institution/updateMy',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      return await institutionService.updateMyInstitution(id, formData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update institution');
    }
  }
);

// Get institution by ID
export const getInstitutionById = createAsyncThunk(
  'institution/getById',
  async (id, { rejectWithValue }) => {
    try {
      return await institutionService.getInstitutionById(id);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch institution');
    }
  }
);

const initialState = {
  institutions: [],
  pendingRequests: [],
  loading: false,
  error: null,
  success: false,
  totalCount: 0,
  selectedInstitution: null
};

// ==================== SLICE ====================
const institutionSlice = createSlice({
  name: 'institution',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setSelectedInstitution: (state, action) => {
      state.selectedInstitution = action.payload;
    },
    clearSelectedInstitution: (state) => {
      state.selectedInstitution = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Institutions
      .addCase(fetchInstitutions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInstitutions.fulfilled, (state, action) => {
        state.loading = false;
        state.institutions = action.payload;
        state.totalCount = action.payload.length;
      })
      .addCase(fetchInstitutions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Pending Requests
      .addCase(fetchPendingRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingRequests = action.payload;
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Institution
      .addCase(createInstitution.fulfilled, (state, action) => {
        state.institutions.unshift(action.payload);
      })
      
      // Update Institution (SuperAdmin)
      .addCase(updateInstitution.fulfilled, (state, action) => {
        const index = state.institutions.findIndex(i => i._id === action.payload._id);
        if (index !== -1) {
          state.institutions[index] = action.payload;
        }
        const pendingIndex = state.pendingRequests.findIndex(i => i._id === action.payload._id);
        if (pendingIndex !== -1) {
          state.pendingRequests.splice(pendingIndex, 1);
        }
      })
      
      // Delete Institution
      .addCase(deleteInstitution.fulfilled, (state, action) => {
        state.institutions = state.institutions.filter(i => i._id !== action.payload);
        state.pendingRequests = state.pendingRequests.filter(i => i._id !== action.payload);
      })
      
      // Approve Institution
      .addCase(approveInstitution.fulfilled, (state, action) => {
        state.pendingRequests = state.pendingRequests.filter(i => i._id !== action.payload._id);
        state.institutions.unshift(action.payload);
      })
      
      // Reject Institution
      .addCase(rejectInstitution.fulfilled, (state, action) => {
        state.pendingRequests = state.pendingRequests.filter(i => i._id !== action.payload._id);
      })
      
      // Toggle Status
      .addCase(toggleInstitutionStatus.fulfilled, (state, action) => {
        const index = state.institutions.findIndex(i => i._id === action.payload._id);
        if (index !== -1) {
          state.institutions[index] = action.payload;
        }
      })
      
      // ✅ Get My Institution (Election Admin)
      .addCase(getMyInstitution.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(getMyInstitution.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInstitution = action.payload;
        state.success = false;
      })
      .addCase(getMyInstitution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // ✅ Update My Institution (Election Admin)
      .addCase(updateMyInstitution.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateMyInstitution.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInstitution = action.payload;
        state.success = true;
        
        // Also update in institutions array if exists
        const index = state.institutions.findIndex(i => i._id === action.payload._id);
        if (index !== -1) {
          state.institutions[index] = action.payload;
        }
      })
      .addCase(updateMyInstitution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // ✅ Get Institution By ID
      .addCase(getInstitutionById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getInstitutionById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedInstitution = action.payload;
      })
      .addCase(getInstitutionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearSuccess, setSelectedInstitution, clearSelectedInstitution } = institutionSlice.actions;
export default institutionSlice.reducer;