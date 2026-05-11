// route/systemSettingsRoute.js
const express = require('express');
const systemSettingsController = require('../controller/systemSettingsController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadHeroImage } = require('../middleware/upload');
const router = express.Router();

// Public routes (no auth)
router.get('/', systemSettingsController.getPublicSettings);

// Protected routes (superAdmin only)
router.use(authMiddleware.protect);
router.use(authMiddleware.authorize('superAdmin'));

router.get('/admin', systemSettingsController.getSettings);
router.patch('/', systemSettingsController.updateSettings);
router.post('/reset', systemSettingsController.resetToDefault);

router.post('/upload-hero-image', uploadHeroImage, systemSettingsController.uploadHeroImage);
router.delete('/hero-image/:imageId', systemSettingsController.deleteHeroImage);
router.patch('/hero-image/:imageId/active', systemSettingsController.setActiveHeroImage);

module.exports = router;