// routes/resultRoutes.js - FIXED
const express = require('express');
const resultController = require('../controller/resultController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();


router.get('/election/:electionId/public', resultController.getPublicResults);

// All routes below require authentication
router.use(authMiddleware.protect);

// Admin routes
router.get('/election/:electionId/preview', 
  authMiddleware.authorize('electionAdmin'), 
  resultController.getPreviewResults
);


router.get('/election/:electionId/detailed', 
  authMiddleware.authorize('electionAdmin'), 
  resultController.getDetailedResults
);

router.post('/election/:electionId/publish', 
  authMiddleware.authorize('electionAdmin'), 
  resultController.publishResults
);

router.post('/election/:electionId/resolve-tie/:positionId', 
  authMiddleware.authorize('electionAdmin', 'superAdmin'), 
  resultController.resolveTie
);

router.get('/admin/all', 
  authMiddleware.authorize('electionAdmin', 'superAdmin'), 
  resultController.getAllResults
);

router.patch('/:resultId/tie-break', 
  authMiddleware.authorize('electionAdmin'), 
  resultController.resolveTie
);

// Get result by result ID (not electionId)
router.get('/result/:id', 
  authMiddleware.authorize('electionAdmin', 'superAdmin'), 
  resultController.getResultById

);

router.delete(
  '/:id',
  authMiddleware.protect,
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  resultController.deleteResult
);
module.exports = router;