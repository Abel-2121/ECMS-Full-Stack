// route/electionAdminDashboardRoute.js
const express = require('express');
const dashboardController = require('../controller/electionAdminDashboardController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware.protect);
router.use(authMiddleware.authorize('electionAdmin'));

router.get('/overview', dashboardController.getDashboardOverview);

module.exports = router;