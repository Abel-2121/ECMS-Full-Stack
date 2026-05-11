// pages/voter/VoteElectionList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllElections } from '../../Js/election-slice';
import { FiCalendar, FiUsers, FiCheckCircle, FiShield, FiClock, FiAward } from 'react-icons/fi';
import { formatLocalDate } from '../../utils/formatLocalDate';

const VoteElectionList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { elections, loading } = useSelector(state => state.election);
  const [eligibleElections, setEligibleElections] = useState([]);

  useEffect(() => {
    dispatch(fetchAllElections());
  }, [dispatch]);

  useEffect(() => {
    const votingElections = elections.filter(e => e.status === 'voting_open');
    setEligibleElections(votingElections);
  }, [elections]);

  const getTimeRemaining = (votingEnd) => {
    const end = new Date(votingEnd);
    const now = new Date();
    const diff = end - now;
    if (diff <= 0) return 'Voting ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (86400000)) / (1000 * 60 * 60));
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  };

  const startVoting = (election) => {
    const isVerified = sessionStorage.getItem(`verified_${election._id}`);
    if (isVerified === 'true') {
      navigate(`/voter/cast/${election._id}`, { state: { election } });
    } else {
      navigate(`/voter/verify/${election._id}`, { state: { election } });
    }
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p>Loading eligible elections...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <FiAward size={32} style={{ color: '#D23A01' }} /> Active Elections
        </h1>
        <p style={styles.subtitle}>Select an election to cast your vote</p>
      </div>

      {eligibleElections.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🗳️</div>
          <h3>No Active Elections</h3>
          <p>There are no active elections available for voting at this time.</p>
        </div>
      ) : (
        <div style={styles.electionsGrid} className='election-grid'>
          {eligibleElections.map(election => (
            <div key={election._id} style={styles.electionCard}>
              <div style={styles.cardBadge}>
                <span style={styles.liveBadge}>
                  <FiCheckCircle size={12} /> LIVE
                </span>
                <span style={styles.secureBadge}>
                  <FiShield size={12} /> Secure Voting
                </span>
              </div>
              
              <h3 style={styles.electionTitle}>{election.title}</h3>
              <p style={styles.electionDesc}>
                {election.description?.slice(0, 120)}...
              </p>
              
              <div style={styles.electionMeta}>
                <div style={styles.metaItem}>
                  <FiCalendar size={14} />
                  <span>Ends: {formatLocalDate(election.timeline?.votingEnd)}</span>
                </div>
                <div style={styles.metaItem}>
                  <FiClock size={14} />
                  <span>{getTimeRemaining(election.timeline?.votingEnd)}</span>
                </div>
                <div style={styles.metaItem}>
                  <FiUsers size={14} />
                  <span>{election.positions?.length || 0} Positions</span>
                </div>
              </div>
              
              <button style={styles.voteBtn} onClick={() => startVoting(election)}>
                <FiShield size={16} /> Verify & Vote
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: 'clamp(20px, 5vw, 32px)', marginTop: 'clamp(60px, 12vh, 100px)' },
  header: { marginBottom: 'clamp(24px, 5vw, 32px)' },
  title: { fontSize: 'clamp(28px, 6vw, 32px)', fontWeight: '800', color: '#1a1a1a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' },
  subtitle: { fontSize: '16px', color: '#4b5563' },
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' },
  spinner: { width: '50px', height: '50px', border: '3px solid #e5e7eb', borderTop: '3px solid #D23A01', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  emptyState: { textAlign: 'center', padding: '60px', background: 'white', borderRadius: '20px', border: '1px solid #e5e7eb' },
  emptyIcon: { fontSize: '64px', marginBottom: '16px' },
  electionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' },
  electionCard: { background: 'white', borderRadius: '24px', padding: 'clamp(20px, 4vw, 28px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s', border: '1px solid #e5e7eb' },
  cardBadge: { display: 'flex', justifyContent: 'space-between', marginBottom: '16px' },
  liveBadge: { background: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '24px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' },
  secureBadge: { background: '#FEF3F0', color: '#D23A01', padding: '6px 12px', borderRadius: '24px', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' },
  electionTitle: { fontSize: 'clamp(18px, 4vw, 20px)', fontWeight: '800', color: '#1a1a1a', marginBottom: '12px' },
  electionDesc: { color: '#4b5563', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' },
  electionMeta: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', padding: '14px', background: '#f8fafc', borderRadius: '14px' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#1a1a1a' },
  voteBtn: { width: '100%', padding: '14px', background: '#D23A01', color: 'white', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.2s' }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @media (max-width: 768px) {
    .elections-grid { grid-template-columns: 1fr !important; }
  }
  input:focus { border-color: #D23A01 !important; box-shadow: 0 0 0 3px rgba(210, 58, 1, 0.1); }
`;
if (!document.head.querySelector('#vote-election-list-styles')) {
  styleSheet.id = 'vote-election-list-styles';
  document.head.appendChild(styleSheet);
}

export default VoteElectionList;