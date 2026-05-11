// import { createSlice } from '@reduxjs/toolkit';
// import { candidates as initialCandidates } from './data';

// const initialState = {
//   list: initialCandidates,
//   loading: false,
//   error: null
// };

// const candidatesSlice = createSlice({
//   name: 'candidates',
//   initialState,
//   reducers: {
//     updateCandidateProfile: (state, action) => {
//       const { id, motto, manifesto, party } = action.payload;
//       const candidate = state.list.find(c => c.id === id);
//       if (candidate) {
//         candidate.motto = motto;
//         candidate.manifesto = manifesto;
//         candidate.party = party;
        
//         // PERSISTENCE
//         localStorage.setItem('ecms_candidates_list', JSON.stringify(state.list));
//       }
//     },
//     // Useful for adding new candidates through admin later
//     addCandidate: (state, action) => {
//       state.list.push(action.payload);
//       localStorage.setItem('ecms_candidates_list', JSON.stringify(state.list));
//     }
//   }
// });

// // Load from LocalStorage if available
// const savedList = localStorage.getItem('ecms_candidates_list');
// if (savedList && initialState.list) {
//   try {
//     initialState.list = JSON.parse(savedList);
//   } catch (e) {
//     console.error("Failed to load saved candidates", e);
//   }
// }

// export const { updateCandidateProfile, addCandidate } = candidatesSlice.actions;
// export default candidatesSlice.reducer;
