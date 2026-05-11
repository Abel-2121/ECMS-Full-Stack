// pages/candidate/components/ElectionSelectionStep.jsx
import React from 'react';
import { FiEye, FiArrowRight } from 'react-icons/fi';
import { formatLocalDate } from '../../utils/formatLocalDate';
export const ElectionSelectionStep = ({ elections, onSelectElection, onViewDetails, setShowElectionDetail }) => {
 

  const handleViewDetails = async (electionId) => {
    await onViewDetails(electionId);
    setShowElectionDetail(true);
  };

  return (
    <div style={styles.card}>
      <h3>Select an Election</h3>
      <div style={styles.electionsGrid}>
        {elections && elections.map(election => (
          <div key={election._id} style={styles.electionCard}>
            <div style={styles.electionCardHeader}>
              <h4 style={styles.electionTitle}>{election.title}</h4>
              <p style={{
                ...styles.electionStatus,
                background: election.status === 'nomination_open' ? '#dcfce7' : '#fef3c7',
                color: election.status === 'nomination_open' ? '#166534' : '#92400e'
              }}>
                {election.status === 'nomination_open' ? 'Open' : 'Closed'}
              </p>
            </div>
            <p style={styles.electionDescription}>{election.description?.slice(0, 100)}</p>
            <div style={styles.electionMeta}>
              <p>📅 Nominations close: {formatLocalDate(election.timeline?.nominationEnd,true)}</p>
            </div>
            <div style={styles.electionCardActions}>
              <button style={styles.detailBtn} onClick={() => handleViewDetails(election._id)}>
                <FiEye size={14} /> View Details
              </button>
              <button 
                style={styles.selectBtn} 
                onClick={() => onSelectElection(election)}
                disabled={election.status !== 'nomination_open'}
              >
                Select Election <FiArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  electionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
  electionCard: { padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s' },
  electionCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  electionTitle: { fontSize: '18px', fontWeight: '600', margin: 0 },
  electionStatus: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  electionDescription: { color: '#64748b', fontSize: '14px', marginBottom: '12px', lineHeight: '1.5' },
  electionMeta: { fontSize: '12px', color: '#94a3b8', marginBottom: '16px' },
  electionCardActions: { display: 'flex', gap: '12px' },
  detailBtn: { flex: 1, padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  selectBtn: { flex: 1, padding: '8px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }
};