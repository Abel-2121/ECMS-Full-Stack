const mongoose = require('mongoose');
const Result = require('../model/Result');
const Election = require('../model/Election');
const Vote = require('../model/Vote');
const Candidate = require('../model/Candidates');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

function calculatePluralityWinners(candidates, totalSeats) {
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
  const winners = sorted.slice(0, totalSeats);
  const winnerIds = new Set(winners.map(w => w.candidateId));

  return candidates.map(c => ({
    ...c,
    winner: winnerIds.has(c.candidateId),
    rank: winners.findIndex(w => w.candidateId === c.candidateId) + 1 || null,
    electedRole: null
  }));
}

function calculateRankedWinners(candidates, totalSeats, seatAllocation) {
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
  const winners = sorted.slice(0, totalSeats);

  return candidates.map(c => {
    const winnerIndex = winners.findIndex(w => w.candidateId === c.candidateId);
    let rank = null;
    let electedRole = null;

    if (winnerIndex !== -1) {
      rank = winnerIndex + 1;
      const allocation = seatAllocation.find(a => a.rank === rank);
      electedRole = allocation ? allocation.roleName : c.positionName;
    }

    return {
      ...c,
      winner: winnerIndex !== -1,
      rank,
      electedRole
    };
  });
}

function detectTies(candidates, totalSeats) {
  const ties = [];
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
  
  if (totalSeats === 1) {
    const topVotes = sorted[0]?.votes || 0;
    const tiedCandidates = sorted.filter(c => c.votes === topVotes);
    
    if (tiedCandidates.length > 1) {
      ties.push({
        type: 'first_place',
        tiedCandidates: tiedCandidates.map(c => ({
          candidateId: c.candidateId,
          candidateName: c.candidateName,
          votes: c.votes
        }))
      });
    }
  }
  
  return ties;
}

async function calculateResultsData(electionId, resolvedWinnerId = null, resolvedPositionId = null) {

  const election = await Election.findById(electionId)
    .select('title timeline positions statistics')
    .lean();
  
  if (!election) return null;

  const [totalVotesCast, voteCountsByPosition] = await Promise.all([
    Vote.countDocuments({ electionId }).lean(),
    Vote.aggregate([
      { $match: { electionId: new mongoose.Types.ObjectId(electionId) } },
      { $unwind: '$votes' },
      {
        $group: {
          _id: {
            positionId: '$votes.positionId',
            candidateId: '$votes.candidateId',
            candidateName: '$votes.candidateName'
          },
          votes: { $sum: 1 }
        }
      }
    ]).exec()
  ]);

  const totalEligibleVoters = election.statistics?.totalEligibleVoters || 0;
  const turnoutPercentage = totalEligibleVoters > 0
    ? parseFloat(((totalVotesCast / totalEligibleVoters) * 100).toFixed(2))
    : 0;

  const votesMap = new Map();
  voteCountsByPosition.forEach(vc => {
    const key = `${vc._id.positionId}|${vc._id.candidateId}`;
    votesMap.set(key, {
      candidateId: vc._id.candidateId,
      candidateName: vc._id.candidateName,
      votes: vc.votes
    });
  });

  const results = [];
  const detectedTies = [];

  for (const position of election.positions) {
    const candidates = [];
    const positionKey = position.positionId;
    
    votesMap.forEach((value, key) => {
      if (key.startsWith(`${positionKey}|`)) {
        candidates.push({ ...value });
      }
    });

    const totalVotesForPosition = candidates.reduce((sum, c) => sum + c.votes, 0);

    const ties = detectTies(candidates, position.totalSeats || 1);
    if (ties.length > 0) {
      detectedTies.push({
        positionId: position.positionId,
        positionName: position.positionName,
        ...ties[0]
      });
    }

    if (resolvedPositionId === position.positionId && resolvedWinnerId) {
      const winnerIndex = candidates.findIndex(c => c.candidateId.toString() === resolvedWinnerId);
      if (winnerIndex !== -1) {
        const winner = candidates[winnerIndex];
        candidates = [winner, ...candidates.filter(c => c.candidateId.toString() !== resolvedWinnerId)];
      }
    }

    let processedCandidates;

    if (position.electionType === 'ranked') {
      processedCandidates = calculateRankedWinners(
        candidates,
        position.totalSeats || 1,
        position.seatAllocation || []
      );
    } else {
      processedCandidates = calculatePluralityWinners(
        candidates,
        position.totalSeats || 1
      );
    }

    processedCandidates = processedCandidates.map(c => ({
      ...c,
      percentage: totalVotesForPosition > 0
        ? parseFloat(((c.votes / totalVotesForPosition) * 100).toFixed(2))
        : 0
    }));

    results.push({
      positionId: position.positionId,
      positionName: position.positionName,
      electionType: position.electionType,
      totalSeats: position.totalSeats || 1,
      totalVotesForPosition,
      candidates: processedCandidates,
      seatAllocation: position.seatAllocation || []
    });
  }

  return {
    summary: {
      totalEligibleVoters,
      totalVotesCast,
      turnoutPercentage,
      totalPositions: election.positions.length,
      totalCandidates: results.reduce((sum, r) => sum + r.candidates.length, 0)
    },
    results,
    detectedTies
  };
}

