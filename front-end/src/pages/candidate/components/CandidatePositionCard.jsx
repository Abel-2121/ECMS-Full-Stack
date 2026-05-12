// pages/candidate/components/CandidatePositionCard.jsx
import React from 'react';
import { FiAward, FiUsers, FiBarChart2, FiCheckCircle } from 'react-icons/fi';

const CandidatePositionCard = ({ position, isSelected, onSelect }) => {
  const getElectionTypeIcon = (type) => {
    switch(type) {
      case 'ranked': return <FiBarChart2 size={16} />;
      case 'multiple_winners': return <FiUsers size={16} />;
      default: return <FiAward size={16} />;
    }
  };

  const getElectionTypeText = (type) => {
    switch(type) {
      case 'ranked': return 'Ranked Voting';
      case 'multiple_winners': return 'Multiple Winners';
      default: return 'Single Winner';
    }
  };

  return (
    <div 
      style={{
        ...styles.card,
        ...(isSelected && styles.cardSelected),
        borderColor: isSelected ? '#D23A01' : '#e5e7eb'
      }}
      onClick={() => onSelect(position)}
    >
      <div style={styles.cardHeader}>
        <div style={styles.positionIcon}>{getElectionTypeIcon(position.electionType)}</div>
        <div>
          <h4 style={styles.positionName}>{position.positionName}</h4>
          <div style={styles.positionMeta}>
            <span style={styles.positionType}>{getElectionTypeText(position.electionType)}</span>
            <span style={styles.positionSeats}>{position.totalSeats} Seat{position.totalSeats > 1 ? 's' : ''}</span>
          </div>
        </div>
        {isSelected && <FiCheckCircle size={20} color="#D23A01" style={styles.checkIcon} />}
      </div>
      {position.positionDescription && (
        <p style={styles.positionDesc}>{position.positionDescription}</p>
      )}
    </div>
  );
};

const styles = {
  card: {
    padding: '18px',
    border: '2px solid #686869',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'white'
  },
  cardSelected: {
    background: '#D23A0110',
    borderColor: '#D23A01'
  },
  cardHeader: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start'
  },
  positionIcon: {
    fontSize: '24px',
    color: '#D23A01',
    flexShrink: 0
  },
  positionName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '6px',
    
  },
  positionMeta: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  positionType: {
    fontSize: '11px',
    padding: '2px 8px',
    background: '#D23A0110',
    color: '#D23A01',
    borderRadius: '20px',
    fontWeight: '600',
    
  },
  positionSeats: {
    fontSize: '11px',
    padding: '2px 8px',
    background: '#f1f5f9',
    color: '#4b5563',
    borderRadius: '20px',
    fontWeight: '600',
    
  },
  positionDesc: {
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb',
    
  },
  checkIcon: {
    marginLeft: 'auto',
    flexShrink: 0
  }
};

export default CandidatePositionCard;