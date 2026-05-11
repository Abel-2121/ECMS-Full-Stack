// frontend/src/js/admin-slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminService } from '../services/adminService';

// ==================== ASYNC THUNKS ====================

// Fetch all admins
export const fetchAdmins = createAsyncThunk(
  'admin/fetchAdmins',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getAllAdmins();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch admins');
    }
  }
);

// Fetch admin by ID
export const fetchAdminById = createAsyncThunk(
  'admin/fetchAdminById',
  async (adminId, { rejectWithValue }) => {
    try {
      const response = await adminService.getAdminById(adminId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch admin');
    }
  }
);

// Create new admin
export const createAdmin = createAsyncThunk(
  'admin/createAdmin',
  async (adminData, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminService.createAdmin(adminData);
      // Send welcome email after creation
      if (response.data) {
        await adminService.sendWelcomeEmail(
          adminData.email,
          `${adminData.firstName} ${adminData.lastName}`,
          adminData.password
        );
      }
      // Refresh admin list
      await dispatch(fetchAdmins());
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create admin');
    }
  }
);

// Update admin
export const updateAdmin = createAsyncThunk(
  'admin/updateAdmin',
  async ({ adminId, adminData }, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminService.updateAdmin(adminId, adminData);
      await dispatch(fetchAdmins());
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update admin');
    }
  }
);

// Toggle admin status
export const toggleAdminStatus = createAsyncThunk(
  'admin/toggleAdminStatus',
  async (adminId, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminService.toggleAdminStatus(adminId);
      await dispatch(fetchAdmins());
      return { id: adminId, status: response.data?.status };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to toggle admin status');
    }
  }
);

// Delete admin
export const deleteAdmin = createAsyncThunk(
  'admin/deleteAdmin',
  async (adminId, { rejectWithValue, dispatch }) => {
    try {
      const response = await adminService.deleteAdmin(adminId);
      await dispatch(fetchAdmins());
      return { id: adminId, success: true };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete admin');
    }
  }
);

// Fetch admins by institution
export const fetchAdminsByInstitution = createAsyncThunk(
  'admin/fetchAdminsByInstitution',
  async (institutionId, { rejectWithValue }) => {
    try {
      const response = await adminService.getAdminsByInstitution(institutionId);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch institution admins');
    }
  }
);

// Resend invitation
export const resendInvitation = createAsyncThunk(
  'admin/resendInvitation',
  async (adminId, { rejectWithValue }) => {
    try {
      const response = await adminService.resendInvitation(adminId);
      return { id: adminId, success: true };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to resend invitation');
    }
  }
);

// Fetch admin statistics
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchAdminStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminService.getAdminStats();
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch admin stats');
    }
  }
);

// ==================== INITIAL STATE ====================

const initialState = {
  admins: [],
  currentAdmin: null,
  institutionAdmins: [],
  stats: {
    total: 0,
    active: 0,
    inactive: 0,
    superAdmins: 0,
    electionAdmins: 0
  },
  loading: false,
  error: null,
  success: false
};

