// components/monitoring/StatisticsCards.jsx
import React from 'react';
import { FiUsers, FiCheckCircle, FiClock, FiTrendingUp, FiUserCheck } from 'react-icons/fi';

const StatisticsCards = ({ statistics }) => {
  if (!statistics) return null;

  const cards = [
    {
      title: 'Total Eligible Voters',
      value: statistics.totalEligibleVoters?.toLocaleString() || 0,
      icon: <FiUsers size={24} />,
      color: '#D23A01',
      bg: '#D23A0110'
    },
    {
      title: 'Votes Cast',
      value: statistics.totalVotesCast?.toLocaleString() || 0,
      icon: <FiCheckCircle size={24} />,
      color: '#10b981',
      bg: '#10b98120'
    },
    {
      title: 'Turnout Percentage',
      value: `${statistics.turnoutPercentage || 0}%`,
      icon: <FiTrendingUp size={24} />,
      color: '#f59e0b',
      bg: '#fef3c7',
      progress: statistics.turnoutPercentage || 0
    },
    {
      title: 'Remaining Voters',
      value: ((statistics.totalEligibleVoters || 0) - (statistics.totalVotesCast || 0)).toLocaleString(),
      icon: <FiUserCheck size={24} />,
      color: '#023430',
      bg: '#02343010'
    }
  ];

  return (
    <div style={styles.grid}>
      {cards.map((card, idx) => (
        <div key={idx} style={styles.card}>
          <div style={{ ...styles.iconWrapper, background: card.bg, color: card.color }}>
            {card.icon}
          </div>
          <div style={styles.content}>
            <p style={styles.title}>{card.title}</p>
            <p style={styles.value}>{card.value}</p>
            {card.progress !== undefined && (
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${card.progress}%` }} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '32px'
  },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: 'white',
    borderRadius: '20px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  iconWrapper: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    flex: 1
  },
  title: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '4px',
    fontFamily: "'Poppins', sans-serif"
  },
  value: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '8px',
    fontFamily: "'Poppins', sans-serif"
  },
  progressBar: {
    height: '4px',
    background: '#e5e7eb',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    background: '#f59e0b',
    borderRadius: '2px',
    transition: 'width 0.3s ease'
  }
};

export default StatisticsCards;