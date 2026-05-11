// pages/voter/CastVote.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { voteService } from '../../services/voteService';
import {
  makeSelection,
  advanceStep,
  retreatStep,
  submitVoteStart,
  submitVoteFailure
} from '../../Js/voting-slice';
import ReviewVote from '../../components/voting/ReviewVote';
import CandidateCard from './CandidateCard';
import CandidateModal from './CandidateModal';
import PositionModal from '../../components/common/PositionModal';
import { 
  FiAlertCircle, 
  FiEye, 
  FiCheckCircle, 
  FiClipboard,
  FiBarChart2,      
  FiUsers,          
  FiAward,
  FiLock
} from 'react-icons/fi';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL_UPLOAD || 'http://localhost:4001';

// Helper function for image URLs
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  let normalizedPath = imagePath.replace(/\\/g, '/');
  if (normalizedPath.startsWith('uploads/uploads/')) normalizedPath = normalizedPath.replace('uploads/uploads/', 'uploads/');
  if (normalizedPath.startsWith('/uploads/')) normalizedPath = normalizedPath.substring(1);
  normalizedPath = normalizedPath.replace(/\/+/g, '/');
  return `${API_BASE_URL}/${normalizedPath}`;
};

const CastVote = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { currentStep, selections, loading, error } = useSelector(state => state.voting);
  
  const [election, setElection] = useState(location.state?.election || null);
  const [positions, setPositions] = useState([]);
  const [votingDataLoaded, setVotingDataLoaded] = useState(false);
  const [selectedCandidateDetails, setSelectedCandidateDetails] = useState(null);
  const [selectedPositionModal, setSelectedPositionModal] = useState(null);
  const [hasAlreadyVoted, setHasAlreadyVoted] = useState(false);

  useEffect(() => {
    const loadVotingData = async () => {
      try {
        const hasVoted = await voteService.hasVoted(electionId);
        if (hasVoted) {
          setHasAlreadyVoted(true);
          setVotingDataLoaded(true);
          return;
        }
        
        const data = await voteService.getVotingData(electionId);
        setElection(data.election);
        
        // Process positions with image URLs
        const processedPositions = data.positions.map(position => ({
          ...position,
          candidates: position.candidates.map(candidate => ({
            ...candidate,
            processedPhotoUrl: getImageUrl(candidate.campaignPhoto)
          }))
        }));
        
        setPositions(processedPositions);
        setVotingDataLoaded(true);
      } catch (err) {
        console.error('Error loading voting data:', err);
        alert(err.response?.data?.message || 'Failed to load election data');
        navigate('/voter/elections');
      }
    };
    
    if (location.state?.election) {
      loadVotingData();
    } else {
      navigate('/voter/elections');
    }
  }, [electionId, location.state?.election, navigate]);

  const handleVoteSelect = (positionId, candidateId) => {
    if (hasAlreadyVoted) return;
    dispatch(makeSelection({ positionId, candidateId }));
  };

  const handleViewCandidateDetails = (candidate) => {
    setSelectedCandidateDetails(candidate);
  };

  const handleViewPositionDetails = (position) => {
    setSelectedPositionModal(position);
  };

  const handleSubmitVotes = async () => {
    const totalPositions = positions.length;
    const votedPositions = Object.keys(selections).length;
    
    if (votedPositions !== totalPositions) {
      alert(`Please vote for all ${totalPositions} positions before submitting. You have voted for ${votedPositions} positions.`);
      return;
    }
    
    const votes = [];
    for (const position of positions) {
      const selectedCandidateId = selections[position.positionId];
      if (!selectedCandidateId) {
        alert(`Please vote for ${position.positionName}`);
        return;
      }
      
      const candidate = position.candidates.find(c => c._id === selectedCandidateId);
      if (candidate) {
        votes.push({
          positionId: position.positionId,
          positionName: position.positionName,
          candidateId: candidate._id,
          candidateName: `${candidate.userId?.firstName} ${candidate.userId?.lastName}`,
          rank: position.electionType === 'ranked' ? 1 : null
        });
      }
    }
    
    if (votes.length === 0) {
      alert('No votes to submit. Please make your selections.');
      return;
    }
    
    dispatch(submitVoteStart());
    
    try {
      const result = await voteService.castVote(electionId, votes);
      navigate('/voter/vote-success', { 
        state: { 
          voteId: result.confirmationCode,
          electionTitle: election.title,
          voteDetails: {
            positionTitle: votes[0]?.positionName,
            candidateName: votes[0]?.candidateName,
            timestamp: result.castAt || new Date().toISOString()
          }
        } 
      });
    } catch (err) {
      console.error('Submission error:', err);
      dispatch(submitVoteFailure(err.response?.data?.message || 'Failed to submit vote'));
      alert(err.response?.data?.message || 'Failed to submit your vote. Please try again.');
    }
  };

  const getElectionTypeIcon = (type) => {
    switch(type) {
      case 'ranked': return <FiBarChart2 size={14} />;
      case 'multiple_winners': return <FiUsers size={14} />;
      default: return <FiAward size={14} />;
    }
  };

  const getPositionStatus = (type) => {
    if (type === 'ranked') return { text: 'Ranked Voting', bg: '#ede9fe', color: '#6d28d9' };
    if (type === 'multiple_winners') return { text: 'Multiple Winners', bg: '#dcfce7', color: '#166534' };
    return { text: 'Single Winner', bg: '#fef3c7', color: '#D23A01' };
  };

  if (hasAlreadyVoted && votingDataLoaded) {
    return (
      <div style={styles.alreadyVotedContainer}>
        <div style={styles.alreadyVotedCard}>
          <div style={styles.alreadyVotedIcon}><FiCheckCircle size={64} color="#10b981" /></div>
          <h2 style={styles.alreadyVotedTitle}>You've Already Voted!</h2>
          <p style={styles.alreadyVotedMessage}>Thank you for participating in this election. Your vote has been recorded and counted.</p>
          <div style={styles.alreadyVotedInfo}><FiLock size={16} /><span>Your vote is secure and anonymous</span></div>
          <div style={styles.alreadyVotedActions}>
            <button style={{...styles.alreadyVotedBtn, ...styles.viewResultsBtn}} onClick={() => navigate(`/voter/results/${electionId}`)}>View Election Results</button>
            <button style={{...styles.alreadyVotedBtn, ...styles.backToElectionsBtn}} onClick={() => navigate('/voter/elections')}>Back to Elections</button>
          </div>
        </div>
      </div>
    );
  }

  if (!votingDataLoaded || !election) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p>Loading voting ballot...</p>
      </div>
    );
  }

  const totalPositions = positions.length;
  const votedCount = Object.keys(selections).length;

  return (
    <div style={styles.container}>
      {error && (<div style={styles.errorBox}><FiAlertCircle size={18} /><p>{error}</p><button onClick={() => dispatch(submitVoteFailure(null))}>Dismiss</button></div>)}
      
      <div style={styles.bodyStyle}>
        <div style={styles.containerStyle}>
          <div style={styles.headerStyle}>
            <h1 style={styles.headerH1Style}><FiClipboard size={32} /> Election Positions</h1>
            <p style={styles.headerPStyle}>Select your preferred candidate for each position</p>
          </div>

          <div style={styles.positionsGridStyle}>
            {positions.map(position => {
              const totalCandidates = position.candidates?.length || 0;
              const selectedCandidateId = selections[position.positionId];
              const selectedCandidate = selectedCandidateId ? position.candidates?.find(c => c._id === selectedCandidateId) : null;
              const status = getPositionStatus(position.electionType);

              return (
                <div key={position.positionId} style={styles.positionCardStyle}>
                  <div style={styles.cardHeaderStyle}>
                    <div style={styles.positionTitleRowStyle}>
                      <div><div style={styles.positionNameStyle}>{position.positionName}</div></div>
                      <div style={styles.positionBadgeStyle}>
                        <p style={{ ...styles.badgeStyle, ...styles.badgeTypeStyle, background: status.bg, color: status.color }}>
                          {getElectionTypeIcon(position.electionType)} {status.text}
                        </p>
                        <p style={{ ...styles.badgeStyle, ...styles.badgeSeatsStyle }}>{position.totalSeats} Seat{position.totalSeats > 1 ? 's' : ''}</p>
                        <p style={{ ...styles.badgeStyle, ...styles.badgeStatusStyle }}>{totalCandidates} Candidates</p>
                        {selectedCandidate && (<p style={{ ...styles.badgeStyle, ...styles.selectedBadgeStyle }}><FiCheckCircle size={10} /> Voted</p>)}
                      </div>
                    </div>
                    <div style={styles.positionDescStyle}>{position.positionDescription?.substring(0, 100)}...</div>
                  </div>

                  <div style={styles.candidatesGridStyle}>
                    {position.candidates?.map(candidate => {
                      const isSelected = selectedCandidateId === candidate._id;
                      return (<CandidateCard key={candidate._id} candidate={candidate} positionName={position.positionName} onViewDetails={handleViewCandidateDetails} onVote={() => handleVoteSelect(position.positionId, candidate._id)} isSelected={isSelected} disabled={isSelected} />);
                    })}
                  </div>

                  <button style={styles.positionEyeBtn} onClick={() => handleViewPositionDetails({
                    positionId: position.positionId, positionName: position.positionName,
                    positionDescription: position.positionDescription, electionType: position.electionType,
                    totalSeats: position.totalSeats, seatAllocation: position.seatAllocation,
                    candidates: position.candidates?.map(c => ({ id: c._id, name: `${c.userId?.firstName} ${c.userId?.lastName}`, slogan: c.slogan, percentage: 0 })) || [],
                    totalVotes: 0
                  })} title="View Position Details"><FiEye size={18} /></button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      <div style={styles.submitSection}>
        <button style={{...styles.reviewBtn, opacity: votedCount === totalPositions ? 1 : 0.5, cursor: votedCount === totalPositions ? 'pointer' : 'not-allowed'}} onClick={() => votedCount === totalPositions && dispatch(advanceStep())} disabled={votedCount !== totalPositions}>Review Your Votes ({votedCount}/{totalPositions})</button>
      </div>
      
      {currentStep === 2 && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <ReviewVote election={election} positions={positions.map(p => ({ positionId: p.positionId, title: p.positionName, electionType: p.electionType, totalSeats: p.totalSeats, candidates: p.candidates.map(c => ({ id: c._id, name: `${c.userId?.firstName} ${c.userId?.lastName}`, photoUrl: c.processedPhotoUrl, slogan: c.slogan, biography: c.biography, manifesto: c.manifesto })) }))} />
            <div style={styles.modalActions}>
              <button style={styles.backToVoteBtn} onClick={() => dispatch(retreatStep())}>Back to Voting</button>
              <button style={styles.submitFinalBtn} onClick={handleSubmitVotes} disabled={loading}>{loading ? 'Submitting...' : 'Confirm & Submit Votes'}</button>
            </div>
          </div>
        </div>
      )}
      
      {selectedCandidateDetails && (<CandidateModal candidate={selectedCandidateDetails} isOpen={true} onClose={() => setSelectedCandidateDetails(null)} />)}
      {selectedPositionModal && (<PositionModal position={selectedPositionModal} isOpen={true} onClose={() => setSelectedPositionModal(null)} />)}
      
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const styles = {
  container: { maxWidth: '1400px', margin: '0 auto', padding: 'clamp(16px, 4vw, 32px)', marginTop: 'clamp(60px, 10vh, 80px)' },
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' },
  spinner: { width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTop: '3px solid #D23A01', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  errorBox: { background: '#fee2e2', color: '#dc2626', padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)', borderRadius: '12px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  submitSection: { display: 'flex', justifyContent: 'flex-end', marginTop: '16px', marginBottom: '40px' },
  reviewBtn: { width: '100%', maxWidth: '300px', padding: 'clamp(12px, 3vw, 16px)', background: '#D23A01', color: 'white', border: 'none', borderRadius: '12px', fontSize: 'clamp(14px, 3vw, 16px)', fontWeight: '600', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 4vw, 20px)' },
  modalContent: { background: 'white', borderRadius: '20px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto' },
  modalActions: { display: 'flex', gap: '16px', padding: '20px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap' },
  backToVoteBtn: { flex: 1, padding: 'clamp(10px, 2.5vw, 12px)', background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '500' },
  submitFinalBtn: { flex: 1, padding: 'clamp(10px, 2.5vw, 12px)', background: '#D23A01', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '500' },
  bodyStyle: { background: 'white', paddingTop: '20px', paddingBottom: '20px' },
  containerStyle: { maxWidth: '1300px', margin: '0 auto', background: 'transparent' },
  headerStyle: { marginBottom: 'clamp(20px, 4vw, 28px)' },
  headerH1Style: { fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: '700', color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  headerPStyle: { color: '#64748b', fontSize: 'clamp(12px, 3vw, 13px)' },
  positionsGridStyle: { display: 'flex', flexDirection: 'column', gap: 'clamp(24px, 5vw, 32px)' },
  positionCardStyle: { background: 'white', borderRadius: 'clamp(16px, 3vw, 24px)', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', position: 'relative' },
  positionEyeBtn: { position: 'absolute', top: 'clamp(12px, 2vw, 16px)', right: 'clamp(12px, 2vw, 16px)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 'clamp(32px, 6vw, 36px)', height: 'clamp(32px, 6vw, 36px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', backdropFilter: 'blur(4px)', zIndex: 10 },
  cardHeaderStyle: { padding: 'clamp(16px, 4vw, 20px) clamp(16px, 4vw, 24px)', background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)', borderBottom: '1px solid #e2e8f0', paddingRight: 'clamp(50px, 10vw, 60px)' },
  positionTitleRowStyle: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' },
  positionNameStyle: { fontSize: 'clamp(18px, 4vw, 20px)', fontWeight: '700', color: '#0f172a' },
  positionBadgeStyle: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  badgeStyle: { padding: '4px 10px', borderRadius: '30px', fontSize: 'clamp(10px, 2.5vw, 11px)', fontWeight: '600' },
  badgeTypeStyle: { background: '#fef3c7', color: '#D23A01' },
  badgeSeatsStyle: { background: '#f1f5f9', color: '#475569' },
  badgeStatusStyle: { background: '#dcfce7', color: '#166534' },
  selectedBadgeStyle: { background: '#10b981', color: 'white' },
  positionDescStyle: { fontSize: 'clamp(12px, 3vw, 13px)', color: '#64748b', lineHeight: '1.5', marginTop: '8px' },
  candidatesGridStyle: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 'clamp(16px, 3vw, 25px)', padding: 'clamp(16px, 3vw, 24px)' },
  
  alreadyVotedContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 10vh)', background: '#f8fafc', padding: 'clamp(20px, 5vw, 40px)', marginTop: '10vh' },
  alreadyVotedCard: { maxWidth: '500px', width: '100%', background: 'white', borderRadius: '24px', padding: 'clamp(32px, 6vw, 48px)', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' },
  alreadyVotedIcon: { marginBottom: '24px' },
  alreadyVotedTitle: { fontSize: 'clamp(24px, 5vw, 28px)', fontWeight: '800', color: '#0f172a', marginBottom: '12px', fontFamily: "'Poppins', sans-serif" },
  alreadyVotedMessage: { fontSize: 'clamp(14px, 3vw, 16px)', color: '#4b5563', marginBottom: '20px', lineHeight: '1.5' },
  alreadyVotedInfo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px', background: '#f1f5f9', borderRadius: '12px', marginBottom: '28px', fontSize: '13px', color: '#475569', flexWrap: 'wrap' },
  alreadyVotedActions: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  alreadyVotedBtn: { flex: 1, padding: 'clamp(12px, 3vw, 14px) clamp(20px, 4vw, 24px)', borderRadius: '12px', fontSize: 'clamp(13px, 3vw, 14px)', fontWeight: '600', cursor: 'pointer', border: 'none' },
  viewResultsBtn: { background: '#D23A01', color: 'white' },
  backToElectionsBtn: { background: '#f1f5f9', color: '#475569' }
};

export default CastVote;