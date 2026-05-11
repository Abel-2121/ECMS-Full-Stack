// Js/voting-slice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Step management: 1 = Voting page, 2 = Review page, 3 = Success page
  currentStep: 1,
  
  // Vote selections: { positionId: candidateId } (single candidate per position)
  selections: {},
  
  // Track which positions have been voted
  votedPositions: [], // Array of positionIds that have votes
  
  // Total positions in current election (set when loading voting data)
  totalPositions: 0,
  
  // Two-factor verification tracking (stores which elections are verified in this session)
  verifiedElections: {}, // { electionId: { verified: true, voterId: xxx } }
  
  // Submission state
  loading: false,
  error: null,
  
  // Success state
  confirmedVoteId: null,
  lastVoteDetails: null, // { candidateName, positionTitle, timestamp }
  
  // Draft saved flag
  hasDraft: false
};

const votingSlice = createSlice({
  name: 'voting',
  initialState,
  reducers: {
    // Set total positions for current election
    setTotalPositions: (state, action) => {
      state.totalPositions = action.payload;
    },
    
    // Make or update a selection for a position
    makeSelection: (state, action) => {
      const { positionId, candidateId } = action.payload;
      
      // Store selection (single candidate per position)
      state.selections[positionId] = candidateId;
      
      // Update voted positions list (avoid duplicates)
      if (!state.votedPositions.includes(positionId)) {
        state.votedPositions.push(positionId);
      }
    },
    
    // Remove selection for a position (for updating vote)
    removeSelection: (state, action) => {
      const { positionId } = action.payload;
      delete state.selections[positionId];
      state.votedPositions = state.votedPositions.filter(id => id !== positionId);
    },
    
    // Clear all selections (when resetting)
    clearAllSelections: (state) => {
      state.selections = {};
      state.votedPositions = [];
      state.hasDraft = false;
    },
    
    // Step navigation
    advanceStep: (state) => {
      if (state.currentStep < 3) {
        state.currentStep += 1;
      }
    },
    
    retreatStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
      }
    },
    
    goToStep: (state, action) => {
      const { step } = action.payload;
      if (step >= 1 && step <= 3) {
        state.currentStep = step;
      }
    },
    
    // Mark two-factor verification for an election
    markVerified: (state, action) => {
      const { electionId, voterId } = action.payload;
      state.verifiedElections[electionId] = {
        verified: true,
        voterId,
        verifiedAt: new Date().toISOString()
      };
    },
    
    // Check if election is verified
    isVerified: (state, electionId) => {
      return state.verifiedElections[electionId]?.verified === true;
    },
    
    // Clear verification for an election (e.g., after voting)
    clearVerification: (state, action) => {
      const { electionId } = action.payload;
      delete state.verifiedElections[electionId];
    },
    
    // Submit states
    submitVoteStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    submitVoteSuccess: (state, action) => {
      const { voteId, candidateName, positionTitle, timestamp } = action.payload;
      state.loading = false;
      state.currentStep = 3; // Move to success screen
      state.confirmedVoteId = voteId;
      state.lastVoteDetails = {
        candidateName,
        positionTitle,
        timestamp: timestamp || new Date().toISOString()
      };
      // Clear selections after successful submission
      state.selections = {};
      state.votedPositions = [];
      state.hasDraft = false;
    },
    
    submitVoteFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset entire voting session (when leaving voting page)
    resetVotingSession: (state) => {
      state.currentStep = 1;
      state.selections = {};
      state.votedPositions = [];
      state.totalPositions = 0;
      state.loading = false;
      state.error = null;
      state.confirmedVoteId = null;
      state.lastVoteDetails = null;
      state.hasDraft = false;
      // DON'T clear verifiedElections - keep across session
    },
    
    // Load draft from localStorage
    loadDraft: (state, action) => {
      const { selections, votedPositions } = action.payload;
      state.selections = selections;
      state.votedPositions = votedPositions;
      state.hasDraft = true;
    },
    
    // Mark that draft exists
    setHasDraft: (state, action) => {
      state.hasDraft = action.payload;
    },
    
    // Get voted count (selector-like, but we'll use selectors in components)
    getVotedCount: (state) => {
      return state.votedPositions.length;
    },
    
    // Check if all positions have votes
    isComplete: (state) => {
      return state.votedPositions.length === state.totalPositions && state.totalPositions > 0;
    }
  }
});

// Export actions
export const {
  setTotalPositions,
  makeSelection,
  removeSelection,
  clearAllSelections,
  advanceStep,
  retreatStep,
  goToStep,
  markVerified,
  clearVerification,
  submitVoteStart,
  submitVoteSuccess,
  submitVoteFailure,
  clearError,
  resetVotingSession,
  loadDraft,
  setHasDraft
} = votingSlice.actions;

// Selectors for components
export const selectVotingProgress = (state) => ({
  votedCount: state.voting.votedPositions.length,
  totalPositions: state.voting.totalPositions,
  isComplete: state.voting.votedPositions.length === state.voting.totalPositions && state.voting.totalPositions > 0,
  percentage: state.voting.totalPositions > 0 
    ? (state.voting.votedPositions.length / state.voting.totalPositions) * 100 
    : 0
});

export const selectSelections = (state) => state.voting.selections;
export const selectCurrentStep = (state) => state.voting.currentStep;
export const selectVotingLoading = (state) => state.voting.loading;
export const selectVotingError = (state) => state.voting.error;
export const selectIsVerified = (state, electionId) => state.voting.verifiedElections[electionId]?.verified === true;

export default votingSlice.reducer;