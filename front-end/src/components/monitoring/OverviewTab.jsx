// components/monitoring/OverviewTab.jsx
import React from 'react';
import StatisticsCards from './StatisticsCards';
import TimeRemaining from './TimeRemaining';
import TurnoutTrendChart from './TurnoutTrendChart';
import PositionSummary from './PositionSummary';

const OverviewTab = ({ statistics, voteCounts, votesByHour, election }) => {
  if (!statistics) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading overview data...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Left Column - Main Stats */}
      <div style={styles.leftColumn}>
        <StatisticsCards statistics={statistics} />
        
        <div style={styles.twoColumnGrid}>
          <TimeRemaining votingEndDate={election?.timeline?.votingEnd} />
          <TurnoutTrendChart 
            votesByHour={statistics?.votesByHour || []} 
            totalEligibleVoters={statistics?.totalEligibleVoters}
          />
        </div>
      </div>
      
      {/* Right Column - Position Summary */}
      <div style={styles.rightColumn}>
        <PositionSummary voteCounts={voteCounts} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '24px'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  rightColumn: {
    position: 'sticky',
    top: '20px',
    height: 'fit-content'
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '16px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px'
  }
};

export default OverviewTab;