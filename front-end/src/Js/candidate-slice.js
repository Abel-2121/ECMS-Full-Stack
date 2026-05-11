import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeStep: 0,
  draftApplication: {
    electionId: '',
    positionId: '',
    photo: null,
    biography: '',
    manifesto: '',
    slogan: '',
    party: '',
    documents: {
      nominationForm: null,
      transcript: null,
      noc: null,
      supportSignatures: null,
      cv: null
    },
    declarations: {
      codeOfConduct: false,
      spendingLimits: false,
      truthfulness: false,
      disqualificationConsent: false,
      dataProcessing: false
    }
  },
  eligibility: {
    isChecked: false,
    isEligible: false,
    reason: ''
  },
  submissionStatus: 'idle',
  submissionError: null,
  nominationId: null,
  
  // UC-12: New fields for tracking
  submittedNominations: [
    {
      id: 'NOM-2024-1001',
      electionTitle: 'ECMS 2026 General Election',
      position: 'President',
      timestamp: '2024-10-10T14:30:00Z',
      status: 'Approved',
      adminComments: 'Candidacy has been officially verified. Ballot position assigned: #1.',
      details: {
        biography: 'Jane is a Year 4 Computer Science student with 3 years of council experience.',
        manifesto: 'Digital voting terminals and tech-partnerships.',
        documents: ['Nomination_Form.pdf', 'Transcript_Jane.pdf']
      }
    },
    {
      id: 'NOM-2024-1005',
      electionTitle: 'Engineering Faculty Rep',
      position: 'Faculty Representative',
      timestamp: '2024-10-12T09:15:00Z',
      status: 'Pending',
      adminComments: 'Awaiting secondary audit of academic transcript.',
      details: {
        biography: 'Specialized in student welfare.',
        manifesto: 'Equitable club funding.',
        documents: ['Nomination_Form_Eng.pdf', 'NOC_Eng.pdf']
      }
    },
    {
      id: 'NOM-2024-1008',
      electionTitle: 'Sports Committee',
      position: 'Sports Secretary',
      timestamp: '2024-10-14T11:20:00Z',
      status: 'Rejected',
      adminComments: 'Ineligibility: Candidate must have participated in at least two varsity programs in the previous academic year.',
      details: {
        biography: 'Varsity athlete for 1 year.',
        manifesto: 'Revitalizing campus athletic facilities.',
        documents: ['Nomination_Form_Sports.pdf']
      }
    }
  ]
};

const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    setStep: (state, action) => {
      state.activeStep = action.payload;
    },
    updateDraftField: (state, action) => {
      const { field, value } = action.payload;
      state.draftApplication[field] = value;
    },
    updateDocument: (state, action) => {
      const { name, value } = action.payload;
      state.draftApplication.documents[name] = value;
    },
    updateDeclaration: (state, action) => {
      const { name, value } = action.payload;
      state.draftApplication.declarations[name] = value;
    },
    checkEligibility: (state, action) => {
      const { electionId, positionId } = action.payload;
      if (electionId && positionId) {
        state.eligibility = {
          isChecked: true,
          isEligible: true,
          reason: 'Meets basic academic requirements.'
        };
      }
    },
    submitStart: (state) => {
      state.submissionStatus = 'loading';
    },
    submitSuccess: (state, action) => {
      state.submissionStatus = 'success';
      state.nominationId = action.payload;
      // Normally would push the current draft into submittedNominations too
    },
    submitError: (state, action) => {
      state.submissionStatus = 'error';
      state.submissionError = action.payload;
    },
    resetNomination: (state) => {
      state.activeStep = 0;
      state.submissionStatus = 'idle';
      state.nominationId = null;
    },
    saveDraft: (state) => {
     
    }
  }
});

export const {
  setStep, updateDraftField, updateDocument, updateDeclaration,
  checkEligibility, submitStart, submitSuccess, submitError, resetNomination,
  saveDraft
} = candidateSlice.actions;

export default candidateSlice.reducer;
