// =====================================================
// credentialGenerator.js - ECMS Credential Generation
// =====================================================

/**
 * Generates an Election ID (ELEC-ID).
 * Format: ELEC-YYYY-[4 digits]
 */
export const generateElectionId = (sequence = 1) => {
  const year = new Date().getFullYear();
  const paddedSequence = sequence.toString().padStart(4, '0');
  return `ELEC-${year}-${paddedSequence}`;
};

/**
 * Generates a Voter ID (VTR-ID).
 * Format: VTR-[Election Sequence(4)]-[Voter Sequence(6)]
 */
export const generateVoterId = (electionSequence = 1, voterSequence = 1) => {
  const rElec = electionSequence.toString().padStart(4, '0');
  const rVoter = voterSequence.toString().padStart(6, '0');
  return `VTR-${rElec}-${rVoter}`;
};

/**
 * Generates a Temporary Password.
 * Length: 10 characters
 * Contains: 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const generateTemporaryPassword = () => {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const num = '0123456789';
  const special = '!@#$%^&*()_+~|{}[]:';
  
  const allChars = upper + lower + num + special;
  
  // Guarantee minimums
  let pwd = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    num[Math.floor(Math.random() * num.length)],
    special[Math.floor(Math.random() * special.length)]
  ];
  
  // Fill remaining 6 chars
  for (let i = 0; i < 6; i++) {
    pwd.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }
  
  // Shuffle reliably
  for (let i = pwd.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pwd[i], pwd[j]] = [pwd[j], pwd[i]];
  }
  
  return pwd.join('');
};
