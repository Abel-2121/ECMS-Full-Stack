// components/monitoring/ElectionTabs.jsx
import React from 'react';

const ElectionTabs = ({ elections, selectedId, onSelect, loading }) => {
  if (loading) {
    return (
      <div style={styles.skeleton}>
        <div style={styles.skeletonBar}></div>
      </div>
    );
  }

  if (!elections || elections.length === 0) {
    return (
      <div style={styles.emptyTabs}>
        <p>No active elections available</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.tabsWrapper}>
        {elections.map((election) => (
          <button
            key={election._id}
            onClick={() => onSelect(election._id)}
            style={{
              ...styles.tab,
              ...(selectedId === election._id ? styles.tabActive : {}),
              ...(election.status === 'voting_open' ? styles.tabLive : {})
            }}
          >
            <div style={styles.tabContent}>
              <p style={styles.tabTitle}>{election.title}</p>
              {election.status === 'voting_open' && (
                <p style={styles.liveDot}></p>
              )}
            </div>
            {selectedId === election._id && (
              <div style={styles.activeIndicator} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginBottom: '24px',
    borderBottom: '1px solid #e2e8f0'
  },
  tabsWrapper: {
    display: 'flex',
    gap: '4px',
    overflowX: 'auto',
    scrollbarWidth: 'thin'
  },
  tab: {
    position: 'relative',
    padding: '12px 24px',
    background: 'transparent',
    border: 'none',
    borderRadius: '12px 12px 0 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap'
  },
  tabActive: {
    color: '#2563EB',
    background: '#eff6ff'
  },
  tabLive: {
    position: 'relative'
  },
  tabContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  tabTitle: {
    fontSize: '14px',
    fontWeight: '500'
  },
  liveDot: {
    width: '8px',
    height: '8px',
    background: '#10b981',
    borderRadius: '50%',
    animation: 'pulse 1.5s infinite'
  },
  activeIndicator: {
    position: 'absolute',
    bottom: '-1px',
    left: '0',
    right: '0',
    height: '2px',
    background: '#2563EB'
  },
  skeleton: {
    marginBottom: '24px'
  },
  skeletonBar: {
    height: '48px',
    background: '#e2e8f0',
    borderRadius: '12px',
    animation: 'pulse 1.5s ease-in-out infinite'
  },
  emptyTabs: {
    padding: '12px',
    textAlign: 'center',
    color: '#64748b',
    marginBottom: '24px'
  }
};

export default ElectionTabs;