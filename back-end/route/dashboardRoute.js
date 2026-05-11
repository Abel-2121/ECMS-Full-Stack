// route/dashboardRoute.js
const express = require('express');
const dashboardController = require('../controller/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

const dashboardRoute = express.Router();

// All dashboard routes require authentication and super admin role
dashboardRoute.use(authMiddleware.protect);
dashboardRoute.use(authMiddleware.authorize('superAdmin'));

// Dashboard overview endpoints
dashboardRoute.get('/stats', dashboardController.getDashboardStats);
dashboardRoute.get('/election-trend', dashboardController.getElectionTrend);
dashboardRoute.get('/top-institutions', dashboardController.getTopInstitutions);
dashboardRoute.get('/recent-activities', dashboardController.getRecentActivities);
dashboardRoute.get('/platform-analytics', dashboardController.getPlatformAnalytics);
dashboardRoute.get('/system-analytics', dashboardController.getSystemAnalytics);
// route/dashboardRoute.js (add new routes)
dashboardRoute.get('/user-growth', dashboardController.getUserGrowth);
dashboardRoute.get('/institution-activity', dashboardController.getInstitutionActivity);
dashboardRoute.get('/platform-summary', dashboardController.getPlatformSummary);
// System settings endpoints
dashboardRoute.get('/settings', dashboardController.getSystemSettings);
dashboardRoute.patch('/settings', dashboardController.updateSystemSettings);

module.exports = dashboardRoute;