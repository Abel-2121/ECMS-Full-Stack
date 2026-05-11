// pages/candidate/components/nomination/ElectionSelectionStep.jsx
import React from 'react';
import { FiEye, FiArrowRight } from 'react-icons/fi';
import { formatLocalDate } from '../../../utils/formatLocalDate';
export const ElectionSelectionStep = ({ 
  elections, 
  selectedElection, 
  onSelectElection, 
  onViewDetails 
}) => {
 

  const getElectionStatus = (election) => {
    const status = election.status;
    
    switch(status) {
      case 'nomination_open':
        return { text: 'Open', color: '#dcfce7', textColor: '#166534', isOpen: true };
      case 'registration_open':
        return { text: 'Registration Open', color: '#dbeafe', textColor: '#1e40af', isOpen: false };
      case 'voting_open':
        return { text: 'Voting in Progress', color: '#fed7aa', textColor: '#9a3412', isOpen: false };
      case 'results_published':
      case 'completed':
        return { text: 'Completed', color: '#e2e8f0', textColor: '#475569', isOpen: false };
      default:
        return { text: 'Coming Soon', color: '#fef3c7', textColor: '#92400e', isOpen: false };
    }
  };

  const handleSelectClick = (election) => {
    onSelectElection(election);
  };

  if (!elections || elections.length === 0) {
    return (
      <div style={styles.card}>
        <p style={styles.noElections}>No elections available for nomination at this time.</p>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h3>Select an Election</h3>
      <div style={styles.electionsGrid}>
        {elections.map(election => {
          const status = getElectionStatus(election);
          const isOpen = status.isOpen;
          
          return (
            <div key={election._id} style={styles.electionCard}>
              <div style={styles.electionCardHeader}>
                <h4 style={styles.electionTitle}>{election.title}</h4>
                <p style={{
                  ...styles.electionStatus,
                  background: status.color,
                  color: status.textColor
                }}>
                  {status.text}
                </p>
              </div>
              <p style={styles.electionDescription}>{election.description?.slice(0, 100)}...</p>
              <div style={styles.electionMeta}>
                <p>📅 Nominations close: {formatLocalDate(election.timeline?.nominationEnd,true)}</p>
              </div>
              <div style={styles.electionCardActions}>
                <button 
                  style={styles.detailBtn} 
                  onClick={() => onViewDetails(election._id)}
                >
                  <FiEye size={14} /> View Details
                </button>
                <button 
                  style={{ 
                    ...styles.selectBtn, 
                    opacity: isOpen ? 1 : 0.5, 
                    cursor: isOpen ? 'pointer' : 'not-allowed',
                    backgroundColor: isOpen ? '#2563EB' : '#94a3b8'
                  }} 
                  onClick={() => isOpen && handleSelectClick(election)}
                  disabled={!isOpen}
                >
                  Select Election <FiArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  noElections: { textAlign: 'center', padding: '40px', color: '#64748b' },
  electionsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' },
  electionCard: { padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', transition: 'all 0.2s' },
  electionCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  electionTitle: { fontSize: '18px', fontWeight: '600', margin: 0 },
  electionStatus: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  electionDescription: { color: '#64748b', fontSize: '14px', marginBottom: '12px', lineHeight: '1.5' },
  electionMeta: { fontSize: '12px', color: '#94a3b8', marginBottom: '16px' },
  electionCardActions: { display: 'flex', gap: '12px' },
  detailBtn: { flex: 1, padding: '8px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' },
  selectBtn: { flex: 1, padding: '8px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }
};