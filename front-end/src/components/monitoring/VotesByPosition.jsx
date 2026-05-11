// components/monitoring/VotesByPosition.jsx
import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiAward } from 'react-icons/fi';

const VotesByPosition = ({ voteCounts, onPositionSelect }) => {
  const [expandedPosition, setExpandedPosition] = useState(null);

  if (!voteCounts || voteCounts.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Votes by Position</h3>
        <div style={styles.emptyState}>No vote data available yet</div>
      </div>
    );
  }

  const toggleExpand = (positionId) => {
    setExpandedPosition(expandedPosition === positionId ? null : positionId);
  };

  // Calculate total votes for a position
  const getTotalVotes = (candidates) => {
    return candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
  };

  // Get winner(s) for a position
  const getWinners = (candidates, totalSeats) => {
    return candidates.slice(0, totalSeats);
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Votes by Position</h3>
      
      {voteCounts.map((position) => {
        const totalVotes = getTotalVotes(position.candidates);
        const isExpanded = expandedPosition === position.positionId;
        const winners = getWinners(position.candidates, position.totalSeats);
        
        return (
          <div key={position.positionId} style={styles.positionCard}>
            <div 
              style={styles.positionHeader}
              onClick={() => toggleExpand(position.positionId)}
            >
              <div style={styles.positionInfo}>
                <p style={styles.positionIcon}>🗳️</p>
                <div>
                  <h4 style={styles.positionName}>{position.positionName}</h4>
                  <div style={styles.positionMeta}>
                    <p style={styles.positionType}>
                      {position.electionType === 'single_winner' && 'Single Winner'}
                      {position.electionType === 'multiple_winners' && `${position.totalSeats} Winners`}
                      {position.electionType === 'ranked' && 'Ranked Voting'}
                    </p>
                    <p style={styles.voteCount}>{totalVotes} votes</p>
                  </div>
                </div>
              </div>
              <div style={styles.headerRight}>
                {winners.length > 0 && (
                  <div style={styles.winnerPreview}>
                    <FiAward size={14} />
                    <p>{winners[0]?.candidateName?.split(' ')[0]}</p>
                  </div>
                )}
                {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
              </div>
            </div>
            
            {isExpanded && (
              <div style={styles.candidatesList}>
                {position.candidates.map((candidate, idx) => {
                  const percentage = totalVotes > 0 
                    ? ((candidate.votes / totalVotes) * 100).toFixed(1) 
                    : 0;
                  const isWinner = idx < position.totalSeats;
                  
                  return (
                    <div 
                      key={candidate.candidateId} 
                      style={{
                        ...styles.candidateRow,
                        ...(isWinner ? styles.winnerRow : {})
                      }}
                    >
                      <div style={styles.candidateRank}>#{idx + 1}</div>
                      <div style={styles.candidateName}>
                        {candidate.candidateName}
                        {isWinner && <p style={styles.winnerBadge}>WINNER</p>}
                      </div>
                      <div style={styles.voteStats}>
                        <p style={styles.voteNumber}>{candidate.votes} votes</p>
                        <div style={styles.percentageBar}>
                          <div style={{ ...styles.percentageFill, width: `${percentage}%` }} />
                        </div>
                        <p style={styles.percentageText}>{percentage}%</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e2e8f0'
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '16px'
  },
  positionCard: {
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    marginBottom: '12px',
    overflow: 'hidden'
  },
  positionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    cursor: 'pointer',
    background: '#f8fafc',
    transition: 'background 0.2s'
  },
  positionInfo: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  positionIcon: {
    fontSize: '24px'
  },
  positionName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#0f172a',
    margin: 0
  },
  positionMeta: {
    display: 'flex',
    gap: '12px',
    marginTop: '4px'
  },
  positionType: {
    fontSize: '11px',
    color: '#2563EB',
    background: '#dbeafe',
    padding: '2px 8px',
    borderRadius: '20px'
  },
  voteCount: {
    fontSize: '11px',
    color: '#64748b'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  winnerPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#10b981',
    background: '#dcfce7',
    padding: '4px 10px',
    borderRadius: '20px'
  },
  candidatesList: {
    padding: '12px 16px',
    background: 'white'
  },
  candidateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9'
  },
  winnerRow: {
    background: '#f0fdf4',
    margin: '0 -16px',
    padding: '12px 16px',
    borderRadius: '8px'
  },
  candidateRank: {
    width: '40px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b'
  },
  candidateName: {
    flex: 1,
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  winnerBadge: {
    fontSize: '10px',
    background: '#dcfce7',
    color: '#166534',
    padding: '2px 8px',
    borderRadius: '20px'
  },
  voteStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: '180px'
  },
  voteNumber: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
    minWidth: '60px'
  },
  percentageBar: {
    flex: 1,
    height: '6px',
    background: '#e2e8f0',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  percentageFill: {
    height: '100%',
    background: '#3b82f6',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  },
  percentageText: {
    fontSize: '12px',
    color: '#64748b',
    minWidth: '45px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: '#94a3b8'
  }
};

export default VotesByPosition;