const crypto = require('crypto');
const mongoose = require('mongoose');
const Election = require('../model/Election');
const Candidate = require('../model/Candidates');
const Vote = require('../model/Vote');
const VoterEligibilityLists = require('../model/VoterEligibilityLists');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const generateCode = () => crypto.randomBytes(6).toString('hex').toUpperCase();

const voteController = {
  castVote: catchAsync(async (req, res, next) => {
    const { electionId, votes } = req.body;
    
    const election = await Election.findById(electionId);
    if (!election) {
      return next(new AppError('Election not found', 404));
    }
    if (election.status !== 'voting_open') {
      return next(new AppError('Voting is not open', 400));
    }
  
    const hasVoted = await Vote.findOne({ electionId, userId: req.user.id });
    if (hasVoted) {
      return next(new AppError('You have already voted', 400));
    }
  
    const voterList = await VoterEligibilityLists.findOne({
      electionId,
      'eligibleVoters.email': req.user.email
    });
  
    if (!voterList) {
      return next(new AppError('You are not eligible to vote in this election', 403));
    }
  
    const voter = voterList.eligibleVoters.find(v => v.email === req.user.email);
    
    if (!voter) {
      return next(new AppError('Voter not found in eligibility list', 404));
    }
  
    if (!voter.isRegistered) {
      return next(new AppError('You have not registered for this election. Please register first.', 403));
    }
  
    if (voter.hasVoted) {
      return next(new AppError('You have already voted in this election', 400));
    }
  
    if (!votes || !Array.isArray(votes) || votes.length === 0) {
      return next(new AppError('Please provide valid votes', 400));
    }
  
    for (const voteItem of votes) {
      const position = election.positions.find(p => p.positionId === voteItem.positionId);
      if (!position) {
        return next(new AppError(`Position ${voteItem.positionId} not found`, 400));
      }
  
      if (position.electionType === 'ranked') {
        if (!voteItem.rank && voteItem.rank !== 0) {
          return next(new AppError(`Rank is required for ranked position: ${position.positionName}`, 400));
        }
        
        const ranksInPosition = votes.filter(v => v.positionId === voteItem.positionId).map(v => v.rank);
        if (new Set(ranksInPosition).size !== ranksInPosition.length) {
          return next(new AppError(`Duplicate ranks found for position: ${position.positionName}`, 400));
        }
      }
    }
  
    const vote = await Vote.create({
      electionId,
      userId: req.user.id,
      voterId: req.user.voterId || null,
      votes,
      confirmationCode: generateCode(),
      castAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
  
    await VoterEligibilityLists.findOneAndUpdate(
      {
        electionId,
        'eligibleVoters.email': req.user.email
      },
      {
        $set: { 'eligibleVoters.$.hasVoted': true }
      }
    );
  
    await Election.findByIdAndUpdate(electionId, {
      $inc: { 'statistics.totalVotesCast': 1 }
    });
  
    res.status(201).json({
      status: 'success',
      message: 'Your vote has been cast successfully',
      data: { vote }
    });
  }),
  verifyVoterCredentials: catchAsync(async (req, res, next) => {
    const { electionId, electionCode, voterId } = req.body;
    
    const currentUser = req.user;
    if (!currentUser || !currentUser.email) {
      return next(new AppError('User not authenticated', 401));
    }
    
    const election = await Election.findById(electionId);
    if (!election) {
      return next(new AppError('Election not found', 404));
    }
    
    if (election.status !== 'voting_open') {
      return next(new AppError('Voting is not open for this election', 400));
    }
    
    if (election.electionId !== electionCode) {
      return next(new AppError('Invalid Election ID', 400));
    }
    
    const voterList = await VoterEligibilityLists.findOne({ electionId: election._id });
    if (!voterList) {
      return next(new AppError('No voter list found for this election. Please contact the election administrator.', 404));
    }
    
    const voter = voterList.eligibleVoters.find(v => 
      v.voterId?.toLowerCase() === voterId?.toLowerCase() &&
      v.email?.toLowerCase() === currentUser.email?.toLowerCase()
    );
    
    if (!voter) {
      const voterIdExists = voterList.eligibleVoters.some(v => 
        v.voterId?.toLowerCase() === voterId?.toLowerCase()
      );
      
      const emailExists = voterList.eligibleVoters.some(v => 
        v.email?.toLowerCase() === currentUser.email?.toLowerCase()
      );
      
      if (voterIdExists && !emailExists) {
        return next(new AppError('This Voter ID belongs to a different email address. Please check your credentials.', 400));
      }
      
      if (!voterIdExists && emailExists) {
        return next(new AppError('Invalid Voter ID for your account. Please check your email.', 400));
      }
      
      return next(new AppError('Invalid Voter ID. Please check your email for the correct Voter ID.', 400));
    }
    
    if (voter.hasVoted) {
      return next(new AppError('You have already voted in this election', 400));
    }
    
    req.session = req.session || {};
    req.session.verifiedVoter = {
      electionId: election._id,
      voterId: voter.voterId,
      email: voter.email,
      verifiedAt: new Date()
    };
    
    
    res.status(200).json({
      status: 'success',
      message: 'Verification successful'
    });
  }),
  
  getVotingData: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
    
    const election = await Election.findById(electionId);
    if (!election) {
      return next(new AppError('Election not found', 404));
    }
    
    if (election.status !== 'voting_open') {
      console.log('ERROR: Election status is', election.status, '- should be voting_open');
      return next(new AppError('Voting is not open', 400));
    }
    
    const candidates = await Candidate.find({
      electionId,
      status: 'approved'
    }).populate('userId', 'firstName lastName email photo');
    
   
    
    const positions = election.positions.map(position => {
      const positionCandidates = candidates.filter(c => c.positionId === position.positionId);
      
      // Shuffle candidates for fairness
      const shuffledCandidates = [...positionCandidates];
      for (let i = shuffledCandidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledCandidates[i], shuffledCandidates[j]] = [shuffledCandidates[j], shuffledCandidates[i]];
      }
      
      return {
        positionId: position.positionId,
        positionName: position.positionName,
        positionDescription: position.positionDescription,
        electionType: position.electionType,
        totalSeats: position.totalSeats,
        seatAllocation: position.seatAllocation || [],
        candidates: shuffledCandidates
      };
    });
    
   
    res.status(200).json({
      status: 'success',
      data: {
        election: {
          _id: election._id,
          title: election.title,
          description: election.description,
          timeline: election.timeline
        },
        positions
      }
    });
  }),

  getMyVotes: catchAsync(async (req, res, next) => {
    const { id } = req.user;
  
    const myVotes = await Vote.find({ userId: id })
      .populate('electionId', 'title description')
      .populate('votes.candidateId', 'firstName lastName') 
      .select('electionId castAt confirmationCode votes')   
      .sort({ castAt: -1 });
    
    console.log("MY_VOTES", myVotes);
  
    res.status(200).json({
      status: "success",
      data: {
        votes: myVotes
      }
    });
  }),




  hasVoted: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
    
    const vote = await Vote.findOne({
      electionId,
      userId: req.user.id
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        hasVoted: !!vote,
        electionId
      }
    });
  }),

  getVotesByElection: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
    
    const votes = await Vote.find({ electionId: electionId })
      .populate('userId', 'firstName lastName email')
      .select('-votes')
      .sort({ castAt: -1 });

    res.status(200).json({
      status: 'success',
      results: votes.length,
      data: {
        votes
      }
    });
  }),

  getVoteById: catchAsync(async (req, res, next) => {
    const { id } = req.params;
    
    const vote = await Vote.findById(id)
      .populate('userId', 'firstName lastName email')
      .populate('electionId', 'title');

    if (!vote) {
      return next(new AppError('Vote not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { vote }
    });
  }),

  getVoteReceipt: catchAsync(async (req, res, next) => {
    const { confirmationCode } = req.params;
    
    const vote = await Vote.findOne({ confirmationCode, userId: req.user.id })
      .populate('electionId', 'title description');
    
    if (!vote) {
      return next(new AppError('Receipt not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        receipt: {
          electionTitle: vote.electionId.title,
          castAt: vote.castAt,
          confirmationCode: vote.confirmationCode,
          status: 'Vote recorded successfully'
        }
      }
    });
  }),
  getVoteStatistics: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
    
    const election = await Election.findById(electionId);
    if (!election) {
      return next(new AppError('Election not found', 404));
    }
    
    const voterList = await VoterEligibilityLists.findOne({ 
      electionId: new mongoose.Types.ObjectId(electionId) 
    });
    
    const totalEligibleVoters = voterList ? voterList.eligibleVoters.length : 0;
    const totalVotesCast = await Vote.countDocuments({ electionId });
    
    const votesByPosition = await Vote.aggregate([
      { $match: { electionId: new mongoose.Types.ObjectId(electionId) } },
      { $unwind: '$votes' },
      {
        $group: {
          _id: '$votes.positionId',
          positionName: { $first: '$votes.positionName' },
          votesCast: { $sum: 1 }
        }
      },
      {
        $addFields: {
          percentage: totalEligibleVoters > 0 
            ? { $round: [{ $multiply: [{ $divide: ['$votesCast', totalEligibleVoters] }, 100] }, 2] }
            : 0
        }
      },
      {
        $project: {
          positionName: 1,
          votesCast: 1,
          percentage: 1
        }
      }
    ]);
    
    const votesByHour = await Vote.aggregate([
      { $match: { electionId: new mongoose.Types.ObjectId(electionId) } },
      {
        $group: {
          _id: { $hour: '$castAt' },
          votes: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          hour: { $concat: [{ $toString: '$_id' }, ':00'] },
          votes: 1,
          _id: 0
        }
      }
    ]);
    
    const turnoutPercentage = totalEligibleVoters > 0 
      ? ((totalVotesCast / totalEligibleVoters) * 100).toFixed(2)
      : 0;
    
    res.status(200).json({
      status: 'success',
      data: {
        totalEligibleVoters,
        totalVotesCast,
        turnoutPercentage,
        votesByPosition,
        votesByHour
      }
    });
  }),
 
  getVoteCounts: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
    
    const election = await Election.findById(electionId);
    if (!election) {
      return next(new AppError('Election not found', 404));
    }
    
    const voterList = await VoterEligibilityLists.findOne(
      { electionId: new mongoose.Types.ObjectId(electionId) },
      { 'eligibleVoters': 1 }  
    );
    
    const totalEligibleVoters = voterList ? voterList.eligibleVoters.length : 0;
    
    await Election.findByIdAndUpdate(electionId, {
      $set: { 'statistics.totalEligibleVoters': totalEligibleVoters }
    });
    
    const voteCounts = await Vote.aggregate([
      { $match: { electionId: new mongoose.Types.ObjectId(electionId) } },
      { $unwind: '$votes' },
      {
        $group: {
          _id: {
            positionId: '$votes.positionId',
            positionName: '$votes.positionName',
            candidateId: '$votes.candidateId',
            candidateName: '$votes.candidateName',
            rank: { $ifNull: ['$votes.rank', null] }
          },
          votes: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.positionId',
          positionName: { $first: '$_id.positionName' },
          candidates: {
            $push: {
              candidateId: '$_id.candidateId',
              candidateName: '$_id.candidateName',
              votes: '$votes',
              rank: '$_id.rank'
            }
          }
        }
      },
      { $sort: { positionName: 1 } }
    ]);
  
    const results = voteCounts.map(position => {
      const positionConfig = election.positions.find(p => p.positionId === position._id);
      const electionType = positionConfig?.electionType || 'single_winner';
      const totalSeats = positionConfig?.totalSeats || 1;
      const seatAllocation = positionConfig?.seatAllocation || [];
  
      let candidates = [...position.candidates];
      let processedCandidates = [];
  
      if (electionType === 'ranked') {
        processedCandidates = calculateRankedWinners(candidates, totalSeats, seatAllocation);
      } else {
        const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
        candidates.sort((a, b) => b.votes - a.votes);
        
        const winners = candidates.slice(0, totalSeats);
        
        processedCandidates = candidates.map(c => ({
          ...c,
          percentage: totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(2) : 0,
          winner: winners.some(w => w.candidateId === c.candidateId),
          rank: null
        }));
      }
  
      return {
        positionId: position._id,
        positionName: position.positionName,
        electionType,
        totalSeats,
        candidates: processedCandidates
      };
    });
    
    res.status(200).json({
      status: 'success',
      data: { results, totalEligibleVoters }
    });
  }),

  getPublicResults: catchAsync(async (req, res, next) => {
    const { electionId } = req.params;
    
    const election = await Election.findById(electionId);

    if (!election) {
      return next(new AppError('Election not found', 404));
    }
    
    if (election.status !== 'results_published' && election.status !== 'completed') {
      return next(new AppError('Results are not yet published', 403));
    }
    
    const voteCounts = await Vote.aggregate([
      { $match: { electionId: new mongoose.Types.ObjectId(electionId) } },
      { $unwind: '$votes' },
      {
        $group: {
          _id: {
            positionId: '$votes.positionId',
            positionName: '$votes.positionName',
            candidateId: '$votes.candidateId',
            candidateName: '$votes.candidateName',
            rank: { $ifNull: ['$votes.rank', null] }
          },
          votes: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.positionId',
          positionName: { $first: '$_id.positionName' },
          candidates: {
            $push: {
              candidateId: '$_id.candidateId',
              candidateName: '$_id.candidateName',
              votes: '$votes',
              rank: '$_id.rank'
            }
          }
        }
      },
      { $sort: { positionName: 1 } }
    ]);

    const results = voteCounts.map(position => {
      const positionConfig = election.positions.find(p => p.positionId === position._id);

      const electionType = positionConfig?.electionType || 'single_winner';
      const totalSeats = positionConfig?.totalSeats || 1;
      const seatAllocation = positionConfig?.seatAllocation || [];

      let candidates = [...position.candidates];
      let processedCandidates = [];

      if (electionType === 'ranked') {
        processedCandidates = calculateRankedWinners(candidates, totalSeats, seatAllocation);
      } else {
        const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0);
        candidates.sort((a, b) => b.votes - a.votes);
        const winners = candidates.slice(0, totalSeats);
        
        processedCandidates = candidates.map(c => ({
          ...c,
          percentage: totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(2) : 0,
          winner: winners.some(w => w.candidateId === c.candidateId),
          role: null
        }));
      }

      return {
        positionId: position._id,
        positionName: position.positionName,
        candidates: processedCandidates
      };
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        electionTitle: election.title,
        publishedAt: election.timeline.resultPublicationDate,
        results: results
      }
    });
  }),

  verifyVote: catchAsync(async (req, res, next) => {
    const { confirmationCode } = req.body;
    
    if (!confirmationCode) {
      return next(new AppError('Confirmation code is required', 400));
    }
    
    const vote = await Vote.findOne({ confirmationCode })
      .populate('electionId', 'title')
      .lean();
    
    if (!vote) {
      return res.status(200).json({
        success: false,
        message: 'Invalid confirmation code'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Vote verified successfully',
      data: {
        confirmationCode: vote.confirmationCode,
        electionTitle: vote.electionId?.title,
        castAt: vote.castAt
      }
    });
  }),
};


function calculateRankedWinners(candidates, totalSeats, seatAllocation) {

  candidates.sort((a, b) => b.votes - a.votes);

  const winners = candidates.slice(0, totalSeats);
  
  return candidates.map(c => {
    const winnerIndex = winners.findIndex(w => w.candidateId === c.candidateId);
    let role = null;
    let rank = null;
    
    if (winnerIndex !== -1) {
      rank = winnerIndex + 1;
      const allocation = seatAllocation.find(a => a.rank === rank);
      role = allocation ? allocation.roleName : c.positionName;
    }
    
    const totalVotes = candidates.reduce((sum, cand) => sum + cand.votes, 0);
    
    return {
      ...c,
      percentage: totalVotes > 0 ? ((c.votes / totalVotes) * 100).toFixed(2) : 0,
      winner: winnerIndex !== -1,
      rank: rank,
      role: role
    };
  });
 
}

module.exports = voteController;