const mongoose = require('mongoose');
const EthiopianDate = require('ethiopian-date');

const electionSchema = new mongoose.Schema(
{
  electionId: {
    type: String,
    trim: true,
    sparse: true
  },

  title: {
    type: String,
    required: [true, 'Election title is required'],
    trim: true,
    minlength: 3,
    maxlength: 200
  },

  description: {
    type: String,
    required: [true, 'Election description is required'],
    trim: true,
    maxlength: 1000
  },

  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Institution',
    required: true
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  status: {
    type: String,
    enum: [
      'draft',
      'registration_open',
      'registration_closed',   
      'nomination_open',
      'nomination_closed',     
      'voting_open',
      'voting_closed',         
      'results_published',
      'completed'
    ],
    default: 'draft'
  },

  timeline: {
    registrationStart: { type: Date, required: true },
    registrationEnd: { type: Date, required: true },
    nominationStart: { type: Date, required: true },
    nominationEnd: { type: Date, required: true },
    votingStart: { type: Date, required: true },
    votingEnd: { type: Date, required: true },
    resultPublicationDate: { type: Date, required: true }
  },

  positions: [
    {
      positionId: { type: String, required: true },

      positionName: {
        type: String,
        required: true,
        trim: true
      },

      positionDescription: {
        type: String,
        trim: true
      },

      // NEW: Election type for this position
      electionType: {
        type: String,
        enum: ['single_winner', 'multiple_winners', 'ranked'],
        default: 'single_winner'
      },

      totalSeats: {
        type: Number,
        default: 1,
        min: 1
      },

      seatAllocation: [
        {
          rank: { type: Number, required: true },
          roleName: { type: String, required: true },
          description: { type: String }
        }
      ],

      maxCandidates: {
        type: Number,
        default: 5,
        min: 1
      },

      requiredDocuments: {
        type: [String],
        default: ['photo', 'manifesto']
      },

      eligibilityRules: {
        minGPA: { type: Number, min: 0, max: 4 },
        allowedDepartments: { type: [String], default: [] },
        allowedYears: { type: [Number], default: [] }
      }
    }
  ],

  votingRules: {
    isSingleVotePerPosition: { type: Boolean, default: true },
    allowBlankVotes: { type: Boolean, default: false },
    minimumSelectionsPerPosition: { type: Number, default: 1, min: 0 },
    requireAllPositions: { type: Boolean, default: true }
  },

  eligibilityCriteria: {
    minAge: { type: Number, min: 0 },
    maxAge: { type: Number, default: null },
    allowedDepartments: { type: [String], default: [] },
    allowedYears: { type: [Number], default: [] }
  },

  statistics: {
    totalEligibleVoters: { type: Number, default: 0, min: 0 },
    totalVotesCast: { type: Number, default: 0, min: 0 },
    totalCandidates: { type: Number, default: 0, min: 0 }
  },
  isVoterListReady:{
      type:Boolean,
      default:false
  }
},

{
  timestamps: true
}
);

// Indexes
electionSchema.index({ electionId: 1 }, { unique: true });
electionSchema.index({ institutionId: 1 });
electionSchema.index({ createdBy: 1 });
electionSchema.index({ status: 1 });


electionSchema.methods.isRegistrationOpen = function () {
  const now = new Date();
  return now >= this.timeline.registrationStart && now <= this.timeline.registrationEnd;
};

electionSchema.methods.isNominationOpen = function () {
  const now = new Date();
  return now >= this.timeline.nominationStart && now <= this.timeline.nominationEnd;
};

electionSchema.methods.isVotingOpen = function () {
  const now = new Date();
  return now >= this.timeline.votingStart && now <= this.timeline.votingEnd;
};

electionSchema.methods.hasVotingEnded = function () {
  return new Date() > this.timeline.votingEnd;
};


