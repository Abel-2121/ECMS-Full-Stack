// components/voting/VotingProgress.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { FiCheckCircle, FiCircle } from 'react-icons/fi';

const VotingProgress = () => {
  const { votedPositions, totalPositions, selections } = useSelector(state => state.voting);
  const votedCount = votedPositions.length;
  const percentage = totalPositions > 0 ? (votedCount / totalPositions) * 100 : 0;
  const isComplete = votedCount === totalPositions && totalPositions > 0;

  // Get positions from selections (or passed from parent)
  // This component now reads directly from Redux store

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <p style={styles.emoji}>🗳️</p>
          <div>
            <h3 style={styles.title}>Your Voting Progress</h3>
            <p style={styles.subtitle}>
              {isComplete 
                ? "You've voted for all positions! Ready to review." 
                : `Complete your ballot by voting for all ${totalPositions} positions`}
            </p>
          </div>
        </div>
        
        <div style={styles.stats}>
          <p style={styles.votedCount}>{votedCount}</p>
          <p style={styles.totalCount}>/{totalPositions}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressBarContainer}>
        <div 
          style={{
            ...styles.progressBar,
            width: `${percentage}%`,
            background: isComplete ? '#10b981' : '#2563EB'
          }} 
        />
      </div>

      {/* Position Status Grid */}
      <div style={styles.positionsStatus}>
        {Object.entries(selections).map(([positionId, candidateId]) => (
          <div key={positionId} style={styles.statusItem}>
            <FiCheckCircle size={14} color="#10b981" />
            <p style={styles.statusText}>Position voted</p>
          </div>
        ))}
      </div>

      {!isComplete && votedCount > 0 && (
        <div style={styles.remainingHint}>
          ⚡ You've completed {votedCount} of {totalPositions} positions. Keep going!
        </div>
      )}

      {isComplete && (
        <div style={styles.completeMessage}>
          <FiCheckCircle size={18} color="#10b981" />
          <p>All positions voted! Click "Review Your Votes" to continue.</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #e2e8f0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  titleSection: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },
  emoji: {
    fontSize: '28px'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#0f172a',
    margin: 0,
    marginBottom: '4px'
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0
  },
  stats: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '2px'
  },
  votedCount: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#2563EB'
  },
  totalCount: {
    fontSize: '18px',
    color: '#94a3b8'
  },
  progressBarContainer: {
    height: '8px',
    background: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '16px'
  },
  progressBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  positionsStatus: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '12px'
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    background: '#f0fdf4',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#166534'
  },
  statusText: {
    fontSize: '12px'
  },
  remainingHint: {
    fontSize: '13px',
    color: '#f59e0b',
    background: '#fef3c7',
    padding: '10px 12px',
    borderRadius: '10px',
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  completeMessage: {
    fontSize: '13px',
    color: '#10b981',
    background: '#dcfce7',
    padding: '10px 12px',
    borderRadius: '10px',
    marginTop: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};

export default VotingProgress;