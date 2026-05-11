const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema(
  {
    nominationId: {
      type: String,
      unique: true,
      sparse: true
    },

    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: [true, 'Election reference is required']
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },

    positionId: {
      type: String,
      required: [true, 'Position ID is required']
    },

    positionName: {
      type: String,
      required: [true, 'Position name is required'],
      trim: true
    },
    electedRank: {
      type: Number,
      default: null
    },

    electedRole: {
      type: String,
      trim: true
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'withdrawn', 'elected'],
      default: 'pending'
    },

    // Campaign Materials
    campaignPhoto: {
      type: String,
      default: 'default-candidate.jpg'
    },

    biography: {
      type: String,
      maxlength: 2000,
      trim: true
    },

    manifesto: {
      type: String,
      required: [true, 'Manifesto is required'],
      maxlength: 5000,
      trim: true
    },

    slogan: {
      type: String,
      maxlength: 200,
      trim: true
    },

    // Supporting Documents
    supportingDocuments: [
      {
        documentType: {
          type: String,
          enum: ['nomination_form', 'transcript', 'noc', 'recommendation_letter', 'other'],
          required: true
        },
        fileUrl: {
          type: String,
          required: true
        },
        uploadedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    declarations: {
      codeOfConduct: {
        type: Boolean,
        default: false
      },
      spendingLimit: {
        type: Boolean,
        default: false
      },
      truthfulness: {
        type: Boolean,
        default: false
      }
    },

    adminComments: {
      type: String,
      trim: true
    },

    rejectionReason: {
      type: String,
      trim: true
    },

    appealRequested: {
      type: Boolean,
      default: false
    },

    appealMessage: {
      type: String,
      trim: true
    },

    ballotPosition: {
      type: Number,
      default: null
    },

    submittedAt: {
      type: Date,
      default: Date.now
    },

    reviewedAt: {
      type: Date
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    voteCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);


candidateSchema.index({ nominationId: 1 }, { unique: true, sparse: true });
candidateSchema.index({ electionId: 1, status: 1 });
candidateSchema.index({ electionId: 1, positionId: 1 });
candidateSchema.index({ userId: 1, electionId: 1 }, { unique: true }); 
candidateSchema.index({ ballotPosition: 1 });
candidateSchema.index({ voteCount: -1 }); 
candidateSchema.index({ electionId: 1, status: 1 });


// Pre-validate middleware
candidateSchema.pre('validate', function(next) {
  if (!this.nominationId) {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.nominationId = `NOM-${Date.now()}-${random}`;
  }
  next();
});

// Methods
candidateSchema.methods.canApprove = function() {
  return this.status === 'pending';
};

candidateSchema.methods.approve = function(adminId, comments) {
  if (!this.canApprove()) {
    throw new Error('Candidate cannot be approved');
  }
  this.status = 'approved';
  this.reviewedAt = new Date();
  this.reviewedBy = adminId;
  if (comments) this.adminComments = comments;
  return this;
};

candidateSchema.methods.reject = function(adminId, reason) {
  if (!this.canApprove()) {
    throw new Error('Candidate cannot be rejected');
  }
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.reviewedAt = new Date();
  this.reviewedBy = adminId;
  return this;
};

candidateSchema.methods.requestAppeal = function(message) {
  if (this.status !== 'rejected') {
    throw new Error('Only rejected candidates can appeal');
  }
  this.appealRequested = true;
  this.appealMessage = message;
  return this;
};


candidateSchema.methods.markAsElected = function(rank, role) {
  this.status = 'elected';
  this.electedRank = rank;
  this.electedRole = role;
  return this;
};

// Virtual for full name (populated from User)
candidateSchema.virtual('candidateName', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'firstName lastName email' }
});

// Include virtuals in JSON output
candidateSchema.set('toJSON', { virtuals: true });
candidateSchema.set('toObject', { virtuals: true });

const Candidate = mongoose.model('Candidate', candidateSchema);

module.exports = Candidate;