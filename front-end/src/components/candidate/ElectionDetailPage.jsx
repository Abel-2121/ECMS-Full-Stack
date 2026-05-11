// pages/candidate/components/ElectionDetailPage.jsx
import React from 'react';
import { FiArrowLeft, FiCalendar, FiUsers, FiAward, FiArrowRight } from 'react-icons/fi';

export const ElectionDetailPage = ({ viewingElection, setShowElectionDetail, handleElectionSelect }) => {
  const formatDate = (date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div style={styles.detailContainer}>
      <button style={styles.backButton} onClick={() => setShowElectionDetail(false)}>
        <FiArrowLeft /> Back to Elections
      </button>
      
      <div style={styles.detailCard}>
        <div style={styles.detailHeader}>
          <div>
            <h1>{viewingElection.title}</h1>
            <p style={{
              ...styles.electionStatus,
              background: viewingElection.status === 'nomination_open' ? '#dcfce7' : '#fef3c7',
              color: viewingElection.status === 'nomination_open' ? '#166534' : '#92400e'
            }}>
              {viewingElection.status === 'nomination_open' ? 'Nominations Open' : 'Coming Soon'}
            </p>
          </div>
          <button 
            style={styles.selectElectionBtn}
            onClick={() => {
              handleElectionSelect(viewingElection);
              setShowElectionDetail(false);
            }}
            disabled={viewingElection.status !== 'nomination_open'}
          >
            Select This Election <FiArrowRight />
          </button>
        </div>
        
        <p style={styles.detailDescription}>{viewingElection.description}</p>
        
        <div style={styles.detailStats}>
          <div style={styles.detailStat}>
            <FiCalendar size={18} />
            <div>
              <div>Nomination Period</div>
              <strong>{formatDate(viewingElection.timeline?.nominationStart)} - {formatDate(viewingElection.timeline?.nominationEnd)}</strong>
            </div>
          </div>
          <div style={styles.detailStat}>
            <FiCalendar size={18} />
            <div>
              <div>Voting Period</div>
              <strong>{formatDate(viewingElection.timeline?.votingStart)} - {formatDate(viewingElection.timeline?.votingEnd)}</strong>
            </div>
          </div>
          <div style={styles.detailStat}>
            <FiUsers size={18} />
            <div>
              <div>Total Voters</div>
              <strong>{viewingElection.statistics?.totalEligibleVoters || 0}</strong>
            </div>
          </div>
          <div style={styles.detailStat}>
            <FiAward size={18} />
            <div>
              <div>Total Seats</div>
              <strong>{viewingElection.positions?.reduce((sum, p) => sum + p.totalSeats, 0) || 0}</strong>
            </div>
          </div>
        </div>
        
        <div style={styles.detailSection}>
          <h3>Available Positions</h3>
          <div style={styles.detailPositionsGrid}>
            {viewingElection.positions?.map(pos => (
              <div key={pos.positionId} style={styles.detailPositionCard}>
                <div>
                  <strong>{pos.positionName}</strong>
                  <p style={styles.detailPositionSeats}>{pos.totalSeats} seat(s)</p>
                </div>
                <div style={styles.detailPositionType}>
                  {pos.electionType === 'single_winner' && '🏆 Single Winner'}
                  {pos.electionType === 'multiple_winners' && '👥 Multiple Winners'}
                  {pos.electionType === 'ranked' && '📊 Ranked Voting'}
                </div>
                <p>{pos.positionDescription}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  detailContainer: { maxWidth: '1000px', margin: '0 auto', padding: '32px' },
  backButton: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginBottom: '20px' },
  detailCard: { background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' },
  electionStatus: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  selectElectionBtn: { padding: '10px 20px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' },
  detailDescription: { color: '#64748b', marginBottom: '24px', lineHeight: '1.6' },
  detailStats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px', padding: '20px', background: '#f8fafc', borderRadius: '12px' },
  detailStat: { display: 'flex', alignItems: 'center', gap: '12px' },
  detailSection: { marginTop: '24px' },
  detailPositionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' },
  detailPositionCard: { padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' },
  detailPositionSeats: { fontSize: '11px', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px' },
  detailPositionType: { fontSize: '12px', color: '#8b5cf6', marginTop: '8px' }
};