const resultController = {
  getPreviewResults: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;

    const election = await Election.findById(electionId).select('title timeline votingEnd').lean();
    if (!election) {
      return next(new AppError('Election not found', 404));
    }

    const now = new Date();
    const votingEnd = new Date(election.timeline.votingEnd);
    if (now <= votingEnd) {
      return next(new AppError('Cannot preview results before voting ends', 400));
    }

    const resultsData = await calculateResultsData(electionId);
    const existingResult = await Result.findOne({ electionId }).select('isPublished').lean();

    res.status(200).json({
      status: 'success',
      data: {
        isPublished: existingResult?.isPublished || false,
        isPreview: true,
        electionTitle: election.title,
        summary: resultsData.summary,
        results: resultsData.results,
        hasTies: resultsData.detectedTies.length > 0,
        ties: resultsData.detectedTies
      }
    });
  }),

getDetailedResults: catchAsync(async (req, res, next) => {
  const { electionId } = req.params;

  const [election, existingResult] = await Promise.all([
    Election.findById(electionId).select('title timeline votingEnd').lean(),
    Result.findOne({ electionId })
      .populate('publishedBy', 'firstName lastName email')
      .lean()
  ]);

  if (!election) {
    return next(new AppError('Election not found', 404));
  }

  const now = new Date();
  const votingEnd = new Date(election.timeline.votingEnd);
  if (now <= votingEnd) {
    return next(new AppError('Cannot view results before voting ends', 400));
  }

  const enrichResultsWithCandidateData = async (results) => {
    if (!results || results.length === 0) return results;

    // Extract all candidate IDs in one pass
    const candidateIds = [...new Set(
      results.flatMap(position => 
        position.candidates.map(c => c.candidateId?.toString()).filter(Boolean)
      )
    )];

    if (candidateIds.length === 0) return results;

    const [candidates, users] = await Promise.all([
      Candidate.find(
        { _id: { $in: candidateIds } },
        { campaignPhoto: 1, photoUrl: 1, slogan: 1, biography: 1, manifesto: 1, userId: 1 }
      ).lean(),
      User.find(
        { _id: { $in: candidateIds } },
        { firstName: 1, lastName: 1, email: 1, photo: 1 }
      ).lean()
    ]);

    const candidateMap = new Map(candidates.map(c => [c._id.toString(), c]));
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    return results.map(position => ({
      ...position,
      candidates: position.candidates.map(candidate => {
        const candidateData = candidateMap.get(candidate.candidateId?.toString());
        const userData = userMap.get(candidateData?.userId?.toString());
        
        // Get proper candidate name
        let candidateName = candidate.candidateName;
        if (userData?.firstName && userData?.lastName) {
          candidateName = `${userData.firstName} ${userData.lastName}`;
        }
        
        return {
          ...candidate,
          candidateName,
          campaignPhoto: candidateData?.campaignPhoto || null,
          photoUrl: candidateData?.photoUrl || null,
          slogan: candidateData?.slogan || candidate.slogan || null,
          biography: candidateData?.biography || candidate.biography || null,
          manifesto: candidateData?.manifesto || candidate.manifesto || null,
          userEmail: userData?.email || null,
          userPhoto: userData?.photo || null
        };
      })
    }));
  };

  // If results already exist, enrich and return
  if (existingResult) {
    existingResult.results = await enrichResultsWithCandidateData(existingResult.results);
    return res.status(200).json({
      status: 'success',
      data: { result: existingResult }
    });
  }

  // Calculate fresh results
  const resultsData = await calculateResultsData(electionId);
  
  // Enrich calculated results
  resultsData.results = await enrichResultsWithCandidateData(resultsData.results);

  res.status(200).json({
    status: 'success',
    data: {
      result: {
        isPublished: false,
        isPreview: true,
        summary: resultsData.summary,
        results: resultsData.results,
        hasTies: resultsData.detectedTies?.length > 0,
        ties: resultsData.detectedTies || []
      }
    }
  });
}),

  resolveTie: catchAsync(async (req, res, next) => {
    const { electionId, positionId } = req.params;

    const election = await Election.findById(electionId).lean();
    if (!election) {
      return next(new AppError('Election not found', 404));
    }

    const voteCounts = await Vote.aggregate([
      { $match: { electionId: new mongoose.Types.ObjectId(electionId) } },
      { $unwind: '$votes' },
      { $match: { 'votes.positionId': positionId } },
      {
        $group: {
          _id: '$votes.candidateId',
          candidateName: { $first: '$votes.candidateName' },
          votes: { $sum: 1 }
        }
      },
      { $sort: { votes: -1 } }
    ]).exec();

    const topVotes = voteCounts[0]?.votes || 0;
    const tiedCandidates = voteCounts.filter(c => c.votes === topVotes);

    if (tiedCandidates.length <= 1) {
      return next(new AppError('No tie detected for this position', 400));
    }

    const randomIndex = Math.floor(Math.random() * tiedCandidates.length);
    const winner = tiedCandidates[randomIndex];

    let result = await Result.findOne({ electionId });

    if (!result) {
      const resultsData = await calculateResultsData(electionId, winner._id, positionId);
      result = await Result.create({
        electionId,
        publishedBy: req.user.id,
        publishedAt: new Date(),
        summary: resultsData.summary,
        results: resultsData.results,
        isPublished: false,
        auditLog: {
          calculatedAt: new Date(),
          tieBreakingApplied: true,
          tieBreakingDetails: JSON.stringify({
            positionId,
            positionName: election.positions.find(p => p.positionId === positionId)?.positionName,
            resolvedAt: new Date(),
            resolvedBy: req.user.id,
            originalTiedCandidates: tiedCandidates.map(c => ({ candidateName: c.candidateName, votes: c.votes })),
            selectedWinner: { candidateName: winner.candidateName, votes: winner.votes },
            method: 'random_lottery'
          })
        }
      });
    } else {
      const positionIndex = result.results.findIndex(p => p.positionId === positionId);
      if (positionIndex !== -1) {
        const candidateIndex = result.results[positionIndex].candidates.findIndex(
          c => c.candidateId.toString() === winner._id.toString()
        );
        
        if (candidateIndex !== -1) {
          result.results[positionIndex].candidates[candidateIndex].winner = true;
          result.results[positionIndex].candidates[candidateIndex].rank = 1;
        }
      }

      result.auditLog.tieBreakingApplied = true;
      const existingDetails = result.auditLog.tieBreakingDetails ? JSON.parse(result.auditLog.tieBreakingDetails) : [];
      const newDetails = Array.isArray(existingDetails) ? existingDetails : [];
      newDetails.push({
        positionId,
        positionName: election.positions.find(p => p.positionId === positionId)?.positionName,
        resolvedAt: new Date(),
        resolvedBy: req.user.id,
        originalTiedCandidates: tiedCandidates.map(c => ({ candidateName: c.candidateName, votes: c.votes })),
        selectedWinner: { candidateName: winner.candidateName, votes: winner.votes },
        method: 'random_lottery'
      });
      result.auditLog.tieBreakingDetails = JSON.stringify(newDetails);
      
      await result.save();
    }

    res.status(200).json({
      status: 'success',
      message: 'Tie resolved successfully',
      data: {
        winner: {
          candidateId: winner._id,
          candidateName: winner.candidateName,
          votes: winner.votes
        },
        result: {
          isPublished: false,
          summary: result.summary,
          results: result.results
        }
      }
    });
  }),

  publishResults: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;

    const election = await Election.findById(electionId).select('title timeline status').lean();
    if (!election) {
      return next(new AppError('Election not found', 404));
    }

    if (election.status === 'results_published') {
      return next(new AppError('Results already published for this election', 400));
    }

    const now = new Date();
    const votingEnd = new Date(election.timeline.votingEnd);
    if (now < votingEnd) {
      return next(new AppError('Cannot publish results before voting ends', 400));
    }

    const existingResult = await Result.findOne({ electionId, isPublished: true });
    if (existingResult) {
      return next(new AppError('Results already published for this election', 400));
    }

    let result = await Result.findOne({ electionId });

    if (!result) {
      const resultsData = await calculateResultsData(electionId);
      result = await Result.create({
        electionId,
        publishedBy: req.user.id,
        publishedAt: new Date(),
        summary: resultsData.summary,
        results: resultsData.results,
        isPublished: true,
        auditLog: {
          calculatedAt: new Date(),
          tieBreakingApplied: false,
          tieBreakingDetails: null
        }
      });
    } else {
      result.isPublished = true;
      result.publishedAt = new Date();
      result.publishedBy = req.user.id;
      await result.save();
    }

    await Election.updateOne(
      { _id: electionId },
      { $set: { status: 'results_published' } }
    );

    const bulkUpdates = [];
    for (const positionResult of result.results) {
      for (const candidate of positionResult.candidates) {
        if (candidate.winner && candidate.candidateId) {
          bulkUpdates.push({
            updateOne: {
              filter: { _id: candidate.candidateId },
              update: {
                $set: {
                  status: 'elected',
                  electedRank: candidate.rank,
                  electedRole: candidate.electedRole,
                  voteCount: candidate.votes
                }
              }
            }
          });
        }
      }
    }
    
    if (bulkUpdates.length > 0) {
      await Candidate.bulkWrite(bulkUpdates);
    }

    res.status(200).json({
      status: 'success',
      message: 'Results published successfully',
      data: { result }
    });
  }),

  getPublicResults: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;

    const [election, result] = await Promise.all([
      Election.findById(electionId).select('title timeline votingEnd status').lean(),
      Result.findOne({ electionId, isPublished: true })
        .select('electionId publishedAt summary results')
        .populate('electionId', 'title')
        .lean()
    ]);

    if (!election) {
      return next(new AppError('Election not found', 404));
    }

    if (!result) {
      const now = new Date();
      const votingEnd = new Date(election.timeline.votingEnd);
      const hasVotingEnded = now > votingEnd;

      return res.status(200).json({
        status: 'success',
        data: {
          isPublished: false,
          electionTitle: election.title,
          electionStatus: election.status,
          message: hasVotingEnded 
            ? 'Voting has ended. Results are being prepared and will be published soon.'
            : 'Voting is still in progress. Results will be available after voting ends.',
          publishedAt: null,
          summary: null,
          results: []
        }
      });
    }

    const candidateIds = [...new Set(
      result.results.flatMap(position => 
        position.candidates.map(c => c.candidateId?.toString()).filter(Boolean)
      )
    )];

    const [candidates, users] = await Promise.all([
      Candidate.find(
        { _id: { $in: candidateIds } },
        { campaignPhoto: 1, photoUrl: 1, slogan: 1, biography: 1, manifesto: 1, userId: 1 }
      ).lean(),
      User.find(
        { _id: { $in: candidateIds.map(id => new mongoose.Types.ObjectId(id)) } },
        { firstName: 1, lastName: 1, email: 1, photo: 1 }
      ).lean()
    ]);

    const candidateMap = new Map();
    candidates.forEach(candidate => {
      candidateMap.set(candidate._id.toString(), candidate);
    });

    const userMap = new Map();
    users.forEach(user => {
      userMap.set(user._id.toString(), user);
    });
    
    const publicData = {
      isPublished: true,
      electionTitle: result.electionId?.title || election.title,
      publishedAt: result.publishedAt,
      summary: result.summary,
      results: result.results.map(position => ({
        positionName: position.positionName,
        electionType: position.electionType,
        totalSeats: position.totalSeats,
        totalVotesForPosition: position.totalVotesForPosition,
        seatAllocation: position.seatAllocation,
        candidates: position.candidates.map(c => {
          const candidateData = candidateMap.get(c.candidateId?.toString());
          const userData = userMap.get(candidateData?.userId?.toString());
          
          // Get candidate name from user data or fallback to stored name
          let candidateName = c.candidateName;
          if (userData?.firstName && userData?.lastName) {
            candidateName = `${userData.firstName} ${userData.lastName}`;
          }
          
          return {
            candidateId: c.candidateId,
            candidateName,
            votes: c.votes,
            percentage: c.percentage,
            winner: c.winner,
            electedRole: c.electedRole,
            rank: c.rank,
            campaignPhoto: candidateData?.campaignPhoto || null,
            photoUrl: candidateData?.photoUrl || null,
            slogan: candidateData?.slogan || c.slogan || null,
            biography: candidateData?.biography || c.biography || null,
            manifesto: candidateData?.manifesto || c.manifesto || null,
          
            userEmail: userData?.email || null,
            userPhoto: userData?.photo || null
          };
        })
      }))
    };


    if (process.env.NODE_ENV !== 'production') {
      console.log(`📸 Results published for election: ${publicData.electionTitle}`);
    }

    res.status(200).json({
      status: 'success',
      data: publicData
    });
  }),

  getAllResults: catchAsync(async (req, res, next) => {
    const { role, institutionId } = req.user;

    let filter = { isPublished: true };
    if (role === 'electionAdmin') {
      const elections = await Election.find({ institutionId }).select('_id').lean();
      filter.electionId = { $in: elections.map(e => e._id) };
    }

    const results = await Result.find(filter)
      .populate('electionId', 'title')
      .populate('publishedBy', 'firstName lastName')
      .sort({ publishedAt: -1 })
      .lean();

    res.status(200).json({
      status: 'success',
      results: results.length,
      data: { results }
    });
  }),

  // Get single result by ID
  getResultById: catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const result = await Result.findById(id)
      .populate('electionId', 'title description timeline')
      .populate('publishedBy', 'firstName lastName email')
      .lean();

    if (!result) {
      return next(new AppError('Result not found', 404));
    }

    if (result.results && result.results.length > 0) {
      const candidateIds = [...new Set(
        result.results.flatMap(position => 
          position.candidates.map(c => c.candidateId?.toString()).filter(Boolean)
        )
      )];

      if (candidateIds.length > 0) {
        const candidates = await Candidate.find(
          { _id: { $in: candidateIds } },
          { campaignPhoto: 1, photoUrl: 1, slogan: 1, biography: 1, manifesto: 1 }
        ).lean();

        const candidateMap = new Map();
        candidates.forEach(candidate => {
          candidateMap.set(candidate._id.toString(), candidate);
        });

        result.results = result.results.map(position => ({
          ...position,
          candidates: position.candidates.map(c => ({
            ...c,
            campaignPhoto: candidateMap.get(c.candidateId?.toString())?.campaignPhoto || null,
            photoUrl: candidateMap.get(c.candidateId?.toString())?.photoUrl || null,
            slogan: candidateMap.get(c.candidateId?.toString())?.slogan || c.slogan || null,
            biography: candidateMap.get(c.candidateId?.toString())?.biography || c.biography || null,
            manifesto: candidateMap.get(c.candidateId?.toString())?.manifesto || c.manifesto || null
          }))
        }));
      }
    }

    res.status(200).json({
      status: 'success',
      data: { result }
    });
  }),

