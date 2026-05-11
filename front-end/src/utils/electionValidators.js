// utils/electionValidators.js
export const validateElectionTimeline = (data) => {
  const errors = {};

  try {
    const regStart = new Date(data.regStart).toISOString();
    const regEnd = new Date(data.regEnd).toISOString();
    const nomStart = new Date(data.nomStart).toISOString();
    const nomEnd = new Date(data.nomEnd).toISOString();
    const voteStart = new Date(data.voteStart).toISOString();
    const voteEnd = new Date(data.voteEnd).toISOString();
    const resultDate = new Date(data.resultDate).toISOString();

    if (regEnd <= regStart) errors.regEnd = 'Registration end must be after start';
    if (nomStart < regEnd) errors.nomStart = 'Nomination must start after registration ends';
    if (nomEnd <= nomStart) errors.nomEnd = 'Nomination end must be after start';
    if (voteStart < nomEnd) errors.voteStart = 'Voting must start after nomination ends';
    if (voteEnd <= voteStart) errors.voteEnd = 'Voting end must be after start';
    if (resultDate < voteEnd) errors.resultDate = 'Result date must be after voting ends';
  } catch (e) {
    errors.general = 'Invalid date format';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const checkDuplicateTitle = (title, existingElections) => {
  if (!title || !existingElections) return false;
  return existingElections.some(e => e.title?.toLowerCase().trim() === title.toLowerCase().trim());
};