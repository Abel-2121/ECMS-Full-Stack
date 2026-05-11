// backend/route/voterEligibility.js
const express = require('express');
const voterEligibilityController = require('../controller/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadVoterList } = require('../middleware/upload');
const limiters = require('../middleware/rateLimiter');

const voterEligibilityRoute = express.Router();

voterEligibilityRoute.use(authMiddleware.protect);

voterEligibilityRoute.post(
  '/batch/registration-status',
  authMiddleware.protect,
  voterEligibilityController.batchRegistrationStatus
);

voterEligibilityRoute.post(
  '/batch/nomination-status',
  authMiddleware.protect,
  voterEligibilityController.batchNominationStatus
);

voterEligibilityRoute.post(
  '/election/:electionId/register',
  limiters.voterRegistrationLimiter,
  voterEligibilityController.registerVoter
);

voterEligibilityRoute.get(
  '/election/:electionId/is-registered',
  voterEligibilityController.isRegistered
);

voterEligibilityRoute.post(
  '/election/:electionId/upload',
  authMiddleware.authorize('electionAdmin'),
  uploadVoterList,
  voterEligibilityController.uploadVoterList
);

voterEligibilityRoute.get(
  '/election/:electionId',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  voterEligibilityController.getVoterList
);

voterEligibilityRoute.get(
  '/election/:electionId/voters',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  voterEligibilityController.getVoterDetails
);

voterEligibilityRoute.get(
  '/template',
  authMiddleware.authorize('electionAdmin'),
  voterEligibilityController.downloadTemplate
);

voterEligibilityRoute.delete(
  '/election/:electionId',
  authMiddleware.authorize('electionAdmin'),
  voterEligibilityController.deleteVoterList
);

voterEligibilityRoute.get(
  '/election/:electionId/check/:email',
  voterEligibilityController.checkEligibility
);

voterEligibilityRoute.post(
  '/election/:electionId/voter',
  authMiddleware.authorize('electionAdmin'),
  voterEligibilityController.addVoter
);

voterEligibilityRoute.put(
  '/election/:electionId/voter/:voterId',
  authMiddleware.authorize('electionAdmin'),
  voterEligibilityController.updateVoter
);

voterEligibilityRoute.delete(
  '/election/:electionId/voter/:voterId',
  authMiddleware.authorize('electionAdmin'),
  voterEligibilityController.deleteVoter
);

module.exports = voterEligibilityRoute;