deleteResult: catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const result = await Result.findById(id).populate('electionId', 'title timeline votingEnd status');
  
  if (!result) {
    return next(new AppError('Result not found', 404));
  }

  if (req.user.role !== 'superAdmin') {
    const election = await Election.findById(result.electionId._id);
    if (election.createdBy.toString() !== req.user.id) {
      return next(new AppError('You do not have permission to delete this result', 403));
    }
  }
  const publishedDate = new Date(result.publishedAt);
  const today = new Date();
  const daysDiff = (today - publishedDate) / (1000 * 60 * 60 * 24);
  
  if (daysDiff < 5) {
    const remainingDays = Math.ceil(5 - daysDiff);
    return next(new AppError(
      `Cannot delete result until ${remainingDays} more day(s). Results can only be deleted 5 days after publication.`,
      400
    ));
  }

  const election = await Election.findById(result.electionId._id);
  if (election && ['registration_open', 'nomination_open', 'voting_open'].includes(election.status)) {
    return next(new AppError('Cannot delete results while election is active', 400));
  }

  await Result.findByIdAndDelete(id);

  if (election && election.status === 'results_published') {
    await Election.findByIdAndUpdate(election._id, { status: 'completed' });
  }

  res.status(200).json({
    status: 'success',
    message: 'Result deleted successfully after 5-day waiting period',
    data: null
  });
}),



};

module.exports = resultController;