// ==================== SLICE ====================

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearCurrentAdmin: (state) => {
      state.currentAdmin = null;
    },
    clearInstitutionAdmins: (state) => {
      state.institutionAdmins = [];
    },
    // Local actions for optimistic updates
    addAdminLocal: (state, action) => {
      state.admins.unshift(action.payload);
    },
    updateAdminLocal: (state, action) => {
      const index = state.admins.findIndex(admin => admin.id === action.payload.id);
      if (index !== -1) {
        state.admins[index] = { ...state.admins[index], ...action.payload };
      }
    },
    toggleAdminStatusLocal: (state, action) => {
      const admin = state.admins.find(a => a.id === action.payload);
      if (admin) {
        admin.status = admin.status === 'Active' ? 'Inactive' : 'Active';
      }
    },
    removeAdminLocal: (state, action) => {
      state.admins = state.admins.filter(admin => admin.id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // ========== FETCH ALL ADMINS ==========
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload || [];
        // Update stats
        state.stats.total = state.admins.length;
        state.stats.active = state.admins.filter(a => a.status === 'Active').length;
        state.stats.inactive = state.admins.filter(a => a.status === 'Inactive').length;
        state.stats.superAdmins = state.admins.filter(a => a.role === 'superAdmin').length;
        state.stats.electionAdmins = state.admins.filter(a => a.role === 'electionAdmin').length;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch admins';
      })

      // ========== FETCH ADMIN BY ID ==========
      .addCase(fetchAdminById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAdmin = action.payload;
      })
      .addCase(fetchAdminById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch admin';
      })

      // ========== CREATE ADMIN ==========
      .addCase(createAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        // Add to list if not already there
        if (action.payload && !state.admins.find(a => a.id === action.payload.id)) {
          state.admins.unshift(action.payload);
          state.stats.total++;
          if (action.payload.status === 'Active') state.stats.active++;
          else state.stats.inactive++;
          if (action.payload.role === 'superAdmin') state.stats.superAdmins++;
          else if (action.payload.role === 'electionAdmin') state.stats.electionAdmins++;
        }
      })
      .addCase(createAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create admin';
      })

      // ========== UPDATE ADMIN ==========
      .addCase(updateAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        const index = state.admins.findIndex(admin => admin.id === action.payload.id);
        if (index !== -1) {
          state.admins[index] = { ...state.admins[index], ...action.payload };
        }
      })
      .addCase(updateAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update admin';
      })

      // ========== TOGGLE ADMIN STATUS ==========
      .addCase(toggleAdminStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleAdminStatus.fulfilled, (state, action) => {
        state.loading = false;
        const admin = state.admins.find(a => a.id === action.payload.id);
        if (admin) {
          const oldStatus = admin.status;
          admin.status = action.payload.status;
          if (oldStatus === 'Active') {
            state.stats.active--;
            state.stats.inactive++;
          } else {
            state.stats.active++;
            state.stats.inactive--;
          }
        }
      })
      .addCase(toggleAdminStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to toggle admin status';
      })

      // ========== DELETE ADMIN ==========
      .addCase(deleteAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdmin.fulfilled, (state, action) => {
        state.loading = false;
        const deletedAdmin = state.admins.find(a => a.id === action.payload.id);
        if (deletedAdmin) {
          state.admins = state.admins.filter(admin => admin.id !== action.payload.id);
          state.stats.total--;
          if (deletedAdmin.status === 'Active') state.stats.active--;
          else state.stats.inactive--;
          if (deletedAdmin.role === 'superAdmin') state.stats.superAdmins--;
          else if (deletedAdmin.role === 'electionAdmin') state.stats.electionAdmins--;
        }
      })
      .addCase(deleteAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete admin';
      })

      // ========== FETCH ADMINS BY INSTITUTION ==========
      .addCase(fetchAdminsByInstitution.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminsByInstitution.fulfilled, (state, action) => {
        state.loading = false;
        state.institutionAdmins = action.payload || [];
      })
      .addCase(fetchAdminsByInstitution.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch institution admins';
      })

      // ========== RESEND INVITATION ==========
      .addCase(resendInvitation.fulfilled, (state, action) => {
        state.success = true;
      })
      .addCase(resendInvitation.rejected, (state, action) => {
        state.error = action.payload || 'Failed to resend invitation';
      })

      // ========== FETCH ADMIN STATS ==========
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.stats = { ...state.stats, ...action.payload };
      });
  }
});

// ==================== EXPORTS ====================
export const {
  clearError,
  clearSuccess,
  clearCurrentAdmin,
  clearInstitutionAdmins,
  addAdminLocal,
  updateAdminLocal,
  toggleAdminStatusLocal,
  removeAdminLocal
} = adminSlice.actions;

export default adminSlice.reducer;