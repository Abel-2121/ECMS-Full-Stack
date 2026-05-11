
const cron = require('node-cron');
const Election = require('../model/Election');
const Vote = require('../model/Vote');
const Candidate = require('../model/Candidates');
const VoterEligibilityLists = require('../model/VoterEligibilityLists');
const ACTIVE_STATUSES = [
  'draft',
  'registration_open',
  'registration_closed',
  'nomination_open',
  'nomination_closed',
  'voting_open',
  'voting_closed'
];
const FINAL_STATUSES = [
  'results_published',
  'completed'
];

function getCurrentStatus(timeline) {
  const now = new Date();
  const regStart = new Date(timeline.registrationStart);
  const regEnd = new Date(timeline.registrationEnd);
  const nomStart = new Date(timeline.nominationStart);
  const nomEnd = new Date(timeline.nominationEnd);
  const voteStart = new Date(timeline.votingStart);
  const voteEnd = new Date(timeline.votingEnd);
  const resultDate = new Date(timeline.resultPublicationDate);

  if (now >= resultDate) return 'results_published';
  if (now >= voteStart && now <= voteEnd) return 'voting_open';
  if (now > voteEnd && now < resultDate) return 'voting_closed';
  if (now >= nomStart && now <= nomEnd) return 'nomination_open';
  if (now > nomEnd && now < voteStart) return 'nomination_closed';
  if (now >= regStart && now <= regEnd) return 'registration_open';
  if (now > regEnd && now < nomStart) return 'registration_closed';
  return 'draft';
}

async function updateElectionStatistics(election) {
  try {
    const voterList = await VoterEligibilityLists.findOne({ electionId: election._id });
    const totalEligibleVoters = voterList ? voterList.eligibleVoters?.length || 0 : 0;
    const totalVotesCast = await Vote.countDocuments({ electionId: election._id });
    const totalCandidates = await Candidate.countDocuments({ 
      electionId: election._id, 
      status: { $in: ['approved', 'elected'] }
    });

    const statsChanged = 
      election.statistics.totalEligibleVoters !== totalEligibleVoters ||
      election.statistics.totalVotesCast !== totalVotesCast ||
      election.statistics.totalCandidates !== totalCandidates;

    election.statistics.totalEligibleVoters = totalEligibleVoters;
    election.statistics.totalVotesCast = totalVotesCast;
    election.statistics.totalCandidates = totalCandidates;

    return { statsChanged };
  } catch (error) {
    console.error(`Error updating statistics:`, error);
    return null;
  }
}

cron.schedule('* * * * *', async () => {
  try {

    const activeElections = await Election.find({
      status: { $in: ACTIVE_STATUSES }
    });
    if (activeElections.length === 0) {
      return;
    }
    
    let statusUpdatedCount = 0;
    let statsUpdatedCount = 0;

    for (const election of activeElections) {
      let changed = false;
      
      // Check status change
      const newStatus = getCurrentStatus(election.timeline);
      if (election.status !== newStatus) {
        console.log(`[Status] ${election.title}: ${election.status} → ${newStatus}`);
        election.status = newStatus;
        statusUpdatedCount++;
        changed = true;
      }
      
      // Update statistics
      const stats = await updateElectionStatistics(election);
      if (stats?.statsChanged) {
        statsUpdatedCount++;
        changed = true;
      }
      
      if (changed) {
        await election.save();
      }
    }
  
    // Log only when something changed
    if (statusUpdatedCount > 0 || statsUpdatedCount > 0) {
      console.log(` Updated: ${statusUpdatedCount} status, ${statsUpdatedCount} stats`);
    }
    
  } catch (error) {
    console.error('Scheduler error:', error);
  }
});

// Run on server startup - catch any missed updates
const updateAllElectionStatuses = async () => {
  console.log('🔄 Running initial election status check...');
  
  const activeElections = await Election.find({
    status: { $in: ACTIVE_STATUSES }
  });
  
  let updatedCount = 0;
  
  for (const election of activeElections) {
    const newStatus = getCurrentStatus(election.timeline);
    if (election.status !== newStatus) {
      election.status = newStatus;
      await election.save();
      updatedCount++;
    }
  }
  
  if (updatedCount > 0) {
    console.log(`Fixed ${updatedCount} election(s) on startup`);
  }
};


updateAllElectionStatuses();

console.log('⏰ Election scheduler running - monitoring active elections only');