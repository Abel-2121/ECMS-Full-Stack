const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const Election = require('../../model/Election');
const Result = require('../../model/Result');
const Vote = require('../../model/Vote');
const Candidate = require('../../model/Candidates');
const VoterEligibilityLists = require('../../model/VoterEligibilityLists');
const { validateElectionDates } = require('./datevalidator');
const {blockedStatus1,blockedStatus2} = require('../../utils/electionStatus')
const electionController = {

  createElection: catchAsync(async (req, res, next) => {
    const {
      title,
      description,
      registrationStart,
      registrationEnd,
      nominationStart,
      nominationEnd,
      votingStart,
      votingEnd,
      resultPublicationDate,
      positions  
    } = req.body;

    const electionCount = await Election.countDocuments({ 
      institutionId: req.user.institutionId 
    });
    
    if (electionCount >= 5) {
      return next(new AppError(
        `Cannot create more than 5 elections per institution. Current: ${electionCount}/5. Delete an existing election first.`,
        400
      ));
    }

    if (
      !title || !description ||
      !registrationStart || !registrationEnd ||
      !nominationStart || !nominationEnd ||
      !votingStart || !votingEnd ||
      !resultPublicationDate ||
      !positions || !Array.isArray(positions) || positions.length === 0
    ) {
      return next(new AppError("Please fill all required fields correctly", 400));
    }

    const dates = {
      registrationStart: new Date(registrationStart),
      registrationEnd: new Date(registrationEnd),
      nominationStart: new Date(nominationStart),
      nominationEnd: new Date(nominationEnd),
      votingStart: new Date(votingStart),
      votingEnd: new Date(votingEnd),
      resultPublicationDate: new Date(resultPublicationDate)
    };

    const validation = validateElectionDates(dates, true);
    if (!validation.valid) {
      return next(new AppError(validation.message, 400));
    }

    if (!req.user || !req.user.id || !req.user.institutionId) {
      return next(new AppError("User authentication error", 401));
    }

    // Process positions with new fields
    const processedPositions = positions.map((pos, index) => ({
      positionId: pos.positionId || `POS-${Date.now()}-${index}`,
      positionName: pos.positionName,
      positionDescription: pos.positionDescription || '',
      electionType: pos.electionType || 'single_winner',
      totalSeats: pos.totalSeats || 1,
      seatAllocation: pos.seatAllocation || [],
      maxCandidates: pos.maxCandidates || 5,
      requiredDocuments: pos.requiredDocuments || ['photo', 'manifesto'],
      eligibilityRules: {
        minGPA: pos.minGPA || null,
        allowedDepartments: pos.allowedDepartments || [],
        allowedYears: pos.allowedYears || []
      }
    }));

    const election = await Election.create({
      title,
      description,
      institutionId: req.user.institutionId,
      createdBy: req.user.id,
      timeline: dates,
      positions: processedPositions
    });

    res.status(201).json({
      status: 'success',
      data: { election }
    });
  }),

updateElection: catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const election = await Election.findById(id);
  if (!election) {
    return next(new AppError('Election not found', 404));
  }
    
  if (blockedStatus1.includes(election.status)) {
    return next(new AppError('Update not allowed at this stage', 403));
  }

  const {
    title, description,
    registrationStart, registrationEnd,
    nominationStart, nominationEnd,
    votingStart, votingEnd,
    resultPublicationDate,
    positions
  } = req.body;

  const dates = {
    registrationStart: registrationStart ? new Date(registrationStart) : election.timeline.registrationStart,
    registrationEnd: registrationEnd ? new Date(registrationEnd) : election.timeline.registrationEnd,
    nominationStart: nominationStart ? new Date(nominationStart) : election.timeline.nominationStart,
    nominationEnd: nominationEnd ? new Date(nominationEnd) : election.timeline.nominationEnd,
    votingStart: votingStart ? new Date(votingStart) : election.timeline.votingStart,
    votingEnd: votingEnd ? new Date(votingEnd) : election.timeline.votingEnd,
    resultPublicationDate: resultPublicationDate ? new Date(resultPublicationDate) : election.timeline.resultPublicationDate
  };

  const validation = validateElectionDates(dates, false);
  if (!validation.valid) {
    return next(new AppError(validation.message, 400));
  }

  const updateData = {};

  if (title) updateData.title = title;
  if (description) updateData.description = description;

  if (registrationStart) updateData['timeline.registrationStart'] = dates.registrationStart;
  if (registrationEnd) updateData['timeline.registrationEnd'] = dates.registrationEnd;
  if (nominationStart) updateData['timeline.nominationStart'] = dates.nominationStart;
  if (nominationEnd) updateData['timeline.nominationEnd'] = dates.nominationEnd;
  if (votingStart) updateData['timeline.votingStart'] = dates.votingStart;
  if (votingEnd) updateData['timeline.votingEnd'] = dates.votingEnd;
  if (resultPublicationDate) updateData['timeline.resultPublicationDate'] = dates.resultPublicationDate;

  // FIXED: Handle positions without generating new positionId for existing ones
  if (positions && Array.isArray(positions)) {
    // Create a map of existing positions by positionName or positionId
    const existingPositionsMap = new Map();
    election.positions.forEach(pos => {
      existingPositionsMap.set(pos.positionName, pos);
      existingPositionsMap.set(pos.positionId, pos);
    });

    updateData.positions = positions.map((pos, index) => {
      // Try to find existing position by positionId first, then by name
      let existingPosition = null;
      
      if (pos.positionId) {
        existingPosition = existingPositionsMap.get(pos.positionId);
      }
      
      if (!existingPosition && pos.positionName) {
        existingPosition = existingPositionsMap.get(pos.positionName);
      }
      
      // If position exists, keep its original positionId
      // Otherwise generate new one for new positions only
      return {
        positionId: existingPosition ? existingPosition.positionId : `POS-${Date.now()}-${index}`,
        positionName: pos.positionName,
        positionDescription: pos.positionDescription || '',
        electionType: pos.electionType || 'single_winner',
        totalSeats: pos.totalSeats || 1,
        seatAllocation: pos.seatAllocation || [],
        maxCandidates: pos.maxCandidates || 5,
        requiredDocuments: pos.requiredDocuments || ['photo', 'manifesto'],
        eligibilityRules: {
          minGPA: pos.minGPA || null,
          allowedDepartments: pos.allowedDepartments || [],
          allowedYears: pos.allowedYears || []
        }
      };
    });
  }

  const updatedElection = await Election.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: { election: updatedElection }
  });
}),

