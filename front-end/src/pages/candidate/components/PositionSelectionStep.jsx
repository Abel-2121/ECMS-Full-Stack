// pages/candidate/components/PositionSelectionStep.jsx
import React from 'react';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import CandidatePositionCard from './CandidatePositionCard';

export const PositionSelectionStep = ({ 
  selectedElection, 
  selectedPosition, 
  onPositionSelect, 
  onBack, 
  onContinue 
}) => {
  return (
    <div style={styles.card}>
      <div style={styles.backNav}>
        <button style={styles.backBtn} onClick={onBack}>
          <FiArrowLeft size={16} /> Back to Elections
        </button>
        <h3 style={styles.electionTitle}>Select a Position for: {selectedElection.title}</h3>
      </div>
      
      <div style={styles.positionsGrid}>
        {selectedElection.positions && selectedElection.positions.map(position => (
          <CandidatePositionCard
            key={position.positionId}
            position={position}
            isSelected={selectedPosition?.positionId === position.positionId}
            onSelect={onPositionSelect}
          />
        ))}
      </div>
      
      <div style={styles.actionButtons}>
        <button style={styles.secondaryBtn} onClick={onBack}>
          Back
        </button>
        <button 
          style={{
            ...styles.primaryBtn,
            opacity: !selectedPosition ? 0.5 : 1,
            cursor: !selectedPosition ? 'not-allowed' : 'pointer'
          }} 
          onClick={onContinue} 
          disabled={!selectedPosition}
        >
          Continue <FiArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 28px)', 
    marginBottom: '24px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  backNav: { 
    marginBottom: '24px' 
  },
  backBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    color: '#6b7280', 
    marginBottom: '12px',
    fontSize: '14px',
    fontWeight: '500',
    padding: 0,
    fontFamily: "'Poppins', sans-serif"
  },
  electionTitle: {
    fontSize: 'clamp(18px, 4vw, 20px)',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: 0,
    fontFamily: "'Poppins', sans-serif"
  },
  positionsGrid: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px', 
    marginBottom: '24px',
    maxHeight: '500px',
    overflowY: 'auto'
  },
  actionButtons: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginTop: '24px' 
  },
  primaryBtn: { 
    padding: '12px 28px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: '700', 
    fontSize: '14px',
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s'
  },
  secondaryBtn: { 
    padding: '12px 24px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s'
  }
};