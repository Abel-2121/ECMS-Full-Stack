// backend/route/institutionRoute.js
const express = require('express');
const institutionController = require('../controller/institution');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadInstitutionLogo } = require('../middleware/upload');

const institutionRoute = express.Router();

// Public routes
institutionRoute.get('/verify/:token', institutionController.getVerificationDetails);
institutionRoute.post('/verify/:token/confirm', institutionController.confirmVerification);

// ==================== PROTECTED ROUTES ====================
institutionRoute.use(authMiddleware.protect);

// SuperAdmin routes
institutionRoute.post('/create-with-admin', 
  authMiddleware.authorize('superAdmin'), 
  institutionController.createInstitutionWithAdmin
);

institutionRoute.post('/create-admin', 
  authMiddleware.authorize('superAdmin'), 
  institutionController.createAdminForInstitution
);

institutionRoute.post('/request', institutionController.sendRequest);

institutionRoute.get('/', 
  authMiddleware.authorize('superAdmin'), 
  institutionController.getInstitution
);

institutionRoute.get('/pending-requests', 
  authMiddleware.authorize('superAdmin'), 
  institutionController.getPendingRequests
);

institutionRoute.get('/pending-requests/:id', 
  authMiddleware.authorize('superAdmin'), 
  institutionController.getPendingRequestById
);

institutionRoute.post('/:id/approve', 
  authMiddleware.authorize('superAdmin'), 
  institutionController.approveInstitution
);

institutionRoute.post('/:id/reject', 
  authMiddleware.authorize('superAdmin'), 
  institutionController.rejectInstitution
);

institutionRoute.get('/:id', 
  authMiddleware.authorize('superAdmin'), 
  institutionController.getInstitutionById
);

// Update institution with logo upload
institutionRoute.patch('/:id', 
  authMiddleware.authorize('superAdmin'),
  uploadInstitutionLogo,
  institutionController.updateInstitution
);

institutionRoute.delete('/:id', 
  authMiddleware.authorize('superAdmin'), 
  institutionController.deleteInstitution
);

// Election Admin routes
institutionRoute.get('/owner/my-institution', 
  authMiddleware.authorize('electionAdmin'), 
  institutionController.getInstitutionforOwner
);

institutionRoute.patch('/owner/:id', 
  authMiddleware.authorize('electionAdmin'),
  uploadInstitutionLogo,
  institutionController.updateInstitutionforOwner
);

module.exports = institutionRoute;