getElection: catchAsync(async (req, res, next) => {
    const { role, institutionId, email } = req.user;
    let filter = {};
    if (role === 'superAdmin') {
      filter = {}; // No filter - get all elections
    }
    else if (role === 'candidate' || role === 'electionAdmin') {
      filter = { institutionId };
    }
    else if (role === 'voter') {
      const eligibilityLists = await VoterEligibilityLists.find({
        'eligibleVoters.email': email
      }).lean();
      
      const eligibleElectionIds = eligibilityLists.map(el => el.electionId.toString());
      
      if (eligibleElectionIds.length === 0) {
        return res.status(200).json({
          status: 'success',
          results: 0,
          data: { elections: [] }
        });
      }
      
      filter = {
        _id: { $in: eligibleElectionIds },
        institutionId
      };
    }
  
    const elections = await Election.find(filter).lean();
  
    res.status(200).json({
      status: 'success',
      results: elections.length,
      data: { elections }
    });
  }),
  
  getElectionById: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const election = await Election.findById(id);
    if (!election) {
      return next(new AppError('Election not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { election }
    });
  }),

deleteElection: catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const election = await Election.findById(id);
  if (!election) {
    return next(new AppError('Election not found', 404));
  }

  if (election.status === 'results_published') {
    const publishedResult = await Result.findOne({ electionId: id });
    
    if (publishedResult) {
      const publishedDate = new Date(publishedResult.publishedAt);
      const today = new Date();
      const daysDiff = (today - publishedDate) / (1000 * 60 * 60 * 24);
      
      if (daysDiff < 5) {
        const remainingDays = Math.ceil(5 - daysDiff);
        return next(new AppError(
          `Cannot delete election results until ${remainingDays} more day(s). Results were published on ${publishedDate.toLocaleDateString()}.`,
          400
        ));
      }
    }
  }


  const blockedStatuses = ['registration_open', 'nomination_open', 'voting_open', 'voting_closed'];
  if (blockedStatuses.includes(election.status)) {
    return next(new AppError(`Cannot delete election while status is "${election.status}"`, 403));
  }

  const allowedStatuses = ['draft', 'results_published'];
  if (!allowedStatuses.includes(election.status)) {
    return next(new AppError('Cannot delete active or completed election', 403));
  }

 
  if (election.statistics.totalVotesCast > 0 && election.status !== 'results_published') {
    return next(new AppError('Cannot delete election with votes cast', 403));
  }

  
  await Result.findOneAndDelete({ electionId: id });
  await Candidate.deleteMany({ electionId: id });
  await Vote.deleteMany({ electionId: id });
  await VoterEligibilityLists.findOneAndDelete({ electionId: id });
 
  await Election.findByIdAndDelete(id);

  res.status(204).json({
    status: 'success',
    data: null
  });
}),

};

module.exports = electionController;