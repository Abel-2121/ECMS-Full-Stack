// backend/controller/adminController.js
const User = require('../model/userModel');
const Election = require('../model/Election');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmailWithTemplate } = require('../services/emailTemplateService');
const crypto = require('crypto');

const adminController = {


  getAllAdmins: catchAsync(async (req, res, next) => {
    
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('You do not have permission to view all admins', 403));
    }
  
    const admins = await User.find({ role: { $in: ['superAdmin', 'electionAdmin'] } })
      .select('-password -refreshToken -passwordResetToken -passwordResetExpires')
      .populate('institutionId', 'name code')
      .sort('-createdAt')
      .lean(); 
 
    const transformedAdmins = admins.map(admin => ({
      ...admin,
      institutionName: admin.institutionId?.name || 'N/A',
      institutionCode: admin.institutionId?.code || 'N/A'
    }));
  
    const stats = {
      total: admins.length,
      active: admins.filter(a => a.status === 'Active').length,
      inactive: admins.filter(a => a.status === 'Inactive').length,
      superAdmins: admins.filter(a => a.role === 'superAdmin').length,
      electionAdmins: admins.filter(a => a.role === 'electionAdmin').length
    };
  
    res.status(200).json({
      status: 'success',
      results: admins.length,
      data: { admins: transformedAdmins },
      stats
    });
  }),
  
  
  getAdminStats: catchAsync(async (req, res, next) => {
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('You do not have permission to view admin statistics', 403));
    }

    const totalAdmins = await User.countDocuments({ role: { $in: ['superAdmin', 'electionAdmin'] } });
    const activeAdmins = await User.countDocuments({ 
      role: { $in: ['superAdmin', 'electionAdmin'] },
      status: 'Active'
    });
    const inactiveAdmins = await User.countDocuments({ 
      role: { $in: ['superAdmin', 'electionAdmin'] },
      status: 'Inactive'
    });
    const superAdmins = await User.countDocuments({ role: 'superAdmin' });
    const electionAdmins = await User.countDocuments({ role: 'electionAdmin' });
  
    res.status(200).json({
      status: 'success',
      data: {
        total: totalAdmins,
        active: activeAdmins,
        inactive: inactiveAdmins,
        superAdmins: superAdmins,
        electionAdmins: electionAdmins
      }
    });
  }),
 
  getAdminById: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const admin = await User.findById(id)
      .select('-password -refreshToken -passwordResetToken -passwordResetExpires')
      .populate('institutionId', 'name code');
    
    if (!admin) {
      return next(new AppError('Admin not found', 404));
    }
    
  
    if (req.user.role !== 'superAdmin' && req.user.id !== admin._id.toString()) {
      return next(new AppError('You do not have permission to view this admin', 403));
    }
    
    res.status(200).json({
      status: 'success',
      data: { admin }
    });
  }), 

  createAdmin: catchAsync(async (req, res, next) => {
    const { firstName, lastName, email, phone, role, institutionId } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    
    const tempPassword = crypto.randomBytes(8).toString('hex');
   
    let institutionName = '';
    if (institutionId) {
      const institution = await require('../model/Institution').findById(institutionId);
      institutionName = institution ? institution.name : '';
    }
    
    // Create new admin
    const newAdmin = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password: tempPassword,
      passwordConfirm: tempPassword,
      role: role || 'electionAdmin',
      institutionId: institutionId || null,
      status: 'Active',
      emailVerified: true // Admins don't need email verification
    });

    try {
      await sendEmailWithTemplate(email, 'welcomeAdmin', {
        firstName,
        lastName,
        institutionName,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        email: email,
        password: tempPassword
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the request if email fails
    }


    newAdmin.password = undefined;
    newAdmin.passwordConfirm = undefined;

    res.status(201).json({
      status: 'success',
      message: 'Admin created successfully. Welcome email sent.',
      data: { admin: newAdmin }
    });
  }),

  
  updateAdmin: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { firstName, lastName, phone, role, institutionId } = req.body;

    // Find admin
    const admin = await User.findById(id);
    if (!admin) {
      return next(new AppError('Admin not found', 404));
    }

    // Check permissions
    if (req.user.role !== 'superAdmin' && req.user.id !== admin._id.toString()) {
      return next(new AppError('You do not have permission to update this admin', 403));
    }

    // Update fields
    if (firstName) admin.firstName = firstName;
    if (lastName) admin.lastName = lastName;
    if (phone) admin.phone = phone;
    
    // Only superAdmin can change role and institution
    if (req.user.role === 'superAdmin') {
      if (role) admin.role = role;
      if (institutionId) admin.institutionId = institutionId;
    }

    await admin.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      message: 'Admin updated successfully',
      data: { admin }
    });
  }),

  toggleAdminStatus: catchAsync(async (req, res, next) => {
    const { id } = req.params;
  
    const admin = await User.findById(id);
    if (!admin) return next(new AppError('Admin not found', 404));
    if (req.user.role !== 'superAdmin') return next(new AppError('Permission denied', 403));
    if (admin._id.toString() === req.user.id) return next(new AppError('Cannot deactivate yourself', 400));
    
    // Only check active elections when trying to deactivate
    if (admin.status === 'Active') {
      const activeElection = await Election.findOne({
        createdBy: admin._id,
        status: { $in: ['registration_open','registration_closed','nomination_open','nomination_closed','voting_open','voting_closed','completed'] }
      }).select('title');
      
      if (activeElection) {
        return next(new AppError(`Cannot deactivate. Admin managing active election: "${activeElection.title}"`, 400));
      }
    }
  
    admin.status = admin.status === 'Active' ? 'Inactive' : 'Active';
    await admin.save({ validateBeforeSave: false });
  
    res.status(200).json({
      status: 'success',
      message: `Admin ${admin.status === 'Active' ? 'activated' : 'deactivated'} successfully`
    });
  }),
  
  deleteAdmin: catchAsync(async (req, res, next) => {
    const { id } = req.params;
  
    const admin = await User.findById(id);
    if (!admin) return next(new AppError('Admin not found', 404));
    if (req.user.role !== 'superAdmin') return next(new AppError('Permission denied', 403));
    if (admin._id.toString() === req.user.id) return next(new AppError('Cannot delete yourself', 400));
  
   
    const hasElections = await Election.exists({ createdBy: admin._id });
    if (hasElections) {
      return next(new AppError('Cannot delete admin who created elections. Reassign or delete elections first.', 400));
    }
  
    await User.findByIdAndDelete(id);
  
    res.status(204).json({ status: 'success', message: 'Admin deleted successfully', data: null });
  }),

  getAdminsByInstitution: catchAsync(async (req, res, next) => {
    const { institutionId } = req.params;
    
  
    if (req.user.role !== 'superAdmin' && req.user.institutionId?.toString() !== institutionId) {
      return next(new AppError('You do not have permission to view these admins', 403));
    }
    
    const admins = await User.find({ 
      institutionId, 
      role: 'electionAdmin' 
    }).select('-password -refreshToken -passwordResetToken -passwordResetExpires');
    
    res.status(200).json({
      status: 'success',
      results: admins.length,
      data: { admins }
    });
  }),

 
  resendInvitation: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const admin = await User.findById(id);
    if (!admin) {
      return next(new AppError('Admin not found', 404));
    }

    if (req.user.role !== 'superAdmin') {
      return next(new AppError('You do not have permission to resend invitations', 403));
    }

    const tempPassword = crypto.randomBytes(8).toString('hex');
    admin.password = tempPassword;
    admin.passwordConfirm = tempPassword;
    admin.passwordChangedAt = undefined;
    await admin.save();

    let institutionName = '';
    if (admin.institutionId) {
      const institution = await require('../model/Institution').findById(admin.institutionId);
      institutionName = institution ? institution.name : '';
    }

    try {
      await sendEmailWithTemplate(admin.email, 'welcomeAdmin', {
        firstName: admin.firstName,
        lastName: admin.lastName,
        institutionName,
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        email: admin.email,
        password: tempPassword
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      return next(new AppError('Failed to send invitation email', 500));
    }

    res.status(200).json({
      status: 'success',
      message: 'Invitation resent successfully'
    });
  }),


  sendWelcomeEmail: catchAsync(async (req, res, next) => {
    const { email, firstName, lastName, institutionName, password } = req.body;

    try {
      await sendEmailWithTemplate(email, 'welcomeAdmin', {
        firstName,
        lastName,
        institutionName: institutionName || 'Your Institution',
        loginUrl: `${process.env.FRONTEND_URL}/login`,
        email,
        password
      });

      res.status(200).json({
        status: 'success',
        message: 'Welcome email sent successfully'
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return next(new AppError('Failed to send welcome email', 500));
    }
  })
};

module.exports = adminController;