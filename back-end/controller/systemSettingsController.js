const SystemSettings = require('../model/SystemSettings');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { getPublicUrl } = require('../middleware/upload');

const systemSettingsController ={ 
  getSettings: catchAsync(async (req, res, next) => {
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied. Super admin only.', 403));
    }
    
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    
    res.status(200).json({
      status: 'success',
      data: { settings }
    });
  }),

  getPublicSettings: catchAsync(async (req, res, next) => {
    let settings = await SystemSettings.findOne().lean();
    
    if (!settings) {
      settings = await SystemSettings.create({});
      settings = settings.toObject();
    }
    
    const hero = {
      title: settings.hero?.title || 'Election Control & Management System',
      subtitle: settings.hero?.subtitle || 'Secure, transparent, and efficient online voting platform for institutions and organizations worldwide.',
      stats: settings.hero?.stats && settings.hero.stats.length > 0 ? settings.hero.stats : [
        { number: '500+', label: 'Organizations' },
        { number: '100K+', label: 'Voters Served' },
        { number: '99.9%', label: 'Satisfaction' }
      ],
      images: settings.hero?.images && settings.hero.images.length > 0 ? settings.hero.images : [],
      ctaButtonText: settings.hero?.ctaButtonText || 'Register Institution'
    };
    
    const howItWorks = {
      title: settings.howItWorks?.title || 'How It Works',
      steps: settings.howItWorks?.steps && settings.howItWorks.steps.length > 0 ? settings.howItWorks.steps : [
        { number: '01', title: 'Register', description: 'Create your account with your email address', icon: 'FiUserPlus' },
        { number: '02', title: 'Verify', description: 'Verify your email with OTP to activate account', icon: 'FiCheckCircle' },
        { number: '03', title: 'Participate', description: 'Vote, manage elections, or run as a candidate', icon: 'FiAward' }
      ]
    };
    
    
    const footer = {
      copyright: settings.footer?.copyright || `© ${new Date().getFullYear()} ECMS. All rights reserved.`,
      links: settings.footer?.links && settings.footer.links.length > 0 ? settings.footer.links : [
        { label: 'Privacy', path: '/privacy' },
        { label: 'Terms', path: '/terms' },
        { label: 'Contact', path: '/contact' },
        { label: 'FAQ', path: '/faq' }
      ]
    };
    
    const publicSettings = {
      hero: hero,
      howItWorks: howItWorks,
      about: {
        description: settings.about?.description || 'ECMS (Election Control & Management System) is a cutting-edge platform designed to revolutionize how institutions conduct elections. Built with security, transparency, and ease-of-use at its core. Our system handles everything from voter registration to real-time result publication, making election management effortless and trustworthy.',
        features: settings.about?.features && settings.about.features.length > 0 ? settings.about.features : [
          { id: 1, title: 'Secure Elections', description: 'End-to-end encrypted voting system with complete audit trails.' },
          { id: 2, title: 'Role Management', description: 'SuperAdmin, ElectionAdmin, Candidate, and Voter roles with permissions.' },
          { id: 3, title: 'Easy Voting', description: 'Simple, intuitive interface for voters to cast their ballots.' },
          { id: 4, title: 'Real-time Results', description: 'Live vote tracking and instant result publication.' }
        ],
        ctaTitle: settings.about?.ctaTitle || 'Ready to get started?',
        ctaText: settings.about?.ctaText || 'Join thousands of institutions already using ECMS for their elections.',
        ctaButtonText: settings.about?.ctaButtonText || 'Create Free Account',
        contactEmail: settings.about?.contactEmail || 'support@ecms.com',
        contactPhone: settings.about?.contactPhone || '+1 (555) 123-4567',
        contactAddress: settings.general?.contactAddress || 'Arba Minch 12345',
        website: settings.about?.website || 'www.ecms-platform.com'
      },
      footer: footer
    };
    
    console.log('Public Settings:', JSON.stringify(publicSettings, null, 2));
    
    res.status(200).json({
      status: 'success',
      data: publicSettings
    });
  }),

  // Rest of your controller methods remain the same...
  updateSettings: catchAsync(async (req, res, next) => {
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied. Super admin only.', 403));
    }
    
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    
    const updates = req.body;
    
    if (updates.general) settings.general = { ...settings.general, ...updates.general };
    if (updates.hero) settings.hero = { ...settings.hero, ...updates.hero };
    if (updates.howItWorks) settings.howItWorks = { ...settings.howItWorks, ...updates.howItWorks };
    if (updates.about) settings.about = { ...settings.about, ...updates.about };
    if (updates.footer) settings.footer = { ...settings.footer, ...updates.footer };
    
    settings.lastUpdatedBy = req.user.id;
    settings.lastUpdatedAt = new Date();
    settings.version += 1;
    
    await settings.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Settings updated successfully',
      data: { settings }
    });
  }),

  resetToDefault: catchAsync(async (req, res, next) => {
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied. Super admin only.', 403));
    }
    
    await SystemSettings.deleteMany();
    const settings = await SystemSettings.create({});
    
    res.status(200).json({
      status: 'success',
      message: 'Settings reset to default',
      data: { settings }
    });
  }),

  uploadHeroImage: catchAsync(async (req, res, next) => {
    if (!req.file) {
      return next(new AppError('Please upload an image file', 400));
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    const imageUrl = getPublicUrl(req.file.path || req.file.filename);
    const newImage = { 
      url: imageUrl, 
      isActive: settings.hero?.images?.length === 0 
    };
    
    settings.hero = settings.hero || {};
    settings.hero.images = [...(settings.hero.images || []), newImage];
    settings.lastUpdatedAt = new Date();
    settings.version += 1;
    
    await settings.save();

    res.status(200).json({
      status: 'success',
      message: 'Hero image uploaded successfully',
      data: { 
        image: newImage, 
        images: settings.hero.images 
      }
    });
  }),

  deleteHeroImage: catchAsync(async (req, res, next) => {
    const { imageId } = req.params;
    
    let settings = await SystemSettings.findOne();
    if (!settings) {
      return next(new AppError('Settings not found', 404));
    }

    if (!settings.hero || !settings.hero.images) {
      return next(new AppError('No images found', 404));
    }

    const originalLength = settings.hero.images.length;
    settings.hero.images = settings.hero.images.filter(img => img._id.toString() !== imageId);
    
    if (settings.hero.images.length === originalLength) {
      return next(new AppError('Image not found', 404));
    }
    
    if (settings.hero.images.length > 0 && !settings.hero.images.some(img => img.isActive)) {
      settings.hero.images[0].isActive = true;
    }
    
    settings.lastUpdatedAt = new Date();
    settings.version += 1;
    
    await settings.save();

    res.status(200).json({
      status: 'success',
      message: 'Hero image deleted successfully',
      data: { images: settings.hero.images }
    });
  }),

  setActiveHeroImage: catchAsync(async (req, res, next) => {
    const { imageId } = req.params;
    
    let settings = await SystemSettings.findOne();
    if (!settings) {
      return next(new AppError('Settings not found', 404));
    }

    if (!settings.hero || !settings.hero.images || settings.hero.images.length === 0) {
      return next(new AppError('No images found', 404));
    }

    const imageExists = settings.hero.images.some(img => img._id.toString() === imageId);
    if (!imageExists) {
      return next(new AppError('Image not found', 404));
    }

    settings.hero.images = settings.hero.images.map(img => ({
      ...img,
      isActive: img._id.toString() === imageId
    }));
    
    settings.lastUpdatedAt = new Date();
    settings.version += 1;
    
    await settings.save();

    res.status(200).json({
      status: 'success',
      message: 'Active hero image updated',
      data: { images: settings.hero.images }
    });
  })
};

module.exports = systemSettingsController;