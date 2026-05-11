const User = require('../../model/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const sendEmail = require('../../services/sendEmail');
const { sendEmailWithTemplate } = require('../../services/emailTemplateService');
const { createSendToken, signTokens } = require('./tokenHandler');
const { generateSecureOTP } = require('../../utils/otpGenerator');
const { OAuth2Client } = require('google-auth-library');
const VoterEligibilityLists = require('../../model/VoterEligibilityLists');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authController = {
  signup: catchAsync(async (req, res, next) => {
    const { firstName, lastName, email, password, passwordConfirm } = req.body;
    
    if (!firstName || !lastName || !email || !password || !passwordConfirm) {
      return next(new AppError("Please fill all required fields", 400));
    }
    
    if (password.length < 8) {
      return next(new AppError("Password is too short (minimum 8 characters)", 400));
    }
    
    if (password !== passwordConfirm) {
      return next(new AppError("Passwords do not match", 400));
    }
  
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("User with this email already exists", 400));
    }
  
    const otp = generateSecureOTP();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  
    const newUser = await User.create({ 
      firstName, lastName, email, password, passwordConfirm,
      emailVerificationOTP: hashedOTP,
      emailVerificationOTPExpires: Date.now() + 10 * 60 * 1000
    });
  
    // Assign institution from eligibility list
    const eligibilityList = await VoterEligibilityLists.findOne({
      'eligibleVoters.email': email
    });
  
    if (eligibilityList) {
      const voter = eligibilityList.eligibleVoters.find(v => v.email === email);
      if (voter) {
        newUser.institutionId = eligibilityList.institutionId;
        newUser.isEligible = true;
        await newUser.save();  
      }
    }
  
    await sendEmailWithTemplate(email, 'verificationOTP', { otp });
  
    res.status(201).json({
      status: "success",
      message: "Verification OTP sent to your email. Please check your inbox."
    });
  }),

  verifyOTP: catchAsync(async (req, res, next) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next(new AppError("Please provide email and OTP", 400));
    }

    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    const user = await User.findOne({
      email,
      emailVerificationOTP: hashedOTP,
      emailVerificationOTPExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError("Invalid or expired OTP", 400));
    }

    user.emailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const message = "Email verified successfully";
    await createSendToken(user, res, message);
  }),

  resendOTP: catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
      return next(new AppError("Please provide email", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.emailVerified) {
      return next(new AppError("Email already verified", 400));
    }

    const otp = generateSecureOTP();
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');

    user.emailVerificationOTP = hashedOTP;
    user.emailVerificationOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendEmailWithTemplate(email, 'resendOTP', { otp });

    res.status(200).json({
      status: "success",
      message: "New OTP sent to your email"
    });
  }),

  login: catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Please provide email and password", 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401));
    }

    if (!user.emailVerified) {
      return next(new AppError("Please verify your email using the OTP sent to your inbox", 401));
    }

    user.lastLogin = new Date();
    const message = "Logged in successfully";
    
    await createSendToken(user, res, message);
  }),

  googleLogin: catchAsync(async (req, res, next) => {
    const { credential } = req.body; 
  
    if (!credential) {
      return next(new AppError("No credential provided", 400));
    }
  
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
  
    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name, family_name, picture, email_verified } = payload;
  
    if (!email_verified) {
      return next(new AppError("Google email not verified", 400));
    }
  
    let user = await User.findOne({ email });
  
    if (!user) {
      user = await User.create({
        firstName: given_name,
        lastName: family_name,
        email,
        googleId,
        photo: picture,
        password: undefined,
        emailVerified: true
      });
    }
  
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save({ validateBeforeSave: false });
    }
    
    user.lastLogin = new Date();
    const message = "Logged in with Google successfully";
    createSendToken(user, res, message, 200);
  }),




  // backend/controller/user/authController.js - Refresh method
  refresh: catchAsync(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
     
    if (!refreshToken) {
      return next(new AppError("No refresh token found. Please login again.", 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    } catch (err) {
      return next(new AppError("Invalid or expired refresh token. Please login again.", 401));
    }
    
    const userByToken = await User.findOne({ refreshToken: refreshToken });
   
    const user = await User.findOne({
      _id: decoded.id,
      refreshToken: refreshToken
    });
    
    const userById = await User.findById(decoded.id);
    
    
    
    if (!user) {
      return next(new AppError("Invalid refresh token. Please login again.", 401));
    }
    
    const { accessToken, refreshToken: newRefreshToken } = signTokens(user._id, user.email);
    
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });
    
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    
    console.log('=== REFRESH SUCCESS ===');
    res.status(200).json({
      status: "success",
      accessToken: accessToken,
    });
  }),





  logout: catchAsync(async (req, res, next) => {
    
    if (req.user) {
    
      
      req.user.refreshToken = null;
      await req.user.save({ validateBeforeSave: false });
      
      // Verify it was saved
      const updatedUser = await User.findById(req.user._id);
    } else {
    }
  
    // Clear cookies
    res.clearCookie('refreshToken', { path: '/' });
    res.clearCookie('isLoggedIn', { path: '/' });
    

  
    res.status(200).json({
      status: "success",
      message: "Logged out successfully"
    });
  }),



  forgotPassword: catchAsync(async (req, res, next) => {
    const { email } = req.body;
    
    if (!email) {
      return next(new AppError("Please provide email", 400));
    }
  
    const user = await User.findOne({ email });
  
    if (!user) {
      return next(new AppError('There is no user with this email address.', 404));
    }
  
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
  
    try {

      const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetURL = `${frontendURL}/reset-password/${resetToken}`;
 
      
      await sendEmailWithTemplate(email, 'passwordReset', { resetURL });
  
      res.status(200).json({
        status: "success",
        message: "Password reset link sent to your email."
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      
      return next(new AppError("Error sending email. Try again later.", 500));
    }
  }),

  resetPassword: catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { password, passwordConfirm } = req.body;
  
    if (!token) {
      return next(new AppError("Invalid token", 401));
    }
  
    if (!password || !passwordConfirm) {
      return next(new AppError("Please provide password and password confirmation", 400));
    }
  
    if (password !== passwordConfirm) {
      return next(new AppError("Passwords do not match", 400));
    }
  
    if (password.length < 8) {
      return next(new AppError("Password is too short (minimum 8 characters)", 400));
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
  
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }  
    });
  
    if (!user) {
      return next(new AppError("Token is invalid or has expired", 400));
    }
  
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();
  
    const message = "Password reset successful";
    await createSendToken(user, res, message);
  }),

  changePassword: catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword, newPasswordConfirm } = req.body;

    if (!currentPassword || !newPassword || !newPasswordConfirm) {
      return next(new AppError("Please provide all password fields", 400));
    }

    if (newPassword !== newPasswordConfirm) {
      return next(new AppError("New passwords do not match", 400));
    }

    if (newPassword.length < 8) {
      return next(new AppError("Password is too short (minimum 8 characters)", 400));
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(currentPassword, user.password))) {
      return next(new AppError("Current password is incorrect", 401));
    }

    user.password = newPassword;
    user.passwordConfirm = newPasswordConfirm;
    user.passwordChangedAt = Date.now();
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password changed successfully"
    });
  })
};

module.exports = authController;