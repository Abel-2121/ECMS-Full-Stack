// Js/system-settings-slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosPrivate from '../utils/axiosPrivate';
import axios from 'axios';
import axiosPublic from '../utils/axiosPublic';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001/api';

// Public settings - no auth required
export const fetchPublicSettings = createAsyncThunk(
  'systemSettings/fetchPublic',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/system-settings`);

      console.log("FETCH SETTINGS ",response)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch public settings');
    }
  }
);

// Admin settings - requires auth
export const fetchSettings = createAsyncThunk(
  'systemSettings/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosPrivate.get('/system-settings/admin');
      return response.data.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

export const updateSettings = createAsyncThunk(
  'systemSettings/update',
  async (settings, { rejectWithValue }) => {
    try {
      const response = await axiosPrivate.patch('/system-settings', settings);
      return response.data.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
    }
  }
);

export const resetToDefault = createAsyncThunk(
  'systemSettings/reset',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosPrivate.post('/system-settings/reset');
      return response.data.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reset settings');
    }
  }
);

export const uploadHeroImage = createAsyncThunk(
  'systemSettings/uploadHeroImage',
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);
      
      const response = await axiosPrivate.post('/system-settings/upload-hero-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload image');
    }
  }
);

export const deleteHeroImage = createAsyncThunk(
  'systemSettings/deleteHeroImage',
  async (imageId, { rejectWithValue }) => {
    try {
      const response = await axiosPrivate.delete(`/system-settings/hero-image/${imageId}`);
      return { imageId, settings: response.data.data.settings };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete image');
    }
  }
);

export const setActiveHeroImage = createAsyncThunk(
  'systemSettings/setActiveHeroImage',
  async (imageId, { rejectWithValue }) => {
    try {
      const response = await axiosPrivate.patch(`/system-settings/hero-image/${imageId}/active`);
      return response.data.data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to set active image');
    }
  }
);

const initialState = {
  settings: null,
  publicSettings: null,
  loading: false,
  saving: false,
  uploading: false,
  error: null,
  success: false
};

const systemSettingsSlice = createSlice({
  name: 'systemSettings',
  initialState,
  reducers: {
    clearSuccess: (state) => {
      state.success = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch public settings
      .addCase(fetchPublicSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.publicSettings = action.payload;
      })
      .addCase(fetchPublicSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch admin settings
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update settings
      .addCase(updateSettings.pending, (state) => {
        state.saving = true;
        state.success = false;
        state.error = null;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.success = true;
        state.settings = action.payload;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // Reset to default
      .addCase(resetToDefault.pending, (state) => {
        state.saving = true;
      })
      .addCase(resetToDefault.fulfilled, (state, action) => {
        state.saving = false;
        state.success = true;
        state.settings = action.payload;
      })
      .addCase(resetToDefault.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // Upload hero image
      .addCase(uploadHeroImage.pending, (state) => {
        state.uploading = true;
      })
      .addCase(uploadHeroImage.fulfilled, (state, action) => {
        state.uploading = false;
        state.success = true;
        if (action.payload.settings) {
          state.settings = action.payload.settings;
        } else if (action.payload.images) {
          if (state.settings?.hero) {
            state.settings.hero.images = action.payload.images;
          }
        }
      })
      .addCase(uploadHeroImage.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload;
      })
      // Delete hero image
      .addCase(deleteHeroImage.fulfilled, (state, action) => {
        if (action.payload.settings) {
          state.settings = action.payload.settings;
        }
      })
      // Set active hero image
      .addCase(setActiveHeroImage.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
  }
});

export const { clearSuccess, clearError } = systemSettingsSlice.actions;
export default systemSettingsSlice.reducer;