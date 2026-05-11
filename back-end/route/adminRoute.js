// route/adminRoute.js
const express = require('express');
const adminController = require('../controller/adminController');
const authMiddleware = require('../middleware/authMiddleware');

const adminRoute = express.Router();

adminRoute.use(authMiddleware.protect);
adminRoute.use(authMiddleware.authorize('superAdmin'));

adminRoute.get('/', adminController.getAllAdmins);
adminRoute.get('/stats', adminController.getAdminStats);

adminRoute.post('/', adminController.createAdmin);
adminRoute.get('/:id', adminController.getAdminById);
adminRoute.patch('/:id', adminController.updateAdmin);
adminRoute.patch('/:id/toggle-status', adminController.toggleAdminStatus);
adminRoute.delete('/:id', adminController.deleteAdmin);
adminRoute.get('/institution/:institutionId', adminController.getAdminsByInstitution);
adminRoute.post('/:id/resend-invitation', adminController.resendInvitation);
adminRoute.post('/send-welcome-email', adminController.sendWelcomeEmail);

module.exports = adminRoute;