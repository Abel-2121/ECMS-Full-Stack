// pages/candidate/components/PositionSelectionStep.jsx
import React from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

export const PositionSelectionStep = ({ selectedElection, selectedPosition, onPositionSelect, onBack, onContinue }) => {
  return (
    <div style={styles.card}>
      <div style={styles.backNav}>
        <button style={styles.backBtn} onClick={onBack}>
          <FiArrowLeft /> Back to Elections
        </button>
        <h3>Select a Position for: {selectedElection.title}</h3>
      </div>
      
      <div style={styles.positionsGrid}>
        {selectedElection.positions && selectedElection.positions.map(position => (
          <label key={position.positionId} style={{
            ...styles.positionCard,
            borderColor: selectedPosition?.positionId === position.positionId ? '#2563EB' : '#e2e8f0',
            background: selectedPosition?.positionId === position.positionId ? '#eff6ff' : 'white'
          }}>
            <input
              type="radio"
              name="position"
              value={position.positionId}
              checked={selectedPosition?.positionId === position.positionId}
              onChange={() => onPositionSelect(position)}
              style={styles.radioInput}
            />
            <div style={styles.positionCardContent}>
              <div style={styles.positionHeader}>
                <h4 style={styles.positionName}>{position.positionName}</h4>
                <p style={styles.positionSeats}>{position.totalSeats} Seat{position.totalSeats > 1 ? 's' : ''}</p>
              </div>
              <p style={styles.positionDescription}>{position.positionDescription || 'No description available'}</p>
              <div style={styles.positionType}>
                {position.electionType === 'single_winner' && '🏆 Single Winner'}
                {position.electionType === 'multiple_winners' && '👥 Multiple Winners'}
                {position.electionType === 'ranked' && '📊 Ranked Voting'}
              </div>
            </div>
          </label>
        ))}
      </div>
      
      <div style={styles.actionButtons}>
        <button style={styles.secondaryBtn} onClick={onBack}>Back</button>
        <button style={styles.primaryBtn} onClick={onContinue} disabled={!selectedPosition}>
          Continue <FiArrowRight />
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  backNav: { marginBottom: '20px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginBottom: '12px' },
  positionsGrid: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
  positionCard: { display: 'flex', gap: '16px', padding: '16px', border: '2px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' },
  radioInput: { width: '20px', height: '20px', marginTop: '4px', cursor: 'pointer' },
  positionCardContent: { flex: 1 },
  positionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  positionName: { fontSize: '16px', fontWeight: '600', margin: 0 },
  positionSeats: { fontSize: '12px', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: '12px' },
  positionDescription: { fontSize: '13px', color: '#64748b', marginBottom: '8px' },
  positionType: { fontSize: '12px', color: '#8b5cf6', marginBottom: '4px' },
  actionButtons: { display: 'flex', justifyContent: 'space-between', marginTop: '24px' },
  primaryBtn: { padding: '12px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' },
  secondaryBtn: { padding: '12px 24px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};