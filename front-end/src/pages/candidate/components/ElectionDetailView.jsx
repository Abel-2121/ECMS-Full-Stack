// pages/candidate/components/nomination/ElectionDetailView.jsx
import React from 'react';
import { FiArrowLeft, FiCalendar, FiUsers, FiAward, FiArrowRight } from 'react-icons/fi';
import { formatLocalDate } from '../../../utils/formatLocalDate';
export const ElectionDetailView = ({ viewingElection, onBack, onSelectElection }) => {
 


  const getElectionStatus = (election) => {
    const status = election.status;
    
    switch(status) {
      case 'nomination_open':
        return { text: 'Nominations Open', color: '#dcfce7', textColor: '#166534', isOpen: true };
      case 'registration_open':
        return { text: 'Registration Open', color: '#dbeafe', textColor: '#1e40af', isOpen: false };
      case 'voting_open':
        return { text: 'Voting in Progress', color: '#fed7aa', textColor: '#9a3412', isOpen: false };
      case 'results_published':
      case 'completed':
        return { text: 'Election Completed', color: '#e2e8f0', textColor: '#475569', isOpen: false };
      default:
        return { text: 'Coming Soon', color: '#fef3c7', textColor: '#92400e', isOpen: false };
    }
  };

  const status = getElectionStatus(viewingElection);
  const isOpen = status.text === 'Nominations Open';

  return (
    <div style={styles.detailContainer}>
      <button style={styles.backButton} onClick={onBack}>
        <FiArrowLeft /> Back to Elections
      </button>
      
      <div style={styles.detailCard}>
        <div style={styles.detailHeader}>
          <div>
            <h1>{viewingElection.title}</h1>
            <p style={{
              ...styles.electionStatus,
              background: status.color,
              color: status.textColor
            }}>
              {status.text}
            </p>
          </div>
          <button 
            style={{
              ...styles.selectElectionBtn,
              opacity: isOpen ? 1 : 0.5,
              cursor: isOpen ? 'pointer' : 'not-allowed'
            }}
            onClick={() => isOpen && onSelectElection(viewingElection)}
            disabled={!isOpen}
          >
            Select This Election <FiArrowRight />
          </button>
        </div>
        
        <p style={styles.detailDescription}>{viewingElection.description}</p>
        
        <div style={styles.detailStats}>
          <div style={styles.detailStat}>
            <FiCalendar size={20} color="#2563EB" />
            <div>
              <div style={styles.statLabel}>Nomination Period</div>
              <strong>{formatLocalDate(viewingElection.timeline?.nominationStart,true)} - {formatLocalDate(viewingElection.timeline?.nominationEnd,true)}</strong>
            </div>
          </div>
          <div style={styles.detailStat}>
            <FiCalendar size={20} color="#2563EB" />
            <div>
              <div style={styles.statLabel}>Voting Period</div>
              <strong>{formatLocalDate(viewingElection.timeline?.votingStart,true)} - {formatLocalDate(viewingElection.timeline?.votingEnd,true)}</strong>
            </div>
          </div>
          <div style={styles.detailStat}>
            <FiUsers size={20} color="#2563EB" />
            <div>
              <div style={styles.statLabel}>Total Voters</div>
              <strong>{viewingElection.statistics?.totalEligibleVoters || 0} registered voters</strong>
            </div>
          </div>
          <div style={styles.detailStat}>
            <FiAward size={20} color="#2563EB" />
            <div>
              <div style={styles.statLabel}>Total Seats</div>
              <strong>{viewingElection.positions?.reduce((sum, p) => sum + p.totalSeats, 0) || 0} positions available</strong>
            </div>
          </div>
        </div>
        
        <div style={styles.detailSection}>
          <h3>Available Positions</h3>
          <div style={styles.detailPositionsGrid}>
            {viewingElection.positions?.map(pos => (
              <div key={pos.positionId} style={styles.detailPositionCard}>
                <div style={styles.detailPositionHeader}>
                  <strong style={styles.detailPositionName}>{pos.positionName}</strong>
                  <p style={styles.detailPositionSeats}>{pos.totalSeats} seat{pos.totalSeats > 1 ? 's' : ''}</p>
                </div>
                <div style={styles.detailPositionType}>
                  {pos.electionType === 'single_winner' && '🏆 Single Winner'}
                  {pos.electionType === 'multiple_winners' && '👥 Multiple Winners'}
                  {pos.electionType === 'ranked' && '📊 Ranked Voting'}
                </div>
                <p style={styles.detailPositionDescription}>{pos.positionDescription || 'No description provided'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  detailContainer: { maxWidth: '1000px', margin: '0 auto', marginTop: '10vh', padding: '32px' },
  backButton: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginBottom: '20px', fontSize: '14px' },
  detailCard: { background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' },
  electionStatus: { padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '500', display: 'inline-block' },
  selectElectionBtn: { padding: '12px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' },
  detailDescription: { color: '#475569', marginBottom: '28px', lineHeight: '1.6', fontSize: '15px' },
  detailStats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px', padding: '24px', background: '#f8fafc', borderRadius: '12px' },
  detailStat: { display: 'flex', alignItems: 'center', gap: '14px' },
  statLabel: { fontSize: '12px', color: '#64748b', marginBottom: '4px' },
  detailSection: { marginTop: '32px' },
  detailPositionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' },
  detailPositionCard: { padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' },
  detailPositionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  detailPositionName: { fontSize: '15px' },
  detailPositionSeats: { fontSize: '11px', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '12px' },
  detailPositionType: { fontSize: '12px', color: '#8b5cf6', marginBottom: '8px' },
  detailPositionDescription: { fontSize: '13px', color: '#64748b', marginBottom: 0 }
};