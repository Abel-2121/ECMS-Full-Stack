// components/monitoring/TurnoutTrendChart.jsx
import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';

const TurnoutTrendChart = ({ votesByHour = [], totalEligibleVoters }) => {
  if (!votesByHour || votesByHour.length === 0) {
    return (
      <div style={styles.emptyChart}>
        <FiTrendingUp size={32} color="#cbd5e1" />
        <p>Waiting for vote data...</p>
      </div>
    );
  }

  // Prepare data for last 12 hours
  const last12Hours = votesByHour.slice(-12);
  const maxVotes = Math.max(...last12Hours.map(h => h.votes), 1);
  
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Vote Trend (Last 12 Hours)</h3>
      <div style={styles.chartContainer}>
        <svg width="100%" height="200" viewBox="0 0 600 200" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 50, 100, 150, 200].map(y => (
            <line
              key={y}
              x1="0"
              y1={200 - y}
              x2="600"
              y2={200 - y}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4"
            />
          ))}
          
          {/* Area fill */}
          <path
            d={`M0,200 ${last12Hours.map((hour, i) => {
              const x = (i / (last12Hours.length - 1)) * 600;
              const y = 200 - (hour.votes / maxVotes) * 180;
              return `L${x},${y}`;
            }).join(' ')} L600,200 Z`}
            fill="url(#gradient)"
            opacity="0.3"
          />
          
          {/* Line */}
          <path
            d={`M0,200 ${last12Hours.map((hour, i) => {
              const x = (i / (last12Hours.length - 1)) * 600;
              const y = 200 - (hour.votes / maxVotes) * 180;
              return `L${x},${y}`;
            }).join(' ')}`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {last12Hours.map((hour, i) => {
            const x = (i / (last12Hours.length - 1)) * 600;
            const y = 200 - (hour.votes / maxVotes) * 180;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
          
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* X-axis labels */}
        <div style={styles.xAxis}>
          {last12Hours.map((hour, i) => (
            <div key={i} style={styles.xLabel}>
              {hour.hour}
            </div>
          ))}
        </div>
      </div>
      
      {/* Summary Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statItem}>
          <p style={styles.statLabel}>Peak Hour</p>
          <p style={styles.statValue}>
            {last12Hours.reduce((max, h) => h.votes > max.votes ? h : max, { votes: 0 }).hour || 'N/A'}
          </p>
        </div>
        <div style={styles.statItem}>
          <p style={styles.statLabel}>Average per Hour</p>
          <p style={styles.statValue}>
            {Math.round(last12Hours.reduce((sum, h) => sum + h.votes, 0) / last12Hours.length)}
          </p>
        </div>
        <div style={styles.statItem}>
          <p style={styles.statLabel}>Total Today</p>
          <p style={styles.statValue}>
            {last12Hours.reduce((sum, h) => sum + h.votes, 0)}
          </p>
        </div>
      </div>
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
    marginBottom: '20px'
  },
  chartContainer: {
    marginBottom: '20px'
  },
  xAxis: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
    padding: '0 8px'
  },
  xLabel: {
    fontSize: '10px',
    color: '#94a3b8',
    transform: 'rotate(-45deg)',
    transformOrigin: 'top left'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0'
  },
  statItem: {
    textAlign: 'center'
  },
  statLabel: {
    fontSize: '11px',
    color: '#64748b',
    display: 'block',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a'
  },
  emptyChart: {
    textAlign: 'center',
    padding: '40px',
    color: '#94a3b8'
  }
};

export default TurnoutTrendChart;