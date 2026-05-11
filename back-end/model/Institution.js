const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Institution name is required'],
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    about:{
        type: String,
        trim: true,
        minlength: 50,
        maxlength: 500
    },
    code: {
      type: String,
      required: [true, 'Institution code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },

    address: {
      type: String,
      trim: true
    },

    phone: {
      type: String,
      trim: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true
    },

    logo: {
      type: String,
      default: 'default-institution.jpg'
    },

    status: {
      type: String,
      enum: ['pending','active','approved', 'inactive','rejected'],
      default: 'pending'
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isConfirmed: {
      type: Boolean,
      default: false
    },
    approvedAt: {
      type: Date
    },
    verificationToken: {
      type: String,
      select: false
    },

    verificationTokenExpires: {
      type: Date,
      select: false
    },
    website: {
      type: String,
      trim: true,
      default: ''
    },
    socialMedia: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      instagram: { type: String, default: '' }
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: ''
    },
    fax: {
      type: String,
      trim: true,
      default: ''
    },
    poBox: {
      type: String,
      trim: true,
      default: ''
    },
    
   

 
    
  
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

  },
 
  {
    timestamps: true
  }
);

institutionSchema.index({ name: 1 }, { unique: true });
institutionSchema.index({ code: 1 }, { unique: true });
institutionSchema.index({ status: 1 });
institutionSchema.index({ isConfirmed: 1 });


const Institution = mongoose.model('Institution', institutionSchema);

module.exports = Institution;
