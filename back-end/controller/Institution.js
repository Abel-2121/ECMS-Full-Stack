const crypto = require('crypto');
const bcrypt=require('bcrypt')
const Institution = require('../model/Institution');
const User = require('../model/userModel');
const Election = require('../model/Election');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmailWithTemplate } = require('../services/emailTemplateService');
const Candidate = require('../model/Candidates');
const Vote = require('../model/Vote');
const { getPublicUrl } = require('../middleware/upload');
const institutionController = {
createInstitutionWithAdmin: catchAsync(async (req, res, next) => {
  const {
    name, about, address, code, email, phone, logo,
    
    adminFirstName, adminLastName, adminEmail, adminPhone, adminPassword
  } = req.body;

  if (!name || !address || !code || !email || !phone) {
    return next(new AppError('Please fill all institution required fields', 400));
  }

  if (!adminFirstName || !adminLastName || !adminEmail || !adminPhone || !adminPassword) {
    return next(new AppError('Please fill all admin required fields', 400));
  }

  const existingInstitution = await Institution.findOne({ 
    $or: [{ name }, { code }, { email }] 
  });
  
  if (existingInstitution) {
    return next(new AppError('Institution with this name, code, or email already exists', 400));
  }

  const existingUser = await User.findOne({ email: adminEmail });
  if (existingUser) {
    return next(new AppError('Admin email already registered', 400));
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  const newAdmin = await User.create({
    firstName: adminFirstName,
    lastName: adminLastName,
    email: adminEmail,
    phone: adminPhone,
    password: adminPassword,
    passwordConfirm: adminPassword,
    role: 'electionAdmin',
    isEligible: true,
    emailVerified: true  ,
    skipPasswordValidation: true 
  });

  const institution = await Institution.create({
    name,
    about,
    address,
    code,
    email,
    phone,
    logo,
    requestedBy: req.user.id,
    createdBy: req.user.id,
    status: 'active',
    isConfirmed: true,
    approvedBy: req.user.id,
    approvedAt: new Date()
  });
  
  
     institution.requestedBy= newAdmin._id
    await institution.save();

  newAdmin.institutionId = institution._id;
  await newAdmin.save();

 
  await sendEmailWithTemplate(adminEmail, 'welcomeAdmin', {
    firstName: adminFirstName,
    lastName: adminLastName,
    institutionName: name,
    loginUrl: `${process.env.FRONTEND_URL}/login`,
    email: adminEmail,
    password: adminPassword
  });

  res.status(201).json({
    status: "success",
    message: "Institution and ElectionAdmin created successfully",
    data: {
      institution: {
        _id: institution._id,
        name: institution.name,
        code: institution.code,
        email: institution.email,
        status: institution.status
      },
      admin: {
        _id: newAdmin._id,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        email: newAdmin.email,
        role: newAdmin.role
      }
    }
  });
}),
  sendRequest: catchAsync(async (req, res, next) => {
    const { name, about, address, code, email, phone, logo } = req.body;

    if (!name || !address || !code || !email || !phone) {
      return next(new AppError('Please fill all required fields', 400));
    }

    const existingInstitution = await Institution.findOne({ 
      $or: [{ name }, { code }, { email }] 
    });
    
    if (existingInstitution) {
      return next(new AppError('Institution with this name, code, or email already exists', 400));
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

    const institution = await Institution.create({
      name,
      about,
      address,
      code,
      email,
      phone,
      logo,
      requestedBy: req.user.id,
      createdBy: req.user.id,
      status: 'pending',
      isConfirmed: false,
      verificationToken: hashedToken,
      verificationTokenExpires: Date.now() + 7 * 24 * 60 * 60 * 1000
    });

    const verificationLink = `${process.env.FRONTEND_URL}/verify-institution/${verificationToken}`;
    
    await sendEmailWithTemplate(email, 'institutionVerification', {
      institutionName: name,
      requesterName: `${req.user.firstName} ${req.user.lastName}`,
      requesterEmail: req.user.email,
      verificationLink,
      expiresIn: '7 days'
    });

    res.status(201).json({
      status: "success",
      message: "Your request submitted successfully! Please check your institution email for verification."
    });
  }),

  getVerificationDetails: catchAsync(async (req, res, next) => {
    const { token } = req.params;
     
    const institution = await Institution.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
      status: 'pending',
      isConfirmed: false
    }).populate('requestedBy', 'firstName lastName email');

    if (!institution) {
      return next(new AppError('Invalid or expired verification link', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        institutionName: institution.name,
        institutionCode: institution.code,
        institutionEmail: institution.email,
        requesterName: `${institution.requestedBy.firstName} ${institution.requestedBy.lastName}`,
        requesterEmail: institution.requestedBy.email,
        createdAt: institution.createdAt
      }
    });
  }),
  getVerificationDetails: catchAsync(async (req, res, next) => {
    const { token } = req.params;
     

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
     
    const institution = await Institution.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
      status: 'pending',
      isConfirmed: false
    }).populate('requestedBy', 'firstName lastName email');

    if (!institution) {
      return next(new AppError('Invalid or expired verification link', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        institutionName: institution.name,
        institutionCode: institution.code,
        institutionEmail: institution.email,
        requesterName: `${institution.requestedBy.firstName} ${institution.requestedBy.lastName}`,
        requesterEmail: institution.requestedBy.email,
        createdAt: institution.createdAt
      }
    });
  }),

  confirmVerification: catchAsync(async (req, res, next) => {
    const { token } = req.params;
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const institution = await Institution.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
      status: 'pending',
      isConfirmed: false
    });

    if (!institution) {
      return next(new AppError('Invalid or expired verification link', 404));
    }

    institution.isConfirmed = true;
    institution.verificationToken = undefined;
    institution.verificationTokenExpires = undefined;
    await institution.save();

    const superAdmins = await User.find({ role: 'superAdmin' }).select('email');
    
    for (const admin of superAdmins) {
      await sendEmailWithTemplate(admin.email, 'institutionConfirmed', {
        institutionName: institution.name,
        institutionId: institution._id,
        adminUrl: `${process.env.FRONTEND_URL}/superadmin/manage-institutions`
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Institution verified successfully. Waiting for SuperAdmin approval.'
    });
  }),
  createAdminForInstitution: catchAsync(async (req, res, next) => {
    const { institutionId, firstName, lastName, email, phone, password, role } = req.body;
    
    if (!institutionId || !firstName || !lastName || !email || !password) {
      return next(new AppError('Please provide all required fields', 400));
    }

    const institution = await Institution.findById(institutionId);
    if (!institution) {
      return next(new AppError('Institution not found', 404));
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }
    
    const newAdmin = await User.create({
      firstName,
      lastName,
      email,
      phone: phone || '',
      password,
      passwordConfirm: password,
      role: role || 'electionAdmin',
      institutionId,
      isEligible: true,
      emailVerified: true
    });
    
    
    await sendEmailWithTemplate(email, 'welcomeAdmin', {
      firstName,
      lastName,
      institutionName: institution.name,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      email,
      password
    });
    
    // Remove password from response
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;
    
    res.status(201).json({
      status: 'success',
      message: 'Admin created successfully',
      data: { admin: adminResponse }
    });
  }),
 
  getPendingRequests: catchAsync(async (req, res, next) => {
    const pendingInstitutions = await Institution.find({
      status: 'pending',
      isConfirmed: true
    }).populate('requestedBy', 'firstName lastName email phone');

    res.status(200).json({
      status: 'success',
      results: pendingInstitutions.length,
      data: { pendingInstitutions }
    });
  }),

  getPendingRequestById: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const institution = await Institution.findOne({
      _id: id,
      status: 'pending',
      isConfirmed: true
    }).populate('requestedBy', 'firstName lastName email phone');

    if (!institution) {
      return next(new AppError('Pending request not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { institution }
    });
  }),

  approveInstitution: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const institution = await Institution.findOne({
      _id: id,
      status: 'pending',
      isConfirmed: true
    });

    if (!institution) {
      return next(new AppError('Institution not found or not ready for approval', 404));
    }

    institution.status = 'active';
    institution.approvedBy = req.user.id;
    institution.approvedAt = new Date();
    if (adminNotes) institution.adminNotes = adminNotes;
    await institution.save();

    const requester = await User.findByIdAndUpdate(
      institution.requestedBy,
      { 
        role: 'electionAdmin', 
        institutionId: institution._id,
        isEligible: true
      },
      { new: true, runValidators: true }
    );

    await sendEmailWithTemplate(requester.email, 'institutionApproved', {
      institutionName: institution.name,
      loginUrl: process.env.FRONTEND_URL,
      role: 'Election Admin'
    });

    const populatedInstitution = await Institution.findById(id)
      .populate('requestedBy', 'firstName lastName email role')
      .populate('approvedBy', 'firstName lastName email');

    res.status(200).json({
      status: 'success',
      message: 'Institution approved successfully',
      data: { institution: populatedInstitution }
    });
  }),

  rejectInstitution: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return next(new AppError('Rejection reason is required', 400));
    }

    const institution = await Institution.findOne({
      _id: id,
      status: 'pending'
    });

    if (!institution) {
      return next(new AppError('Institution not found', 404));
    }

    institution.status = 'rejected';
    institution.rejectionReason = rejectionReason;
    institution.rejectedBy = req.user.id;
    institution.rejectedAt = new Date();
    await institution.save();

    const requester = await User.findById(institution.requestedBy);
    
    await sendEmailWithTemplate(requester.email, 'institutionRejected', {
      institutionName: institution.name,
      rejectionReason: rejectionReason,
      supportEmail: process.env.SUPPORT_EMAIL
    });

    res.status(200).json({
      status: 'success',
      message: 'Institution request rejected',
      data: { institution }
    });
  }),

  getInstitution: catchAsync(async (req, res, next) => {
    const { status, search } = req.query;
    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const institutions = await Institution.find(filter)
      .populate('requestedBy', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: institutions.length,
      data: { institutions }
    });
  }),

  getInstitutionById: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const institution = await Institution.findById(id)
      .populate('requestedBy', 'firstName lastName email phone role createdAt')  // Primary admin
      .populate('approvedBy', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email');
  
    if (!institution) {
      return next(new AppError('Institution not found', 404));
    }
  
    const allAdmins = await User.find({ 
      institutionId: id, 
      role: 'electionAdmin' 
    }).select('firstName lastName email phone createdAt lastLogin');
  
    // Get stats
    const totalElections = await Election.countDocuments({ institutionId: id });
    
    const elections = await Election.find({ institutionId: id }).select('_id');
    const electionIds = elections.map(e => e._id);
    
    const totalVoters = await User.countDocuments({ 
      institutionId: id, 
      role: { $in: ['voter', 'user'] } 
    });
    
    const totalCandidates = await Candidate.countDocuments({ 
      electionId: { $in: electionIds },
      status: 'approved'
    });
    
    const totalVotesCast = await Vote.countDocuments({ 
      electionId: { $in: electionIds } 
    });
  
    res.status(200).json({
      status: 'success',
      data: { 
        institution,
        admins: allAdmins,  // All election admins for this institution
        stats: {
          totalElections,
          totalVoters,
          totalCandidates,
          totalVotesCast
        }
      }
    });
  }),


  updateInstitution: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const institution = await Institution.findById(id);
    if (!institution) {
      return next(new AppError('Institution not found', 404));
    }
    
    const hasElections = await Election.exists({ institutionId: id });
    
    if (hasElections && status === 'inactive') {
      return next(new AppError(
        'Cannot deactivate institution that has elections. Complete or delete all elections first.',
        400
      ));
    }
    
    if (req.file) {
    updateData.logo = getPublicUrl(req.file.path || req.file.filename);
  }
    // SuperAdmin can only update status
    const updateData = {};
    if (status) {
      updateData.status = status;
      updateData.updatedBy = req.user.id;
    } else {
      return next(new AppError('SuperAdmin can only update institution status', 403));
    }

    if (req.file) {
      updateData.logo = getPublicUrl(req.file.path || req.file.filename);
    }
    
    const updatedInstitution = await Institution.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      data: { institution: updatedInstitution }
    });
  }),
  
  deleteInstitution: catchAsync(async (req, res, next) => {
    const { id } = req.params;
  
    const institution = await Institution.findById(id);
    if (!institution) {
      return next(new AppError('Institution not found', 404));
    }
  
    const electionCount = await Election.countDocuments({ institutionId: id });
    
    if (electionCount > 0) {
      return next(new AppError(
        `Cannot delete institution with ${electionCount} election(s). Delete all elections first.`,
        400
      ));
    }
    
    const userCount = await User.countDocuments({ institutionId: id });
    if (userCount > 0) {
      return next(new AppError(
        `Cannot delete institution with ${userCount} associated user(s). Reassign or remove users first.`,
        400
      ));
    }
    
    const institutions = await Institution.findByIdAndDelete(id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  }),


  // ==================== ELECTION ADMIN: GET THEIR INSTITUTION ====================
  getInstitutionforOwner: catchAsync(async (req, res, next) => {
    const { institutionId } = req.user;
    
    if (!institutionId) {
      return next(new AppError('No institution assigned', 404));
    }
    
    const institution = await Institution.findById(institutionId);
    
    if (!institution) {
      return next(new AppError('Institution not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: { institution }
    });
  }),
updateInstitutionforOwner: catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Check if institution belongs to the admin
  const institution = await Institution.findOne({ 
    _id: id, 
    _id: req.user.institutionId 
  });
  
  if (!institution) {
    return next(new AppError('Institution not found or you are not authorized', 404));
  }
  
  const updateData = {};
  
  if (req.body.name !== undefined) updateData.name = req.body.name;
  if (req.body.about !== undefined) updateData.about = req.body.about;
  if (req.body.address !== undefined) updateData.address = req.body.address;
  if (req.body.phone !== undefined) updateData.phone = req.body.phone;
  if (req.body.email !== undefined) updateData.email = req.body.email;
  if (req.body.alternatePhone !== undefined) updateData.alternatePhone = req.body.alternatePhone;
  if (req.body.fax !== undefined) updateData.fax = req.body.fax;
  if (req.body.poBox !== undefined) updateData.poBox = req.body.poBox;
  if (req.body.website !== undefined) updateData.website = req.body.website;
  
  if (req.body.socialMedia !== undefined) {
    try {
      updateData.socialMedia = typeof req.body.socialMedia === 'string' 
        ? JSON.parse(req.body.socialMedia) 
        : req.body.socialMedia;
    } catch (e) {
      updateData.socialMedia = institution.socialMedia;
    }
  }
  
  if (req.file) {
    updateData.logo = req.file.path; 
  }
  
  // Update updatedBy timestamp
  updateData.updatedBy = req.user.id;
  
  const updatedInstitution = await Institution.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
  
  res.status(200).json({
    status: 'success',
    data: { institution: updatedInstitution }
  });
}),
};

module.exports = institutionController;