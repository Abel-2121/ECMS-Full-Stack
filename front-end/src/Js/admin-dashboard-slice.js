// Js/admin-dashboard-slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosPrivate from '../utils/axiosPrivate';

export const fetchAdminDashboard = createAsyncThunk(
  'adminDashboard/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosPrivate.get('/election-admin/dashboard/overview');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

const initialState = {
  dashboard: null,
  loading: false,
  error: null,
  lastUpdated: null
};

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default adminDashboardSlice.reducer;