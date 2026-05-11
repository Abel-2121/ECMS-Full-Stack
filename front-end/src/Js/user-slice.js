// Js/user-slice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../services/userService';

// Async Thunks
export const fetchMyProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getMyProfile();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      return await userService.updateProfile(profileData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const changePassword = createAsyncThunk(
  'user/changePassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      return await userService.changePassword(passwordData);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async (file, { rejectWithValue }) => {
    try {
      return await userService.uploadAvatar(file);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload avatar');
    }
  }
);

export const removeAvatar = createAsyncThunk(
  'user/removeAvatar',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.removeAvatar();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove avatar');
    }
  }
);

const initialState = {
  user: null,
  loading: false,
  error: null,
  success: false,
  updating: false,
  changingPassword: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    clearUser: (state) => {
      state.user = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.user = action.payload;
        state.success = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.changingPassword = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.changingPassword = false;
        state.success = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.changingPassword = false;
        state.error = action.payload;
      })
      
      // Upload Avatar
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      
      // Remove Avatar
      .addCase(removeAvatar.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export const { clearError, clearSuccess, clearUser } = userSlice.actions;
export default userSlice.reducer;