// Js/dashboard-slice.js (updated)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService } from '../services/dashboardService';

// Async Thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getDashboardStats();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchPlatformSummary = createAsyncThunk(
  'dashboard/fetchPlatformSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getPlatformSummary();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch platform summary');
    }
  }
);

export const fetchUserGrowth = createAsyncThunk(
  'dashboard/fetchUserGrowth',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getUserGrowth();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user growth');
    }
  }
);

export const fetchElectionTrend = createAsyncThunk(
  'dashboard/fetchElectionTrend',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getElectionTrend();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch election trend');
    }
  }
);

export const fetchInstitutionActivity = createAsyncThunk(
  'dashboard/fetchInstitutionActivity',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getInstitutionActivity();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch institution activity');
    }
  }
);

export const fetchTopInstitutions = createAsyncThunk(
  'dashboard/fetchTopInstitutions',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getTopInstitutions();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top institutions');
    }
  }
);

export const fetchRecentActivities = createAsyncThunk(
  'dashboard/fetchRecentActivities',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getRecentActivities();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent activities');
    }
  }
);

export const updateLastUpdated = createAsyncThunk(
  'dashboard/updateLastUpdated',
  async () => {
    return new Date().toISOString();
  }
);

export const fetchSystemAnalytics = createAsyncThunk(
  'dashboard/fetchSystemAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      return await dashboardService.getSystemAnalytics();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
    }
  }
);
const initialState = {
  // Platform Summary
  platformSummary: {
    institutions: { total: 0, active: 0, pending: 0 },
    elections: { total: 0, active: 0, completed: 0, newThisMonth: 0 },
    users: { voters: 0, candidates: 0, admins: 0, newVotersThisMonth: 0 },
    votes: { total: 0, yesterday: 0 }
  },
  
  // User Growth Data
  userGrowth: {
    months: [],
    voterGrowth: [],
    candidateGrowth: []
  },
  
  // Election Trend
  electionTrend: {
    months: [],
    created: [],
    completed: []
  },
  
  // Institution Activity
  institutionActivity: {
    institutions: [],
    summary: { totalInstitutions: 0, totalElections: 0, totalVotes: 0, totalVoters: 0 }
  },
  
  // Top Institutions
  topInstitutions: [],
  
  // Recent Activities
  recentActivities: [],
  
  // UI State
  loading: false,
  error: null,
  lastUpdated: null,
  refreshing: false,
  analytics: null,
analyticsLoading: false,
};
// Js/dashboard-slice.js (add these)



// Add to initialState


// Add to extraReducers


const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Platform Summary
      .addCase(fetchPlatformSummary.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlatformSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.platformSummary = action.payload;
      })
      .addCase(fetchPlatformSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // User Growth
      .addCase(fetchUserGrowth.fulfilled, (state, action) => {
        state.userGrowth = action.payload;
      })
      
      // Election Trend
      .addCase(fetchElectionTrend.fulfilled, (state, action) => {
        state.electionTrend = action.payload;
      })
      
      // Institution Activity
      .addCase(fetchInstitutionActivity.fulfilled, (state, action) => {
        state.institutionActivity = action.payload;
      })
      
      // Top Institutions
      .addCase(fetchTopInstitutions.fulfilled, (state, action) => {
        state.topInstitutions = action.payload;
      })
      
      // Recent Activities
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.recentActivities = action.payload;
      })
      
      // Update Last Updated
      .addCase(updateLastUpdated.fulfilled, (state, action) => {
        state.lastUpdated = action.payload;
        state.refreshing = false;
      })
      .addCase(fetchSystemAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(fetchSystemAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchSystemAnalytics.rejected, (state, action) => {
        state.analyticsLoading = false;
        state.error = action.payload;
      })
  }
});

export const { clearError, setRefreshing } = dashboardSlice.actions;
export default dashboardSlice.reducer;