
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Institution = require('../model/Institution');
const Election = require('../model/Election');
const User = require('../model/userModel');
const Candidate = require('../model/Candidates');
const Vote = require('../model/Vote');

const dashboardController = {
  getDashboardStats: catchAsync(async (req, res, next) => {
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied. Super admin only.', 403));
    }

    const [
      institutionStats,
      electionStats,
      userStats,
      voteStats,
      candidateStats
    ] = await Promise.all([

      Institution.aggregate([
        { $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
        }}
      ]),
      
      Election.aggregate([
        { $group: {
          _id: null,
          total: { $sum: 1 },
          votingOpen: { $sum: { $cond: [{ $eq: ['$status', 'voting_open'] }, 1, 0] } },
          nominationOpen: { $sum: { $cond: [{ $eq: ['$status', 'nomination_open'] }, 1, 0] } },
          registrationOpen: { $sum: { $cond: [{ $eq: ['$status', 'registration_open'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $in: ['$status', ['completed', 'results_published']] }, 1, 0] } }
        }}
      ]),
      
      
      User.aggregate([
        { $group: {
          _id: '$role',
          count: { $sum: 1 }
        }}
      ]),
      
      
      Vote.aggregate([
        { $facet: {
          total: [{ $count: 'count' }],
          yesterday: [
            { $match: { castAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 1)) } } },
            { $count: 'count' }
          ],
          thisMonth: [
            { $match: { castAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
            { $count: 'count' }
          ]
        }}
      ]),
      
      
      Candidate.aggregate([
        { $match: { status: 'approved' } },
        { $count: 'total' }
      ])
    ]);

    
    const instStats = institutionStats[0] || { total: 0, pending: 0, active: 0 };
    const electionStatsData = electionStats[0] || { total: 0, votingOpen: 0, nominationOpen: 0, registrationOpen: 0, completed: 0 };
    
    const userStatsMap = {};
    userStats.forEach(stat => { userStatsMap[stat._id] = stat.count; });
    
    const voteStatsData = voteStats[0] || {};
    const totalVotes = voteStatsData.total?.[0]?.count || 0;
    const votesYesterday = voteStatsData.yesterday?.[0]?.count || 0;
    const votesThisMonth = voteStatsData.thisMonth?.[0]?.count || 0;
    
    const electionsWithStats = await Election.find(
      { 'statistics.totalEligibleVoters': { $gt: 0 } },
      { 'statistics.totalVotesCast': 1, 'statistics.totalEligibleVoters': 1 }
    ).lean();
    
    let totalTurnout = 0;
    electionsWithStats.forEach(e => {
      totalTurnout += (e.statistics.totalVotesCast / e.statistics.totalEligibleVoters) * 100;
    });
    const averageTurnout = electionsWithStats.length > 0 
      ? (totalTurnout / electionsWithStats.length).toFixed(1) 
      : 0;

    res.status(200).json({
      status: 'success',
      data: {
        totalInstitutions: instStats.total,
        pendingInstitutions: instStats.pending,
        activeInstitutions: instStats.active,
        totalElections: electionStatsData.total,
        activeElections: electionStatsData.votingOpen,
        ongoingElections: electionStatsData.nominationOpen + electionStatsData.registrationOpen,
        completedElections: electionStatsData.completed,
        totalVoters: userStatsMap.voter + userStatsMap.user || 0,
        totalCandidates: userStatsMap.candidate || 0,
        totalAdmins: userStatsMap.electionAdmin || 0,
        totalVotesCast: totalVotes,
        votesYesterday,
        newVotersThisMonth: votesThisMonth, 
        averageTurnout
      }
    });
  }),

  getElectionTrend: catchAsync(async (req, res, next) => {
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied. Super admin only.', 403));
    }

    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    
    const monthlyData = await Election.aggregate([
      { $match: { 
        $or: [
          { createdAt: { $gte: new Date(currentYear, 0, 1) } },
          { updatedAt: { $gte: new Date(currentYear, 0, 1) }, status: { $in: ['completed', 'results_published'] } }
        ]
      }},
      { $facet: {
        created: [
          { $match: { createdAt: { $gte: new Date(currentYear, 0, 1) } } },
          { $group: {
            _id: { $month: '$createdAt' },
            count: { $sum: 1 }
          }}
        ],
        completed: [
          { $match: { 
            status: { $in: ['completed', 'results_published'] },
            updatedAt: { $gte: new Date(currentYear, 0, 1) }
          }},
          { $group: {
            _id: { $month: '$updatedAt' },
            count: { $sum: 1 }
          }}
        ]
      }}
    ]);

    const createdMap = {};
    const completedMap = {};
    
    (monthlyData[0]?.created || []).forEach(item => {
      createdMap[item._id] = item.count;
    });
    (monthlyData[0]?.completed || []).forEach(item => {
      completedMap[item._id] = item.count;
    });

    const created = months.map((_, i) => createdMap[i + 1] || 0);
    const completed = months.map((_, i) => completedMap[i + 1] || 0);

    res.status(200).json({
      status: 'success',
      data: { months, created, completed }
    });
  }),

  
  getTopInstitutions: catchAsync(async (req, res, next) => {
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied. Super admin only.', 403));
    }

    
    const topInstitutions = await Institution.aggregate([
      { $match: { status: 'active' } },
      { $lookup: {
        from: 'elections',
        localField: '_id',
        foreignField: 'institutionId',
        as: 'elections'
      }},
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'institutionId',
        as: 'users',
        pipeline: [
          { $match: { role: { $in: ['voter', 'user'] } } }
        ]
      }},
      { $lookup: {
        from: 'votes',
        let: { electionIds: '$elections._id' },
        as: 'votes',
        pipeline: [
          { $match: { $expr: { $in: ['$electionId', '$$electionIds'] } } },
          { $count: 'total' }
        ]
      }},
      { $addFields: {
        electionCount: { $size: '$elections' },
        voterCount: { $size: '$users' },
        totalVotes: { $ifNull: [{ $arrayElemAt: ['$votes.total', 0] }, 0] }
      }},
      { $project: {
        _id: 1, name: 1, code: 1, status: 1,
        electionCount: 1, voterCount: 1, totalVotes: 1
      }},
      { $sort: { electionCount: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      status: 'success',
      data: { topInstitutions }
    });
  }),

  getPlatformAnalytics: catchAsync(async (req, res, next) => {
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied. Super admin only.', 403));
    }

    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    
    const monthlyData = await Election.aggregate([
      { $match: { createdAt: { $gte: new Date(currentYear, 0, 1) } } },
      { $group: {
        _id: { $month: '$createdAt' },
        elections: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ]);

    const monthlyElections = months.map((_, i) => {
      const found = monthlyData.find(m => m._id === i + 1);
      return found ? found.elections : 0;
    });

    // Get top institutions efficiently
    const topInstitutions = await Institution.aggregate([
      { $match: { status: 'active' } },
      { $lookup: {
        from: 'elections',
        localField: '_id',
        foreignField: 'institutionId',
        as: 'elections'
      }},
      { $addFields: { electionCount: { $size: '$elections' } } },
      { $sort: { electionCount: -1 } },
      { $limit: 5 },
      { $project: { _id: 1, name: 1, electionCount: 1 } }
    ]);

    const [totalInstitutions, totalElections, totalVoters, totalCandidates, totalVotes] = await Promise.all([
      Institution.countDocuments(),
      Election.countDocuments(),
      User.countDocuments({ role: { $in: ['voter', 'user'] } }),
      Candidate.countDocuments({ status: 'approved' }),
      Vote.countDocuments()
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        monthlyData: months.map((month, i) => ({
          month,
          elections: monthlyElections[i],
          voters: 0, 
          votes: 0,
          institutions: 0
        })),
        summary: {
          totalInstitutions,
          totalElections,
          totalVoters,
          totalCandidates,
          totalVotes
        },
        topInstitutions: {
          byElections: topInstitutions
        }
      }
    });
  }),

  getUserGrowth: catchAsync(async (req, res, next) => {
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied. Super admin only.', 403));
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    
    const userGrowthData = await User.aggregate([
      { $match: { 
        createdAt: { $gte: new Date(currentYear - 1, 0, 1) }
      }},
      { $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          role: '$role'
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const last12Months = [];
    const voterGrowth = [];
    const candidateGrowth = [];
    
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[date.getMonth()];
      
      const monthData = userGrowthData.filter(d => 
        d._id.year === date.getFullYear() && d._id.month === date.getMonth() + 1
      );
      
      const voters = monthData.find(d => d._id.role === 'voter' || d._id.role === 'user')?.count || 0;
      const candidates = monthData.find(d => d._id.role === 'candidate')?.count || 0;
      
      last12Months.push(monthName);
      voterGrowth.push(voters);
      candidateGrowth.push(candidates);
    }

    res.status(200).json({
      status: 'success',
      data: {
        months: last12Months,
        voterGrowth,
        candidateGrowth
      }
    });
  }),

  
  getInstitutionActivity: catchAsync(async (req, res, next) => {
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied. Super admin only.', 403));
    }

    
    const institutionActivity = await Institution.aggregate([
      { $lookup: {
        from: 'elections',
        localField: '_id',
        foreignField: 'institutionId',
        as: 'elections'
      }},
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'institutionId',
        as: 'voters',
        pipeline: [
          { $match: { role: { $in: ['voter', 'user'] } } }
        ]
      }},
      { $addFields: {
        totalElections: { $size: '$elections' },
        activeElections: {
          $size: {
            $filter: {
              input: '$elections',
              cond: { $in: ['$$this.status', ['voting_open', 'nomination_open']] }
            }
          }
        },
        completedElections: {
          $size: {
            $filter: {
              input: '$elections',
              cond: { $in: ['$$this.status', ['completed', 'results_published']] }
            }
          }
        },
        totalVoters: { $size: '$voters' }
      }},
      { $project: {
        _id: 1, name: 1, code: 1, status: 1, createdAt: 1,
        totalElections: 1, activeElections: 1, completedElections: 1, totalVoters: 1
      }},
      { $sort: { totalElections: -1 } }
    ]);

    const summary = institutionActivity.reduce((acc, inst) => ({
      totalInstitutions: acc.totalInstitutions + 1,
      totalElections: acc.totalElections + inst.totalElections,
      totalVoters: acc.totalVoters + inst.totalVoters
    }), { totalInstitutions: 0, totalElections: 0, totalVoters: 0 });

    res.status(200).json({
      status: 'success',
      data: {
        institutions: institutionActivity,
        summary
      }
    });
  }),

  getPlatformSummary: catchAsync(async (req, res, next) => {
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied. Super admin only.', 403));
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    
    const [
      institutionCounts,
      electionCounts,
      userCounts,
      voteCounts,
      newElectionsThisMonth,
      newVotersThisMonth
    ] = await Promise.all([
      Institution.aggregate([
        { $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } }
        }}
      ]),
      Election.aggregate([
        { $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: [{ $in: ['$status', ['voting_open', 'nomination_open', 'registration_open']] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $in: ['$status', ['completed', 'results_published']] }, 1, 0] } }
        }}
      ]),
      User.aggregate([
        { $group: {
          _id: '$role',
          count: { $sum: 1 }
        }}
      ]),
      Vote.aggregate([
        { $facet: {
          total: [{ $count: 'count' }],
          yesterday: [
            { $match: { castAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 1)) } } },
            { $count: 'count' }
          ]
        }}
      ]),
      Election.countDocuments({ createdAt: { $gte: startOfMonth } }),
      User.countDocuments({ 
        role: { $in: ['voter', 'user'] },
        createdAt: { $gte: startOfMonth }
      })
    ]);

    const userMap = {};
    userCounts.forEach(u => { userMap[u._id] = u.count; });

    const inst = institutionCounts[0] || { total: 0, active: 0, pending: 0 };
    const elec = electionCounts[0] || { total: 0, active: 0, completed: 0 };

    res.status(200).json({
      status: 'success',
      data: {
        institutions: {
          total: inst.total,
          active: inst.active,
          pending: inst.pending
        },
        elections: {
          total: elec.total,
          active: elec.active,
          completed: elec.completed,
          newThisMonth: newElectionsThisMonth
        },
        users: {
          voters: (userMap.voter || 0) + (userMap.user || 0),
          candidates: userMap.candidate || 0,
          admins: userMap.electionAdmin || 0,
          newVotersThisMonth
        },
        votes: {
          total: voteCounts[0]?.total?.[0]?.count || 0,
          yesterday: voteCounts[0]?.yesterday?.[0]?.count || 0
        }
      }
    });
  }),

  
  getSystemAnalytics: catchAsync(async (req, res, next) => {
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied. Super admin only.', 403));
    }

    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    
    const [
      monthlyElections,
      monthlyVotes,
      monthlyUsers,
      electionStatus,
      roleDistribution,
      topInstitutions,
      hourlyVotes,
      weeklyActivity
    ] = await Promise.all([
      
      Election.aggregate([
        { $match: { createdAt: { $gte: new Date(currentYear, 0, 1) } } },
        { $group: { _id: { $month: '$createdAt' }, count: { $sum: 1 } } }
      ]),
      Vote.aggregate([
        { $match: { castAt: { $gte: new Date(currentYear, 0, 1) } } },
        { $group: { _id: { $month: '$castAt' }, count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $match: { 
          role: { $in: ['voter', 'user', 'candidate'] },
          createdAt: { $gte: new Date(currentYear, 0, 1) }
        }},
        { $group: {
          _id: { month: { $month: '$createdAt' }, role: '$role' },
          count: { $sum: 1 }
        }}
      ]),
      Election.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      Institution.aggregate([
        { $match: { status: 'active' } },
        { $lookup: {
          from: 'elections',
          localField: '_id',
          foreignField: 'institutionId',
          as: 'elections'
        }},
        { $addFields: { electionCount: { $size: '$elections' } } },
        { $sort: { electionCount: -1 } },
        { $limit: 10 },
        { $project: { name: 1, electionCount: 1 } }
      ]),
      Vote.aggregate([
        { $match: { castAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } },
        { $group: { _id: { $hour: '$castAt' }, count: { $sum: 1 } } },
        { $sort: { '_id': 1 } }
      ]),
      Vote.aggregate([
        { $group: { _id: { $dayOfWeek: '$castAt' }, count: { $sum: 1 } } }
      ])
    ]);

    // Process monthly data
    const electionMap = {};
    monthlyElections.forEach(e => { electionMap[e._id] = e.count; });
    
    const voteMap = {};
    monthlyVotes.forEach(v => { voteMap[v._id] = v.count; });
    
    const voterMap = {};
    const candidateMap = {};
    monthlyUsers.forEach(u => {
      if (u._id.role === 'voter' || u._id.role === 'user') {
        voterMap[u._id.month] = (voterMap[u._id.month] || 0) + u.count;
      } else if (u._id.role === 'candidate') {
        candidateMap[u._id.month] = u.count;
      }
    });

    const monthlyData = months.map((month, i) => ({
      month,
      voters: voterMap[i + 1] || 0,
      candidates: candidateMap[i + 1] || 0,
      elections: electionMap[i + 1] || 0,
      votes: voteMap[i + 1] || 0
    }));

    const statusMap = {};
    electionStatus.forEach(s => { statusMap[s._id] = s.count; });

    const roleMap = {};
    roleDistribution.forEach(r => { roleMap[r._id] = r.count; });

    const hourlyMap = {};
    hourlyVotes.forEach(h => { hourlyMap[h._id] = h.count; });
    
    const hourlyData = [];
    for (let hour = 0; hour < 24; hour++) {
      hourlyData.push({
        hour: `${hour}:00`,
        votes: hourlyMap[hour] || 0
      });
    }

    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyData = [];
    weeklyActivity.forEach(w => {
      weeklyData.push({
        day: weekDays[w._id - 1],
        votes: w.count
      });
    });
    weeklyData.sort((a, b) => weekDays.indexOf(a.day) - weekDays.indexOf(b.day));

    res.status(200).json({
      status: 'success',
      data: {
        monthlyUsers: monthlyData.map(m => ({ month: m.month, voters: m.voters, candidates: m.candidates })),
        electionStatus: {
          voting_open: statusMap.voting_open || 0,
          nomination_open: statusMap.nomination_open || 0,
          registration_open: statusMap.registration_open || 0,
          results_published: statusMap.results_published || 0,
          completed: statusMap.completed || 0,
          draft: statusMap.draft || 0
        },
        monthlyVotes: monthlyData.map(m => ({ month: m.month, votes: m.votes })),
        institutionGrowth: monthlyData.map(m => ({ month: m.month, institutions: 0 })),
        topInstitutions: { byElections: topInstitutions },
        roleDistribution: {
          voters: (roleMap.voter || 0) + (roleMap.user || 0),
          candidates: roleMap.candidate || 0,
          electionAdmins: roleMap.electionAdmin || 0,
          superAdmins: roleMap.superAdmin || 0
        },
        hourlyVotes: hourlyData,
        weeklyActivity: weeklyData,
        summary: {
          totalElections: electionStatus.reduce((sum, s) => sum + s.count, 0),
          totalVotes: voteMap[0] || 0, 
          totalUsers: roleDistribution.reduce((sum, r) => sum + r.count, 0),
          totalInstitutions: await Institution.countDocuments(),
          activeElections: statusMap.voting_open || 0
        }
      }
    });
  }),

  getSystemSettings: catchAsync(async (req, res, next) => {
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied. Super admin only.', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        platform: {
          name: 'ECMS - Election Control Management System',
          version: '2.0.0',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@ecms.com'
        },
        security: {
          sessionTimeout: 60,
          maxLoginAttempts: 5,
          require2FAForAdmins: true,
          passwordExpiryDays: 90
        },
        election: {
          defaultMaxCandidatesPerPosition: 5,
          allowMultipleWinners: true,
          allowRankedVoting: true,
          defaultNominationPeriodDays: 7,
          defaultVotingPeriodDays: 3
        },
        notifications: {
          emailVoteReceipts: true,
          emailResultsPublished: true,
          emailNominationStatus: true
        }
      }
    });
  }),

  updateSystemSettings: catchAsync(async (req, res, next) => {
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied. Super admin only.', 403));
    }

    res.status(200).json({
      status: 'success',
      message: 'Settings updated successfully'
    });
  }),
  getRecentActivities: catchAsync(async (req, res, next) => {
    if (req.user.role !== 'superAdmin') {
      return next(new AppError('Access denied. Super admin only.', 403));
    }

    const [recentInstitutions, recentElections, recentVotes] = await Promise.all([
      Institution.find().sort({ createdAt: -1 }).limit(5).select('name status createdAt').lean(),
      Election.find().sort({ createdAt: -1 }).limit(5).select('title status createdAt').lean(),
      Vote.find().sort({ castAt: -1 }).limit(5).populate('userId', 'firstName lastName').lean()
    ]);

    const activities = [];

    recentInstitutions.forEach(inst => {
      activities.push({
        id: inst._id,
        type: inst.status === 'pending' ? 'INSTITUTION_REQUEST' : 'INSTITUTION_CREATED',
        message: `${inst.status === 'pending' ? 'New institution request' : 'New institution created'}: ${inst.name}`,
        timestamp: inst.createdAt,
        details: { institutionId: inst._id, status: inst.status }
      });
    });

    recentElections.forEach(election => {
      activities.push({
        id: election._id,
        type: 'ELECTION_CREATED',
        message: `New election created: ${election.title}`,
        timestamp: election.createdAt,
        details: { electionId: election._id, status: election.status }
      });
    });

    recentVotes.forEach(vote => {
      activities.push({
        id: vote._id,
        type: 'VOTE_CAST',
        message: `Vote cast by ${vote.userId?.firstName || 'User'} ${vote.userId?.lastName || ''}`,
        timestamp: vote.castAt,
        details: { voteId: vote._id }
      });
    });

    const sortedActivities = activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    res.status(200).json({
      status: 'success',
      data: { recentActivities: sortedActivities }
    });
  }),

};

module.exports = dashboardController;