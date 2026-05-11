// components/monitoring/ElectionSelector.jsx
import React from 'react';
import { FiChevronDown, FiAlertCircle } from 'react-icons/fi';

const ElectionSelector = ({ elections, selectedId, onSelect, loading }) => {
  const activeElections = elections.filter(e => e.status === 'voting_open');
  const otherElections = elections.filter(e => e.status !== 'voting_open');

  if (loading) {
    return (
      <div style={styles.skeleton}>
        <div style={styles.skeletonBar}></div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.labelWrapper}>
        <label style={styles.label}>Select Election</label>
        {selectedId && (
          <p style={styles.activeBadge}>
            <p style={styles.liveDot}></p>
            LIVE MONITORING
          </p>
        )}
      </div>
      
      <select
        value={selectedId || ''}
        onChange={(e) => onSelect(e.target.value)}
        style={styles.select}
      >
        <option value="">-- Select an election to monitor --</option>
        
        {activeElections.length > 0 && (
          <optgroup label="🟢 Active Elections (Voting Open)">
            {activeElections.map(election => (
              <option key={election._id} value={election._id}>
                {election.title} - Voting in progress
              </option>
            ))}
          </optgroup>
        )}
        
        {otherElections.length > 0 && (
          <optgroup label="📋 Other Elections">
            {otherElections.map(election => (
              <option key={election._id} value={election._id}>
                {election.title} - {election.status?.replace('_', ' ')}
              </option>
            ))}
          </optgroup>
        )}
      </select>
      
      {activeElections.length === 0 && (
        <div style={styles.warning}>
          <FiAlertCircle size={16} />
          <p>No active elections with voting open</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '24px'
  },
  labelWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e293b'
  },
  activeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: '500',
    color: '#10b981',
    background: '#dcfce7',
    padding: '4px 10px',
    borderRadius: '20px'
  },
  liveDot: {
    width: '8px',
    height: '8px',
    background: '#10b981',
    borderRadius: '50%',
    animation: 'pulse 1.5s infinite'
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px',
    background: 'white',
    cursor: 'pointer'
  },
  warning: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '12px',
    padding: '10px 12px',
    background: '#fef3c7',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#92400e'
  },
  skeleton: {
    marginBottom: '24px'
  },
  skeletonBar: {
    height: '48px',
    background: '#e2e8f0',
    borderRadius: '12px',
    animation: 'pulse 1.5s ease-in-out infinite'
  }
};

export default ElectionSelector;