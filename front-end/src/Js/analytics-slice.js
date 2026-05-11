import { createSlice } from '@reduxjs/toolkit';

const initialState = { 
  globalStats: {
    totalInstitutions: 0,
    totalAdmins: 0,
    totalElections: 0,
    totalVoters: 0,
    totalVotesCast: 0
  },
  activityLog: [],
  loading: false 
};

const analyticsSlice = createSlice({ 
  name: 'analytics', 
  initialState, 
  reducers: { 
    setGlobalStats: (state, action) => { state.globalStats = { ...state.globalStats, ...action.payload }; },
    addActivity: (state, action) => { 
      state.activityLog.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...action.payload
      });
      if (state.activityLog.length > 50) state.activityLog.pop();
    }
  } 
});

export const { setGlobalStats, addActivity } = analyticsSlice.actions; 
export default analyticsSlice.reducer;
