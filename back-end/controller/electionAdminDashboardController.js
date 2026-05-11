const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Election = require('../model/Election');
const Candidate = require('../model/Candidates');
const User = require('../model/userModel');
const Vote = require('../model/Vote');
const VoterEligibilityLists = require('../model/VoterEligibilityLists');

const electionAdminDashboardController = {
  getDashboardOverview: catchAsync(async (req, res, next) => {
    const { institutionId } = req.user;
    
    if (!institutionId) {
      return next(new AppError('No institution assigned to this admin', 404));
    }

    const elections = await Election.find({ institutionId })
      .sort({ createdAt: -1 })
      .limit(20) 
      .select('_id title status timeline statistics'); 
    
    const electionIds = elections.map(e => e._id);
    
    const [
      candidateStats,
      voteStats,
      userStats,
      dailyVotesAggregation,
      deadlineAggregation
    ] = await Promise.all([
      Candidate.aggregate([
        { $match: { electionId: { $in: electionIds } } },
        { $group: {
          _id: '$status',
          count: { $sum: 1 }
        }}
      ]),
      
      // Vote statistics - Single aggregation
      Vote.aggregate([
        { $match: { electionId: { $in: electionIds } } },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          today: { 
            $sum: {
              $cond: [
                { $gte: ['$castAt', new Date(new Date().setHours(0,0,0,0))] },
                1, 0
              ]
            }
          }
        }}
      ]),
      
      // User statistics
      User.aggregate([
        { $match: { 
          institutionId, 
          role: { $in: ['voter', 'user'] },
          emailVerified: true 
        }},
        { $count: 'registeredVoters' }
      ]),
      
      Vote.aggregate([
        { $match: { 
          electionId: { $in: electionIds },
          castAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
        }},
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$castAt' } },
          votes: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]),
      
      Election.aggregate([
        { $match: { 
          institutionId,
          status: { $in: ['nomination_open', 'voting_open'] }
        }},
        { $project: {
          type: {
            $cond: [
              { $eq: ['$status', 'nomination_open'] },
              'nomination',
              'voting'
            ]
          },
          electionTitle: '$title',
          deadline: {
            $cond: [
              { $eq: ['$status', 'nomination_open'] },
              '$timeline.nominationEnd',
              '$timeline.votingEnd'
            ]
          }
        }},
        { $addFields: {
          daysLeft: {
            $ceil: {
              $divide: [
                { $subtract: ['$deadline', new Date()] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }},
        { $sort: { daysLeft: 1 } },
        { $limit: 5 }
      ])
    ]);

    const candidateStatsMap = {};
    candidateStats.forEach(stat => {
      candidateStatsMap[stat._id] = stat.count;
    });
    
    const totalNominations = candidateStatsMap.pending + candidateStatsMap.approved + candidateStatsMap.rejected || 0;
    const approvedCandidates = candidateStatsMap.approved || 0;
    const pendingCandidates = candidateStatsMap.pending || 0;
    
    const voteStatsData = voteStats[0] || { total: 0, today: 0 };
    const totalVotes = voteStatsData.total;
    const votesToday = voteStatsData.today;
    
    const registeredVoters = userStats[0]?.registeredVoters || 0;
    
    const dailyVotesMap = {};
    dailyVotesAggregation.forEach(item => {
      dailyVotesMap[item._id] = item.votes;
    });
    
    const dailyVotes = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      dailyVotes.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        votes: dailyVotesMap[dateKey] || 0
      });
    }
    
    const voterList = await VoterEligibilityLists.findOne({ institutionId })
      .select('validRecords');
    const totalVoters = voterList?.validRecords || 0;
    const pendingVerification = totalVoters - registeredVoters;
    
    const totalElections = elections.length;
    const activeElections = elections.filter(e => 
      ['voting_open', 'nomination_open', 'registration_open'].includes(e.status)
    ).length;
    const upcomingElections = elections.filter(e => 
      e.status === 'draft' && new Date(e.timeline?.votingStart) > new Date()
    ).length;
    const completedElections = elections.filter(e => 
      ['completed', 'results_published'].includes(e.status)
    ).length;
    
    const currentElection = elections.find(e => e.status === 'voting_open');
    let currentElectionStats = null;
    
    if (currentElection) {
      const totalVoters = currentElection.statistics?.totalEligibleVoters || 0;
      const votesCast = currentElection.statistics?.totalVotesCast || 0;
      const turnout = totalVoters > 0 ? ((votesCast / totalVoters) * 100).toFixed(1) : 0;
      
      const votingEnd = new Date(currentElection.timeline.votingEnd);
      const timeRemaining = votingEnd - new Date();
      
      currentElectionStats = {
        id: currentElection._id,
        title: currentElection.title,
        status: currentElection.status,
        totalVoters,
        votesCast,
        turnout,
        timeRemaining: timeRemaining > 0 ? timeRemaining : 0,
        votingEnd: currentElection.timeline.votingEnd
      };
    }
    
    const [recentVotes, recentNominations] = await Promise.all([
      Vote.find({ electionId: { $in: electionIds } })
        .sort({ castAt: -1 })
        .limit(5)
        .populate('electionId', 'title')
        .lean(), 
      
      Candidate.find({ electionId: { $in: electionIds } })
        .sort({ submittedAt: -1 })
        .limit(5)
        .populate('electionId', 'title')
        .populate('userId', 'firstName lastName')
        .lean()
    ]);
    
    // Combine activities
    const recentActivities = [
      ...recentVotes.map(v => ({
        type: 'vote',
        message: `New vote cast in ${v.electionId?.title}`,
        timestamp: v.castAt,
        electionId: v.electionId?._id
      })),
      ...recentNominations.map(n => ({
        type: 'nomination',
        message: `${n.userId?.firstName} ${n.userId?.lastName} submitted nomination for ${n.positionName} in ${n.electionId?.title}`,
        timestamp: n.submittedAt,
        status: n.status
      }))
    ];
    
    recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivitiesLimited = recentActivities.slice(0, 8);
    
    const totalPositions = elections.reduce((sum, e) => sum + (e.positions?.length || 0), 0);
    
    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalElections,
          activeElections,
          upcomingElections,
          completedElections,
          totalVoters,
          registeredVoters,
          pendingVerification,
          totalNominations,
          approvedCandidates,
          pendingCandidates,
          totalVotes,
          votesToday,
          totalPositions,
          filledPositions: approvedCandidates
        },
        currentElection: currentElectionStats,
        dailyVotes,
        upcomingDeadlines: deadlineAggregation,
        recentActivities: recentActivitiesLimited,
        elections: elections.map(e => ({
          id: e._id,
          title: e.title,
          status: e.status,
          turnout: e.statistics?.totalEligibleVoters > 0 
            ? ((e.statistics.totalVotesCast / e.statistics.totalEligibleVoters) * 100).toFixed(1)
            : 0,
          votesCast: e.statistics?.totalVotesCast || 0,
          totalVoters: e.statistics?.totalEligibleVoters || 0
        }))
      }
    });
  })
};

module.exports = electionAdminDashboardController;