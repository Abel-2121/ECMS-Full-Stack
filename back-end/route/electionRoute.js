const express = require('express');
const electionController = require('../controller/election/electionController');
const uploadController = require('../controller/uploadController');
const authMiddleware = require('../middleware/authMiddleware');
const Election = require('../model/Election');
const { uploadVoterList } = require('../middleware/upload'); 
const limiters = require('../middleware/rateLimiter');


const electionRoute = express.Router();

electionRoute.use(authMiddleware.protect);

electionRoute.get('/', electionController.getElection);
electionRoute.get('/:id',electionController.getElectionById);


electionRoute.post('/', 
                    authMiddleware.authorize('electionAdmin'), 
                    limiters.electionCreationLimiter, electionController.createElection);


electionRoute.post(
  '/:electionId/upload', 
  authMiddleware.authorize('electionAdmin'),
  uploadVoterList, 
  uploadController.uploadVoterList
);



electionRoute.patch('/:id', 
  authMiddleware.authorize('electionAdmin'),
  authMiddleware.isOwner(Election),
  electionController.updateElection
);
electionRoute.delete('/:id', 
  authMiddleware.authorize('electionAdmin'),
  authMiddleware.isOwner(Election),
  electionController.deleteElection
);

module.exports = electionRoute;









