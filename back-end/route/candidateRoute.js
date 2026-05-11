// backend/route/candidateRoute.js (Add missing routes)
const express = require('express');
const candidateController = require('../controller/candidateController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadCandidatePhoto, uploadCandidateDocuments } = require('../middleware/upload');

const candidateRoute = express.Router();

candidateRoute.use(authMiddleware.protect);

// ==================== CANDIDATE SUBMISSION ROUTES ====================
candidateRoute.post(
  '/nomination',
  authMiddleware.authorize('voter', 'candidate'),
  uploadCandidateDocuments([
    { name: 'campaignPhoto', maxCount: 1 },
    { name: 'supportingDocuments', maxCount: 10 }
  ]),
  candidateController.submitNomination
);

candidateRoute.get(
  '/election/:electionId/has-nomination',
  authMiddleware.authorize('voter', 'candidate'),
  candidateController.hasNomination
);

candidateRoute.get(
  '/my-nominations',
  authMiddleware.authorize('voter', 'candidate'),
  candidateController.getMyNominations
);

candidateRoute.post(
  '/batch/nomination-status',
  authMiddleware.protect,
  candidateController.batchNominationStatus
);

candidateRoute.get(
  '/my-history',
  authMiddleware.authorize('voter', 'candidate'),
  candidateController.getCandidateHistory
);
candidateRoute.get(
  '/nomination/:id',
  authMiddleware.authorize('voter', 'candidate'),
  candidateController.getNominationById
);

candidateRoute.patch(
  '/nomination/:id/withdraw',
  authMiddleware.authorize('voter', 'candidate'),
  candidateController.withdrawNomination
);

candidateRoute.patch(
  '/nomination/:id/appeal',
  authMiddleware.authorize('voter', 'candidate'),
  candidateController.requestAppeal
);

// ==================== ELECTION ADMIN / PUBLIC ROUTES ====================
candidateRoute.get(
  '/election/:electionId/candidates',
  candidateController.getApprovedCandidates
);

candidateRoute.get(
  '/candidate/:id',
  candidateController.getCandidatePublic
);

// ==================== ADMIN MANAGEMENT ROUTES ====================
// Get all candidates (admin) - ADD THIS
candidateRoute.get(
  '/admin/candidates',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  candidateController.getAllCandidates
);

// Get candidate statistics - ADD THIS
candidateRoute.get(
  '/admin/election/:electionId/stats',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  candidateController.getCandidateStats
);

// Get candidates by election (admin)
candidateRoute.get(
  '/election/:electionId/nominations',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  candidateController.getNominationsByElection
);

// Get single nomination (admin)
candidateRoute.get(
  '/admin/nomination/:id',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  candidateController.getNominationByIdAdmin
);

// Get single candidate (admin) - ADD THIS
candidateRoute.get(
  '/admin/candidate/:id',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  candidateController.getCandidateByIdAdmin
);

// Approve nomination
candidateRoute.patch(
  '/nomination/:id/approve',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  candidateController.approveNomination
);

// Reject nomination
candidateRoute.patch(
  '/nomination/:id/reject',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  candidateController.rejectNomination
);

// Update candidate - ADD THIS
candidateRoute.patch(
  '/admin/candidate/:id',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  candidateController.updateCandidate
);

// Delete candidate - ADD THIS
candidateRoute.delete(
  '/admin/candidate/:id',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  candidateController.deleteCandidate
);

// Bulk approve nominations
candidateRoute.post(
  '/election/:electionId/nominations/bulk-approve',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  candidateController.bulkApproveNominations
);

// Assign ballot positions
candidateRoute.patch(
  '/election/:electionId/ballot-positions',
  authMiddleware.authorize('electionAdmin', 'superAdmin'),
  candidateController.assignBallotPositions
);

module.exports = candidateRoute;