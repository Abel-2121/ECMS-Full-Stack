// Js/monitoring-slice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeElectionId: null,
  activeElection: null,
  statistics: null,
  voteCounts: null,
  recentVotes: [],
  loading: false,
  error: null,
  lastUpdated: null,
  isAutoRefreshing: true,
  refreshInterval: 10000, // 10 seconds
  filters: {
    positionId: 'all',
    department: 'all',
    year: 'all'
  },
  selectedPosition: null
};

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState,
  reducers: {
    setActiveElection: (state, action) => {
      state.activeElectionId = action.payload;
      state.activeElection = null;
      state.statistics = null;
      state.voteCounts = null;
      state.recentVotes = [];
      state.error = null;
    },
    setActiveElectionData: (state, action) => {
      state.activeElection = action.payload;
    },
    fetchDataStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess: (state, action) => {
      const { statistics, voteCounts, recentVotes } = action.payload;
      state.statistics = statistics;
      state.voteCounts = voteCounts;
      state.recentVotes = recentVotes;
      state.loading = false;
      state.lastUpdated = new Date().toISOString();
    },
    fetchDataFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    toggleAutoRefresh: (state) => {
      state.isAutoRefreshing = !state.isAutoRefreshing;
    },
    setRefreshInterval: (state, action) => {
      state.refreshInterval = action.payload;
    },
    setFilter: (state, action) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    clearFilters: (state) => {
      state.filters = {
        positionId: 'all',
        department: 'all',
        year: 'all'
      };
    },
    setSelectedPosition: (state, action) => {
      state.selectedPosition = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  setActiveElection,
  setActiveElectionData,
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
  toggleAutoRefresh,
  setRefreshInterval,
  setFilter,
  clearFilters,
  setSelectedPosition,
  clearError
} = monitoringSlice.actions;

export default monitoringSlice.reducer;