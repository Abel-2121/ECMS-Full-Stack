const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const User = require('../../model/userModel');
const bcrypt = require('bcrypt');
const { getPublicUrl } = require('../../middleware/upload');

const userController = {
  getMyProfile: catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id)
      .select('-password -refreshToken -passwordResetToken -passwordResetExpires')
      .populate('institutionId', 'name code logo');
    
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  }),

  // Update user profile
  updateMyProfile: catchAsync(async (req, res, next) => {
    const allowedFields = ['firstName', 'lastName', 'phone', 'address'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken -passwordResetToken -passwordResetExpires');
    
    res.status(200).json({
      status: 'success',
      data: { user },
      message: 'Profile updated successfully'
    });
  }),

  // Change password
  changePassword: catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;
    
    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return next(new AppError('Please provide all password fields', 400));
    }
    
    if (newPassword !== newPasswordConfirm) {
      return next(new AppError('New passwords do not match', 400));
    }
    
    if (newPassword.length < 8) {
      return next(new AppError('Password must be at least 8 characters', 400));
    }
    
    const user = await User.findById(req.user.id).select('+password');
    
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return next(new AppError('Current password is incorrect', 401));
    }
    
    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    user.passwordChangedAt = Date.now();
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully'
    });
  }),

  // Upload profile avatar
  uploadAvatar: catchAsync(async (req, res, next) => {
    if (!req.file) {
      return next(new AppError('Please upload an image', 400));
    }
    
    // Build full URL for the avatar
    const avatarUrl = getPublicUrl(req.file.path || req.file.filename);
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { photo: avatarUrl },
      { new: true }
    ).select('-password');
    
    res.status(200).json({
      status: 'success',
      data: { user },
      message: 'Avatar uploaded successfully'
    });
  }),

  // Remove avatar
  removeAvatar: catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { photo: 'default.jpg' },
      { new: true }
    ).select('-password');
    
    res.status(200).json({
      status: 'success',
      data: { user },
      message: 'Avatar removed successfully'
    });
  })
};

module.exports = userController;