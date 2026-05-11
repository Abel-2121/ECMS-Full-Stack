// backend/route/userRoute.js
const express = require('express');
const authController = require('../controller/user/authController');
const userController = require('../controller/user/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/upload');
const limiters = require('../middleware/rateLimiter');
const userRouter = express.Router();

// Public routes
userRouter.post('/login', limiters.loginLimiter, authController.login);
userRouter.post('/signup', limiters.registerLimiter, authController.signup);
userRouter.post('/refresh', authController.refresh);
userRouter.post('/verify-otp', limiters.otpLimiter, authController.verifyOTP);
userRouter.post('/resend-otp', limiters.otpRequestLimiter, authController.resendOTP);
userRouter.post('/forgot-password', limiters.passwordResetLimiter, authController.forgotPassword);
userRouter.post('/reset-password', limiters.passwordResetLimiter, authController.resetPassword);
userRouter.post('/logout', authMiddleware.protect, authController.logout);

// Protected routes
userRouter.get('/me', authMiddleware.protect, userController.getMyProfile);
userRouter.patch('/me', authMiddleware.protect, userController.updateMyProfile);
userRouter.patch('/change-password', authMiddleware.protect, userController.changePassword);
userRouter.post('/upload-avatar', authMiddleware.protect, uploadAvatar, userController.uploadAvatar);
userRouter.delete('/avatar', authMiddleware.protect, userController.removeAvatar);

module.exports = userRouter;