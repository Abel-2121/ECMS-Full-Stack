const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please tell us your first name!'],
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    lastName: {
      type: String,
      required: [true, 'Please tell us your last name!'],
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email']
    },
    emailVerificationOTP: {
      type: String,
      select: false
    },

    emailVerificationOTPExpires: {
      type: Date,
      select: false
    },

    emailVerified: {
      type: Boolean,
      default: false
    },
    photo: {
      type: String,
      default: 'default.jpg'
    },

    role: {
      type: String,
      enum: ['voter', 'candidate', 'electionAdmin', 'superAdmin'],
      default: 'voter'
    },

    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false
    },

    passwordConfirm: {
      type: String,
      required: function() {
   
        return this.isNew && this.role !== 'electionAdmin';
      },
      validate: {
        validator: function (el) {
          if (!this.password) return true;
          return el === this.password;
        },
        message: 'Passwords are not the same'
      }
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    passwordChangedAt: Date,
    lastLogin:Date,
    passwordResetToken: String,

    passwordResetExpires: Date,
    refreshToken: {
      type: String ,
      default: null
    },
    active: {
      type: Boolean,
      default: true,
      select: false
    },
    phone: {
      type: String,
      validate: {
        validator: function (val) {
          return validator.isMobilePhone(val + '');
        },
        message: 'Please provide a valid phone number'
      }
    },
    address: {
      type: String,
      trim: true
    },
    isEligible: {
      type: Boolean,
      default: false
    },
    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date
    },

    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    lockUntil: {
      type: Date,
      default: null
    },
    
    lastLoginAt: Date,
    lastLoginIP: String,
    
    isActive: {
      type: Boolean,
      default: true
    },
    
    suspendedUntil: Date,
    suspensionReason: String
  },

  
  {
    timestamps: true 
  }
);


userSchema.index({ institutionId: 1, role: 1, emailVerified: 1 });
userSchema.pre('save', async function () {

  if (!this.isModified('password')) return;

  
  this.password = await bcrypt.hash(this.password, 12);

  
  this.passwordConfirm = undefined;
});



userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});




userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};



userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};



userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 min

  return resetToken;
};
userSchema.methods.isAccountLocked = function() {
  if (this.isLocked && this.lockUntil && this.lockUntil > new Date()) {
    return true;
  }
  if (this.isLocked && this.lockUntil <= new Date()) {
    this.isLocked = false;
    this.lockUntil = null;
    this.failedLoginAttempts = 0;
  }
  return false;
};

userSchema.methods.recordFailedLogin = async function(ip) {
  this.failedLoginAttempts = (this.failedLoginAttempts || 0) + 1;
  
  if (this.failedLoginAttempts >= 5) {
    this.isLocked = true;
    this.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
  }
  
  await this.save();
  return this.failedLoginAttempts;
};

userSchema.methods.resetLockout = async function() {
  this.failedLoginAttempts = 0;
  this.isLocked = false;
  this.lockUntil = null;
  await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
