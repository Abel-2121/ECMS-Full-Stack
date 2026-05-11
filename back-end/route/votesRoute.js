const express = require('express');
const voteController = require('../controller/voteController');
const authMiddleware = require('../middleware/authMiddleware');
const limiters = require('../middleware/rateLimiter');
const Vote = require('../model/Vote');

const voteRoute = express.Router();

voteRoute.use(authMiddleware.protect);
voteRoute.post('/verify',  
               limiters.verifyCredentialLimiter,  
               voteController.verifyVoterCredentials);


voteRoute.post(
  '/cast',
  authMiddleware.authorize('voter','candidate'),
  voteController.castVote
);


voteRoute.post('/verify-confirmation', voteController.verifyVote);


voteRoute.get('/election/:electionId/voting-data', voteController.getVotingData);

voteRoute.get(
  '/my-votes',
  authMiddleware.authorize('voter', 'candidate'),
  voteController.getMyVotes
);



voteRoute.get(
  '/has-voted/:electionId',
  authMiddleware.authorize('voter', 'candidate'),
  voteController.hasVoted
);



voteRoute.get(
  '/election/:electionId',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  voteController.getVotesByElection
);


voteRoute.get(
  '/election/:electionId/statistics',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  voteController.getVoteStatistics
);


voteRoute.get(
  '/election/:electionId/counts',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  voteController.getVoteCounts
);

voteRoute.get(
  '/:id',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  voteController.getVoteById
);


voteRoute.get(
  '/public/election/:electionId/results',
  voteController.getPublicResults
);

module.exports = voteRoute;