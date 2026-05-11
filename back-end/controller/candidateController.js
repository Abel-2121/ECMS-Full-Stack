// controller/candidateController.js
const Candidate = require('../model/Candidates');
const Election = require('../model/Election');
const User = require('../model/userModel');
const Vote = require('../model/Vote');
const Result = require('../model/Result');
const catchAsync = require('../utils/catchAsync');
const VoterEligibilityLists = require('../model/VoterEligibilityLists');
const AppError = require('../utils/appError');
const { blockedStatus2 } = require('../utils/electionStatus');

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const candidateController = {
  submitNomination: catchAsync(async (req, res, next) => {
    let {
      electionId,
      positionId,
      positionName,
      manifesto,
      biography,
      slogan,
      declarations,
      supportingDocuments
    } = req.body;
  
    if (typeof declarations === 'string') {
      try {
        declarations = JSON.parse(declarations);
      } catch (error) {
        return next(new AppError('Invalid declarations format', 400));
      }
    }
  
    const election = await Election.findById(electionId).lean();
    if (!election) {
      return next(new AppError('Election not found', 404));
    }
  
    const now = new Date();
    if (now < election.timeline.nominationStart || now > election.timeline.nominationEnd) {
      return next(new AppError('Nomination period is not open', 400));
    }
  
    const existingNomination = await Candidate.findOne({
      electionId,
      userId: req.user.id
    }).lean();
  
    if (existingNomination) {
      return next(new AppError('You have already submitted a nomination for this election', 400));
    }
  
    if (!declarations?.codeOfConduct || !declarations?.spendingLimit || !declarations?.truthfulness) {
      return next(new AppError('You must agree to all declarations', 400));
    }
  
    let campaignPhoto = 'default-candidate.jpg';
    if (req.files && req.files.campaignPhoto) {
      campaignPhoto = req.files.campaignPhoto[0].path;
    }
  
    const docs = [];
    if (req.files && req.files.supportingDocuments) {
      req.files.supportingDocuments.forEach((file, index) => {
        docs.push({
          documentType: req.body.documentTypes ? req.body.documentTypes[index] : 'other',
          fileUrl: file.path,
          uploadedAt: new Date()
        });
      });
    }
  
    const nomination = await Candidate.create({
      electionId,
      userId: req.user.id,
      positionId,
      positionName,
      manifesto,
      biography: biography || '',
      slogan: slogan || '',
      campaignPhoto,
      supportingDocuments: docs.length ? docs : (supportingDocuments || []),
      declarations: {
        codeOfConduct: declarations.codeOfConduct,
        spendingLimit: declarations.spendingLimit,
        truthfulness: declarations.truthfulness
      },
      status: 'pending',
      submittedAt: new Date()
    });
  
    res.status(201).json({
      status: 'success',
      data: { nomination }
    });
  }),

  batchNominationStatus: catchAsync(async (req, res, next) => {
    const { electionIds } = req.body;
    const userId = req.user.id;
  
    const nominations = await Candidate.find({
      electionId: { $in: electionIds },
      userId,
      status: { $in: ['pending', 'approved', 'withdrawn'] }
    }).lean();
  
    const statusMap = {};
    nominations.forEach(nom => {
      statusMap[nom.electionId.toString()] = {
        hasNomination: true,
        status: nom.status,
        nominationId: nom._id
      };
    });
  
    electionIds.forEach(id => {
      if (!statusMap[id]) {
        statusMap[id] = {
          hasNomination: false,
          status: null,
          nominationId: null
        };
      }
    });
  
    res.status(200).json({
      status: 'success',
      data: { statusMap }
    });
  }),

  hasNomination: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
    const userId = req.user.id;
  
    const nomination = await Candidate.findOne({
      electionId,
      userId,
      status: { $in: ['pending', 'approved', 'withdrawn'] }
    }).lean();
  
    res.status(200).json({
      status: 'success',
      data: {
        hasNomination: !!nomination,
        nominationId: nomination?._id || null,
        status: nomination?.status || null,
        message: nomination ? `You have already submitted a nomination for this election with status: ${nomination.status}` : null
      }
    });
  }),

  getMyNominations: catchAsync(async (req, res, next) => {
 
    const nominations = await Candidate.find({ userId: req.user.id })
      .populate('electionId', 'title status timeline')
      .sort({ createdAt: -1 })
      .lean();
  
    res.status(200).json({
      status: 'success',
      results: nominations.length,
      data: { nominations }
    });
  }),

  getNominationById: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const nomination = await Candidate.findOne({
      _id: id,
      userId: req.user.id
    })
      .populate('electionId', 'title status timeline')
      .lean();

    if (!nomination) {
      return next(new AppError('Nomination not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { nomination }
    });
  }),

  withdrawNomination: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const nomination = await Candidate.findOne({
      _id: id,
      userId: req.user.id
    }).lean();

    if (!nomination) {
      return next(new AppError('Nomination not found', 404));
    }

    if (nomination.status !== 'pending') {
      return next(new AppError('Only pending nominations can be withdrawn', 400));
    }

    const updatedNomination = await Candidate.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { status: 'withdrawn' },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      data: { nomination: updatedNomination }
    });
  }),

  requestAppeal: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { appealMessage } = req.body;

    if (!appealMessage) {
      return next(new AppError('Appeal message is required', 400));
    }

    const nomination = await Candidate.findOne({
      _id: id,
      userId: req.user.id
    }).lean();

    if (!nomination) {
      return next(new AppError('Nomination not found', 404));
    }

    if (nomination.status !== 'rejected') {
      return next(new AppError('Only rejected nominations can appeal', 400));
    }

    const updatedNomination = await Candidate.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { 
        appealRequested: true,
        appealMessage: appealMessage
      },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Appeal submitted successfully',
      data: { nomination: updatedNomination }
    });
  }),

  getNominationsByElection: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
    const { status, positionId, page = 1, limit = 50 } = req.query;

    const election = await Election.findOne({
      _id: electionId,
      institutionId: req.user.institutionId
    }).lean();

    if (!election) {
      return next(new AppError('Election not found or access denied', 404));
    }

    const query = { electionId };
    if (status) query.status = status;
    if (positionId) query.positionId = positionId;

    const skip = (page - 1) * limit;
    const limitNum = parseInt(limit);

    const [nominations, total] = await Promise.all([
      Candidate.find(query)
        .populate('userId', 'firstName lastName email phone')
        .sort({ submittedAt: 1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Candidate.countDocuments(query)
    ]);

    res.status(200).json({
      status: 'success',
      results: nominations.length,
      total,
      page: parseInt(page),
      limit: limitNum,
      data: { nominations }
    });
  }),

  getNominationByIdAdmin: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const nomination = await Candidate.findById(id)
      .populate('userId', 'firstName lastName email phone studentId')
      .populate('reviewedBy', 'firstName lastName email')
      .lean(); 
    if (!nomination) {
      return next(new AppError('Nomination not found', 404));
    }

    const election = await Election.findOne({
      _id: nomination.electionId,
      institutionId: req.user.institutionId
    }).lean();

    if (!election) {
      return next(new AppError('Access denied', 403));
    }

    res.status(200).json({
      status: 'success',
      data: { nomination }
    });
  }),

  approveNomination: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { adminComments, ballotPosition } = req.body;
  
    const nomination = await Candidate.findById(id).populate('userId', 'firstName lastName email').lean();
  
    if (!nomination) {
      return next(new AppError('Nomination not found', 404));
    }
  

    const election = await Election.findOne({
      _id: nomination.electionId,
      institutionId: req.user.institutionId
    }).lean();
  
    if (!election) {
      return next(new AppError('Access denied', 403));
    }
    
 if (blockedStatus3.includes(election.status)) {
    return next(new AppError('Cannot approve at this stage', 403));
  }

    if (nomination.status !== 'pending') {
      return next(new AppError('Only pending nominations can be approved', 400));
    }
  
    const updatedNomination = await Candidate.findOneAndUpdate(
      { _id: id },
      {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
        adminComments: adminComments || nomination.adminComments,
        ballotPosition: ballotPosition || nomination.ballotPosition
      },
      { new: true }
    );
  
    await Election.findByIdAndUpdate(nomination.electionId, {
      $inc: { 'statistics.totalCandidates': 1 }
    });
  
    await User.findByIdAndUpdate(nomination.userId, { role: 'candidate' });
  
    await VoterEligibilityLists.findOneAndUpdate(
      { 
        electionId: nomination.electionId,
        'eligibleVoters.email': nomination.userId.email
      },
      {
        $pull: { 
          eligibleVoters: { email: nomination.userId.email }
        }
      }
    );
  
    const updatedVoterList = await VoterEligibilityLists.findOne({ 
      electionId: nomination.electionId 
    }).lean();
    
    if (updatedVoterList) {
      await Election.findByIdAndUpdate(nomination.electionId, {
        $set: { 'statistics.totalEligibleVoters': updatedVoterList.eligibleVoters.length }
      });
    }
  
    const { sendEmailWithTemplate } = require('../services/emailTemplateService');
    const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`;
    
    sendEmailWithTemplate(nomination.userId.email, 'nominationApproved', {
      firstName: nomination.userId.firstName,
      lastName: nomination.userId.lastName,
      electionTitle: election.title,
      positionName: nomination.positionName,
      ballotPosition: ballotPosition,
      loginUrl: loginUrl,
      adminComments: adminComments || null
    }).catch(err => console.error('Email sending failed:', err));
  
    res.status(200).json({
      status: 'success',
      data: { nomination: updatedNomination }
    });
  }),

  rejectNomination: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { rejectionReason, adminComments } = req.body;

    if (!rejectionReason) {
      return next(new AppError('Rejection reason is required', 400));
    }

    const nomination = await Candidate.findById(id).lean();

    if (!nomination) {
      return next(new AppError('Nomination not found', 404));
    }

    const election = await Election.findOne({
      _id: nomination.electionId,
      institutionId: req.user.institutionId
    }).lean();

    if (!election) {
      return next(new AppError('Access denied', 403));
    }

    if (nomination.status !== 'pending') {
      return next(new AppError('Only pending nominations can be rejected', 400));
    }

    const updatedNomination = await Candidate.findOneAndUpdate(
      { _id: id },
      {
        status: 'rejected',
        rejectionReason,
        reviewedAt: new Date(),
        reviewedBy: req.user.id,
        adminComments: adminComments || null
      },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      data: { nomination: updatedNomination }
    });
  }),

  bulkApproveNominations: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
    const { nominationIds } = req.body;

    if (!nominationIds || !nominationIds.length) {
      return next(new AppError('Please provide nomination IDs', 400));
    }

    const election = await Election.findOne({
      _id: electionId,
      institutionId: req.user.institutionId
    }).lean();

    if (!election) {
      return next(new AppError('Access denied', 403));
    }

    const result = await Candidate.updateMany(
      {
        _id: { $in: nominationIds },
        electionId,
        status: 'pending'
      },
      {
        status: 'approved',
        reviewedAt: new Date(),
        reviewedBy: req.user.id
      }
    );

    const approvedNominations = await Candidate.find({
      _id: { $in: nominationIds },
      status: 'approved'
    }).select('userId').lean();

    const userIds = approvedNominations.map(n => n.userId);
    if (userIds.length) {
      await User.updateMany(
        { _id: { $in: userIds } },
        { role: 'candidate' }
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  }),

  assignBallotPositions: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
    const { ballotAssignments } = req.body;

    if (!ballotAssignments || !ballotAssignments.length) {
      return next(new AppError('Please provide ballot assignments', 400));
    }

    const election = await Election.findOne({
      _id: electionId,
      institutionId: req.user.institutionId
    }).lean();

    if (!election) {
      return next(new AppError('Access denied', 403));
    }

    const bulkOps = ballotAssignments.map(assignment => ({
      updateOne: {
        filter: { _id: assignment.nominationId },
        update: { ballotPosition: assignment.position }
      }
    }));

    if (bulkOps.length) {
      await Candidate.bulkWrite(bulkOps);
    }

    res.status(200).json({
      status: 'success',
      message: 'Ballot positions assigned successfully'
    });
  }),

  getApprovedCandidates: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;

    const election = await Election.findById(electionId).lean();
    if (!election) {
      return next(new AppError('Election not found', 404));
    }

    const candidates = await Candidate.find({
      electionId,
      status: { $in: ['approved', 'elected'] }
    })
      .populate('userId', 'firstName lastName email photo')
      .lean(); 

    const groupedByPosition = {};
    for (const candidate of candidates) {
      if (!groupedByPosition[candidate.positionId]) {
        const positionConfig = election.positions.find(p => p.positionId === candidate.positionId);
        groupedByPosition[candidate.positionId] = {
          positionId: candidate.positionId,
          positionName: candidate.positionName,
          electionType: positionConfig?.electionType || 'single_winner',
          totalSeats: positionConfig?.totalSeats || 1,
          candidates: []
        };
      }
      groupedByPosition[candidate.positionId].candidates.push(candidate);
    }

    const randomizedResults = Object.values(groupedByPosition).map(position => ({
      positionId: position.positionId,
      positionName: position.positionName,
      electionType: position.electionType,
      totalSeats: position.totalSeats,
      candidates: shuffleArray(position.candidates)
    }));

    const totalCandidates = candidates.length;

    res.status(200).json({
      status: 'success',
      results: totalCandidates,
      data: { 
        electionType: election.positions[0]?.electionType || 'single_winner',
        positions: randomizedResults
      }
    });
  }),

  getAllCandidates: catchAsync(async (req, res, next) => {
    const { electionId, status, positionId, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {};
    if (electionId) query.electionId = electionId;
    if (status) query.status = status;
    if (positionId) query.positionId = positionId;
    
    let userIds = [];
    if (search) {
      const users = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      }).select('_id').lean();
      userIds = users.map(u => u._id);
      if (userIds.length > 0) {
        query.userId = { $in: userIds };
      } else {
        return res.status(200).json({
          status: 'success',
          results: 0,
          total: 0,
          page,
          totalPages: 0,
          data: { candidates: [] },
          filters: { positionOptions: [] }
        });
      }
    }

    const [candidates, total, positionOptions] = await Promise.all([
      Candidate.find(query)
        .populate('userId', 'firstName lastName email phone')
        .populate('electionId', 'title status timeline')
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Candidate.countDocuments(query),
      electionId ? Election.findById(electionId).select('positions').lean() : Promise.resolve(null)
    ]);

    let positionOptionsArray = [];
    if (positionOptions && positionOptions.positions) {
      positionOptionsArray = positionOptions.positions.map(p => ({
        positionId: p.positionId,
        positionName: p.positionName
      }));
    }

    res.status(200).json({
      status: 'success',
      results: candidates.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: { candidates },
      filters: { positionOptions: positionOptionsArray }
    });
  }),

  getCandidateStats: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;

    const [nominations, election] = await Promise.all([
      Candidate.aggregate([
        { $match: { electionId: electionId } },
        { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }}
      ]),
      Election.findById(electionId).select('positions').lean()
    ]);

    const statsMap = {};
    nominations.forEach(n => { statsMap[n._id] = n.count; });

    const stats = {
      total: Object.values(statsMap).reduce((a, b) => a + b, 0),
      pending: statsMap.pending || 0,
      approved: statsMap.approved || 0,
      rejected: statsMap.rejected || 0,
      withdrawn: statsMap.withdrawn || 0,
      byPosition: []
    };

    if (election && election.positions) {
  
      const positionStats = await Candidate.aggregate([
        { $match: { electionId: electionId } },
        { $group: {
          _id: { positionId: '$positionId', status: '$status' },
          count: { $sum: 1 }
        }}
      ]);

      const positionMap = {};
      positionStats.forEach(stat => {
        const key = stat._id.positionId;
        if (!positionMap[key]) {
          positionMap[key] = {};
        }
        positionMap[key][stat._id.status] = stat.count;
      });

      stats.byPosition = election.positions.map(pos => ({
        positionId: pos.positionId,
        positionName: pos.positionName,
        totalSeats: pos.totalSeats,
        candidates: (positionMap[pos.positionId]?.total || 0),
        approved: positionMap[pos.positionId]?.approved || 0,
        pending: positionMap[pos.positionId]?.pending || 0
      }));
    }

    res.status(200).json({
      status: 'success',
      data: { stats }
    });
  }),

  updateCandidate: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { ballotPosition, adminComments } = req.body;

    const candidate = await Candidate.findById(id).lean();
    if (!candidate) {
      return next(new AppError('Candidate not found', 404));
    }

    const election = await Election.findOne({
      _id: candidate.electionId,
      institutionId: req.user.institutionId
    }).lean();

    if (!election && req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied', 403));
    }

    const updateData = {};
    if (ballotPosition) updateData.ballotPosition = ballotPosition;
    if (adminComments) updateData.adminComments = adminComments;

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      data: { candidate: updatedCandidate }
    });
  }),

  deleteCandidate: catchAsync(async (req, res, next) => {
    const { id } = req.params;
  
    const candidate = await Candidate.findById(id).lean();
    if (!candidate) {
      return next(new AppError('Candidate not found', 404));
    }
  
    const election = await Election.findOne({
      _id: candidate.electionId,
      institutionId: req.user.institutionId
    }).lean();
  
    if (!election && req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied', 403));
    }
  
    if (election.status === 'results_published') {
      const result = await Result.findOne({ electionId: candidate.electionId });
      
      if (result && result.publishedAt) {
        const publishedDate = new Date(result.publishedAt);
        const today = new Date();
        const daysDiff = (today - publishedDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff < 2) {
          const remainingHours = Math.ceil((2 - daysDiff) * 24);
          return next(new AppError(
            `Cannot delete candidate until ${remainingHours} more hour(s). Results were published on ${publishedDate.toLocaleDateString()}.`,
            400
          ));
        }
      }
    }
  
    const activeStatuses = ['registration_open', 'nomination_open', 'voting_open', 'voting_closed'];
    if (activeStatuses.includes(election.status)) {
      return next(new AppError(
        `Cannot delete candidate while election is in "${election.status}" status. Wait until election is completed.`,
        400
      ));
    }
  
    const hasVotes = await Vote.exists({
      electionId: candidate.electionId,
      'votes.candidateId': id
    });
  
    if (hasVotes) {
      return next(new AppError(
        'Cannot delete candidate who has received votes. This would violate election integrity.',
        400
      ));
    }
  
    await Candidate.findByIdAndDelete(id);
  
    await Election.findByIdAndUpdate(candidate.electionId, {
      $inc: { 'statistics.totalCandidates': -1 }
    });
  
    res.status(204).json({
      status: 'success',
      message: 'Candidate deleted successfully',
      data: null
    });
  }),





  getCandidateByIdAdmin: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const candidate = await Candidate.findById(id)
      .populate('userId', 'firstName lastName email phone studentId')
      .populate('electionId', 'title status timeline positions')
      .populate('reviewedBy', 'firstName lastName email')
      .lean();

    if (!candidate) {
      return next(new AppError('Candidate not found', 404));
    }

    const election = await Election.findOne({
      _id: candidate.electionId,
      institutionId: req.user.institutionId
    }).lean();

    if (!election && req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied', 403));
    }

    res.status(200).json({
      status: 'success',
      data: { candidate }
    });
  }),

  getCandidatePublic: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const candidate = await Candidate.findOne({
      _id: id,
      status: 'approved'
    })
      .populate('userId', 'firstName lastName email photo')
      .populate('electionId', 'title description timeline')
      .lean();

    if (!candidate) {
      return next(new AppError('Candidate not found', 404));
    }

    const positionConfig = candidate.electionId?.positions?.find(
      p => p.positionId === candidate.positionId
    );

    const publicCandidate = {
      id: candidate._id,
      nominationId: candidate.nominationId,
      positionName: candidate.positionName,
      campaignPhoto: candidate.campaignPhoto,
      biography: candidate.biography,
      manifesto: candidate.manifesto,
      slogan: candidate.slogan,
      candidateInfo: {
        firstName: candidate.userId?.firstName,
        lastName: candidate.userId?.lastName,
        photo: candidate.userId?.photo
      },
      electionInfo: {
        title: candidate.electionId?.title,
        description: candidate.electionId?.description,
        status: candidate.electionId?.status,
        votingEndsAt: candidate.electionId?.timeline?.votingEnd,
        resultsPublishedAt: candidate.electionId?.timeline?.resultPublicationDate
      },
      positionConfig: positionConfig ? {
        electionType: positionConfig.electionType,
        totalSeats: positionConfig.totalSeats,
        seatAllocation: positionConfig.seatAllocation
      } : null
    };

    res.status(200).json({
      status: 'success',
      data: { candidate: publicCandidate }
    });
  }),
  

  getCandidateHistory: catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    
    // Get user info
    const user = await User.findById(userId).select('firstName lastName email').lean();
    
    // Get all nominations with election details
    const nominations = await Candidate.find({ userId })
      .populate('electionId', 'title status timeline statistics')
      .sort({ submittedAt: -1 })
      .lean();
    
    if (!nominations.length) {
      return res.status(200).json({
        status: 'success',
        data: {
          user: { name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(), email: user?.email },
          summary: { totalElections: 0, totalVotes: 0, electionsWon: 0, winRate: 0, activeElection: null },
          nominations: []
        }
      });
    }
    
    // Get vote counts from Vote collection in one query
    const electionIds = [...new Set(nominations.map(n => n.electionId?._id).filter(Boolean))];
    const candidateIds = nominations.map(n => n._id);
    
    const voteCounts = await Vote.aggregate([
      { $match: { isValid: true } },
      { $unwind: '$votes' },
      { $match: { 'votes.candidateId': { $in: candidateIds } } },
      { $group: { _id: '$votes.candidateId', count: { $sum: 1 } } }
    ]);
    
    const voteCountMap = {};
    voteCounts.forEach(v => { voteCountMap[v._id.toString()] = v.count; });
    
    // Get winners from Results collection
    const winners = await Result.aggregate([
      { $unwind: '$results' },
      { $unwind: '$results.candidates' },
      { $match: { 'results.candidates.candidateId': { $in: candidateIds }, 'results.candidates.winner': true } },
      { $project: { candidateId: '$results.candidates.candidateId' } }
    ]);
    
    const winnerSet = new Set(winners.map(w => w.candidateId.toString()));
    
    // Process nominations
    const now = new Date();
    let totalVotes = 0;
    let wins = 0;
    let activeElection = null;
    
    const processedNominations = nominations.map(nom => {
      const votes = voteCountMap[nom._id.toString()] || nom.voteCount || 0;
      totalVotes += votes;
      
      const isWinner = winnerSet.has(nom._id.toString()) || nom.status === 'elected';
      if (isWinner) wins++;
      
      // Check if this is an active election
      const election = nom.electionId;
      if (election?.timeline?.votingStart && 
          new Date(election.timeline.votingStart) <= now &&
          new Date(election.timeline.votingEnd) >= now &&
          nom.status === 'approved' && !activeElection) {
        activeElection = {
          electionId: election._id,
          title: election.title,
          position: nom.positionName,
          votingEndsAt: election.timeline.votingEnd,
          daysRemaining: Math.ceil((new Date(election.timeline.votingEnd) - now) / (1000 * 60 * 60 * 24))
        };
      }
      
      // Determine result status
      let result = 'pending';
      if (nom.status === 'approved') {
        if (isWinner) result = 'won';
        else if (votes > 0) result = 'participated';
        else result = 'approved';
      } else if (nom.status === 'rejected') result = 'rejected';
      else if (nom.status === 'withdrawn') result = 'withdrawn';
      else if (nom.status === 'elected') result = 'won';
      
      // Calculate ranking (simplified - you can remove if not needed)
      let ranking = nom.electedRank || null;
      
      return {
        _id: nom._id,
        nominationId: nom.nominationId,
        election: election ? {
          id: election._id,
          title: election.title,
          status: election.status,
          timeline: election.timeline
        } : null,
        positionName: nom.positionName,
        status: nom.status,
        result,
        submittedAt: nom.submittedAt,
        rejectionReason: nom.rejectionReason,
        adminComments: nom.adminComments,
        ballotPosition: nom.ballotPosition,
        votesReceived: votes,
        votePercentage: election?.statistics?.totalVotesCast ? 
          Math.round((votes / election.statistics.totalVotesCast) * 100 * 100) / 100 : 0,
        ranking,
        electedRole: nom.electedRole,
        manifesto: nom.manifesto,
        biography: nom.biography
      };
    });
    
    const winRate = processedNominations.filter(n => n.result === 'won' || n.result === 'participated').length > 0
      ? Math.round((wins / processedNominations.filter(n => n.result === 'won' || n.result === 'participated').length) * 100)
      : 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
          email: user?.email
        },
        summary: {
          totalElections: processedNominations.length,
          totalVotes: totalVotes,
          electionsWon: wins,
          winRate: winRate,
          activeElection: activeElection
        },
        nominations: processedNominations
      }
    });
  })
};

module.exports = candidateController;