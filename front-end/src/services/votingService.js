
export const votingService = {
  submitAnonymousVote: async (electionId, selections) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!electionId || Object.keys(selections).length === 0) {
          return reject(new Error("Invalid voting payload."));
        }
        const date = new Date().toISOString().split('T')[0];
        const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
        const voteId = `VTR-${date}-${randomString}`;

       

        resolve(voteId);

      }, 2000); // Simulate network and heavy cryptographic transaction
    });
  }
};
