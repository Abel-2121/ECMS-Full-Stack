const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
  {
    voteId: {
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

    voterId: {
      type: String,
     
    },

    votes: [
      {
        positionId: {
          type: String,
          required: true
        },
        positionName: {
          type: String,
          required: true
        },
        candidateId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Candidate',
          required: true
        },
        candidateName: {
          type: String,
          required: true
        },
        rank: { 
          type: Number, 
          default: null 
        }
      }
    ],

    confirmationCode: {
      type: String,
      unique: true,
      sparse: true
    },

    castAt: {
      type: Date,
      default: Date.now
    },

    userAgent: {
      type: String
    },

    isValid: {
      type: Boolean,
      default: true
    },

    receiptSent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes
voteSchema.index({ voteId: 1 }, { unique: true, sparse: true });
voteSchema.index({ electionId: 1, userId: 1 }, { unique: true }); 
voteSchema.index({ electionId: 1, voterId: 1 });
voteSchema.index({ confirmationCode: 1 }, { unique: true, sparse: true });
voteSchema.index({ castAt: -1 });
voteSchema.index({ electionId: 1, castAt: -1 });

voteSchema.pre('validate', function(next) {
  if (!this.voteId) {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.voteId = `VOTE-${Date.now()}-${random}`;
  }
  
  if (!this.confirmationCode) {
    const crypto = require('crypto');
    this.confirmationCode = crypto.randomBytes(8).toString('hex').toUpperCase();
  }
  
  next();
});

voteSchema.statics.hasVoted = async function(electionId, userId) {
  const vote = await this.findOne({ electionId, userId });
  return !!vote;
};

voteSchema.statics.getVoteCountForCandidate = async function(electionId, candidateId) {
  return await this.countDocuments({
    electionId,
    'votes.candidateId': candidateId
  });
};

voteSchema.statics.getTotalVotesInElection = async function(electionId) {
  return await this.countDocuments({ electionId });
};

voteSchema.virtual('summary').get(function() {
  return {
    voteId: this.voteId,
    electionId: this.electionId,
    castAt: this.castAt,
    positionsVoted:this.votes ? this.votes.length : 0,
    confirmationCode: this.confirmationCode
  };
});

voteSchema.set('toJSON', { virtuals: true });
voteSchema.set('toObject', { virtuals: true });

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;