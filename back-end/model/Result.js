const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    resultId: {
      type: String,
      unique: true,
      sparse: true
    },

    electionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Election',
      required: [true, 'Election reference is required'],
      unique: true
    },

    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Publisher reference is required']
    },

    publishedAt: {
      type: Date,
      default: Date.now
    },

    summary: {
      totalEligibleVoters: { type: Number, default: 0 },
      totalVotesCast: { type: Number, default: 0 },
      turnoutPercentage: { type: Number, default: 0 },
      totalPositions: { type: Number, default: 0 },
      totalCandidates: { type: Number, default: 0 }
    },

    results: [
      {
        positionId: { type: String, required: true },
        positionName: { type: String, required: true },
        electionType: {
          type: String,
          enum: ['single_winner', 'multiple_winners', 'ranked'],
          default: 'single_winner'
        },
        totalSeats: { type: Number, default: 1 },
        totalVotesForPosition: { type: Number, default: 0 },
        candidates: [
          {
            candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' },
            candidateName: { type: String, required: true },
            votes: { type: Number, default: 0 },
            percentage: { type: Number, default: 0 },
            winner: { type: Boolean, default: false },
            rank: { type: Number, default: null },
            electedRole: { type: String, default: null }
          }
        ],
        seatAllocation: [
          {
            rank: { type: Number },
            roleName: { type: String },
            description: { type: String }
          }
        ]
      }
    ],

    isPublished: {
      type: Boolean,
      default: true
    },

    auditLog: {
      calculatedAt: { type: Date },
      tieBreakingApplied: { type: Boolean, default: false },
      tieBreakingDetails: { type: String }
    }
  },
  {
    timestamps: true
  }
);

// Indexes
resultSchema.index({ resultId: 1 }, { unique: true, sparse: true });
resultSchema.index({ electionId: 1 }, { unique: true });
resultSchema.index({ publishedAt: -1 });

// Pre-validate middleware
resultSchema.pre('validate', function(next) {
  if (!this.resultId) {
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.resultId = `RES-${Date.now()}-${random}`;
  }
  next();
});

// Method to check if results are published
resultSchema.statics.isPublished = async function(electionId) {
  const result = await this.findOne({ electionId });
  return !!result;
};

// Virtual for formatted date
resultSchema.virtual('formattedDate').get(function() {
  return this.publishedAt.toLocaleDateString();
});

resultSchema.set('toJSON', { virtuals: true });
resultSchema.set('toObject', { virtuals: true });

const Result = mongoose.model('Result', resultSchema);
module.exports = Result;