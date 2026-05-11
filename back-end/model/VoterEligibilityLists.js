const mongoose = require('mongoose');
const EthiopianDate = require('ethiopian-date');

const VoterEligibilityListsSchema = new mongoose.Schema(
  {
    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: [true, 'Election reference is required']
    },

    institutionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: [true, 'Institution reference is required']
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Uploader reference is required']
    },

    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true
    },

    fileUrl: {
      type: String,
      trim: true
    },

    totalRecords: {
      type: Number,
      default: 0,
      min: 0
    },

    validRecords: {
      type: Number,
      default: 0,
      min: 0
    },

    invalidRecords: {
      type: Number,
      default: 0,
      min: 0
    },

    eligibleVoters: [
      {
        firstName: {
          type: String,
          required: true,
          trim: true
        },
        lastName: {
          type: String,
          required: true,
          trim: true
        },
        email: {
          type: String,
          required: true,
          lowercase: true,
          trim: true
        },
        phone: {
          type: String,
          trim: true
        },
        electionId: {
          type: String,
          required: true
        },
        voterId: {
          type: String,
          unique: true,
          sparse: true
        },
        isRegistered: {
          type: Boolean,
          default: false
        },
        isVerified: {
          type: Boolean,
          default: false
        },
        hasVoted: {
          type: Boolean,
          default: false
        }
      }
    ],

    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },

    uploadedAt: {
      type: Date,
      default: Date.now
    },

    processedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

VoterEligibilityListsSchema.index({ electionId: 1 }, { unique: true });
VoterEligibilityListsSchema.index({ institutionId: 1 });
VoterEligibilityListsSchema.index({ status: 1 });
VoterEligibilityListsSchema.index({ 'eligibleVoters.email': 1 });
VoterEligibilityListsSchema.index({ 'eligibleVoters.studentId': 1 });

const VoterEligibilityLists = mongoose.model('VoterEligibilityLists', VoterEligibilityListsSchema);

module.exports = VoterEligibilityLists;