electionSchema.pre('validate', function (next) {
  if (!this.electionId) {
    const now = new Date();
    let year;
    try {
      const eth = EthiopianDate.toEthiopian(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate()
      );
      year = eth[0];
    } catch (err) {
      console.log("EthiopianDate error:", err);
      year = now.getFullYear();
    }
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    this.electionId = `ELEC-${year}-${random}`;
  }
  next();
});

electionSchema.pre('save', function (next) {
  if (this.timeline.registrationEnd <= this.timeline.registrationStart) {
    return next(new Error('Registration end must be after start'));
  }
  if (this.timeline.nominationStart < this.timeline.registrationEnd) {
    return next(new Error('Nomination must start after registration ends'));
  }
  if (this.timeline.nominationEnd <= this.timeline.nominationStart) {
    return next(new Error('Nomination end must be after start'));
  }
  if (this.timeline.votingStart < this.timeline.nominationEnd) {
    return next(new Error('Voting must start after nomination ends'));
  }
  if (this.timeline.votingEnd <= this.timeline.votingStart) {
    return next(new Error('Voting end must be after start'));
  }
  if (this.timeline.resultPublicationDate < this.timeline.votingEnd) {
    return next(new Error('Results must be published after voting ends'));
  }
  next();
});

electionSchema.pre('save', function (next) {
  const now = new Date();
  const regEnd = this.timeline.registrationEnd;
  const nomStart = this.timeline.nominationStart;
  const nomEnd = this.timeline.nominationEnd;
  const voteStart = this.timeline.votingStart;
  const voteEnd = this.timeline.votingEnd;
  const resultDate = this.timeline.resultPublicationDate;

  if (now >= voteStart && now <= voteEnd) {
    this.status = 'voting_open';
  }
  else if (now > voteEnd && now < resultDate) {
    this.status = 'voting_closed';  
  }
  else if (now >= nomStart && now <= nomEnd) {
    this.status = 'nomination_open';
  }
  else if (now > nomEnd && now < voteStart) {
    this.status = 'nomination_closed';  
  }
  else if (now >= this.timeline.registrationStart && now <= regEnd) {
    this.status = 'registration_open';
  }
  else if (now > regEnd && now < nomStart) {
    this.status = 'registration_closed';  
  }
  else if (now >= resultDate) {
    this.status = 'results_published';
  }
  else if (now > voteEnd && now >= resultDate) {
    this.status = 'completed';
  }
  // else stays 'draft'
  
  next();
});

electionSchema.virtual('currentStatus').get(function () {
  const now = new Date();
  const regEnd = this.timeline.registrationEnd;
  const nomStart = this.timeline.nominationStart;
  const nomEnd = this.timeline.nominationEnd;
  const voteStart = this.timeline.votingStart;
  const voteEnd = this.timeline.votingEnd;
  const resultDate = this.timeline.resultPublicationDate;

  if (now >= voteStart && now <= voteEnd) return 'voting_open';
  if (now > voteEnd && now < resultDate) return 'voting_closed';
  if (now >= nomStart && now <= nomEnd) return 'nomination_open';
  if (now > nomEnd && now < voteStart) return 'nomination_closed';
  if (now >= this.timeline.registrationStart && now <= regEnd) return 'registration_open';
  if (now > regEnd && now < nomStart) return 'registration_closed';
  if (now >= resultDate) return 'results_published';
  if (now > voteEnd && now >= resultDate) return 'completed';
  
  return 'draft';
});

electionSchema.methods.getWinnersForPosition = function(positionId) {
  const position = this.positions.find(p => p.positionId === positionId);
  if (!position) return [];
  
  if (position.electionType === 'single_winner') {
    return { type: 'single', seats: 1 };
  }
  if (position.electionType === 'multiple_winners') {
    return { type: 'multiple', seats: position.totalSeats };
  }
  if (position.electionType === 'ranked') {
    return { 
      type: 'ranked', 
      seats: position.totalSeats,
      allocations: position.seatAllocation 
    };
  }
  return [];
};

electionSchema.set('toJSON', { virtuals: true });
electionSchema.set('toObject', { virtuals: true });

const Election = mongoose.model('Election', electionSchema);
module.exports = Election;