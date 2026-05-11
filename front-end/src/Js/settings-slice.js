// import { createSlice } from '@reduxjs/toolkit';
// import { systemSettings } from './data';

// const initialState = { 
//   config: JSON.parse(localStorage.getItem('ecms_settings')) || systemSettings, 
//   loading: false 
// };

// const settingsSlice = createSlice({ 
//   name: 'settings', 
//   initialState, 
//   reducers: { 
//     updateConfig: (state, action) => { 
//       state.config = { ...state.config, ...action.payload };
//       localStorage.setItem('ecms_settings', JSON.stringify(state.config));
//     } 
//   } 
// });

// export const { updateConfig } = settingsSlice.actions; 
// export default settingsSlice.reducer;
