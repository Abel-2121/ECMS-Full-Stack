import { createSlice } from '@reduxjs/toolkit';

const initialState = { credentials: [], loading: false };

const credentialSlice = createSlice({
  name: 'credential',
  initialState,
  reducers: {
    setCredentials:      (state, action) => { state.credentials = action.payload; },
    generateCredentials: (state, action) => { state.credentials = action.payload; },
    clearCredentials:    (state)         => { state.credentials = []; },
    setCurrentCredentials: (state, action) => { state.currentReg = action.payload; },
  },
});

export const { setCredentials, generateCredentials, clearCredentials, setCurrentCredentials } = credentialSlice.actions;
export default credentialSlice.reducer;
