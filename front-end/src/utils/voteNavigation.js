// utils/voteNavigation.js
export const voteNavigation = {
  // Go to election list
  toElectionList: (navigate) => navigate('/voter/elections'),
  
  // Go to verification page
  toVerification: (navigate, electionId, election) => navigate(`/voter/verify/${electionId}`, { state: { election } }),
  
  // Go to voting page
  toVoting: (navigate, electionId, election, voterId) => navigate(`/voter/cast/${electionId}`, { state: { election, voterId } }),
  
  // Go to success page
  toSuccess: (navigate, voteData) => navigate('/voter/vote-success', { state: voteData }),
  
  // Go to receipt page
  toReceipt: (navigate, confirmationCode) => navigate(`/voter/vote-receipt/${confirmationCode}`),
  
  // Go back to dashboard
  toDashboard: (navigate) => navigate('/voter/elections')
};