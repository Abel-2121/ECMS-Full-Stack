/**
 * Validates the current selection object against the election's maxPositionsPerVoter limit.
 * @param {Object} selections      - { positionId: [candidateId, ...] }
 * @param {Array}  positions       - array of position objects from the election
 * @param {number} maxPositions    - maximum number of positions this voter may vote for (1, 2, or 3)
 */
export const validateSelections = (selections, positions, maxPositions = 1) => {
  const selectedEntries = Object.entries(selections).filter(([_, ids]) => ids.length > 0);

  if (selectedEntries.length === 0) {
    return {
      isValid: false,
      missingPositions: [
        `Please select a candidate for at least 1 position before proceeding.`
      ]
    };
  }

  if (selectedEntries.length > maxPositions) {
    return {
      isValid: false,
      missingPositions: [
        `You may only vote for up to ${maxPositions} position${maxPositions > 1 ? 's' : ''} in this election. Please remove a selection.`
      ]
    };
  }

  // Verify every selected position has exactly one candidate chosen
  for (const [posId, candidateIds] of selectedEntries) {
    if (candidateIds.length === 0) {
      const pos = positions.find(p => p.id === posId);
      return {
        isValid: false,
        missingPositions: [`No candidate selected for: ${pos?.title || posId}`]
      };
    }
  }

  return {
    isValid: true,
    missingPositions: []
  };
};

export const getCandidateData = (positionId, candidateId, positions) => {
  const pos = positions.find(p => p.id === positionId);
  if (!pos) return null;
  return pos.candidates.find(c => c.id === candidateId);
};
