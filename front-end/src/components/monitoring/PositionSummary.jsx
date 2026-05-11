// components/monitoring/PositionSummary.jsx
import React from 'react';
import { FiAward, FiUsers, FiActivity, FiZap, FiBarChart2 } from 'react-icons/fi';

const PositionSummary = ({ voteCounts }) => {
  if (!voteCounts?.length) {
    return (
      <div style={styles.emptyCard}>
        <FiBarChart2 size={48} color="#9ca3af" />
        <p style={styles.emptyText}>No position data available</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Election Overview</h3>

      <div style={styles.grid}>
        {voteCounts.map((position) => {
          const totalVotes = position.candidates.reduce(
            (sum, c) => sum + (c.votes || 0), 0
          );

          const leader = position.candidates[0];
          const runnerUp = position.candidates[1];
          const isTight = leader && runnerUp && (leader.votes - runnerUp.votes < 10);

          return (
            <div key={position.positionId} style={styles.card}>
              {/* HEADER */}
              <div style={styles.cardHeader}>
                <div style={{ flex: 1 }}>
                  <div style={styles.name}>{position.positionName}</div>
                  <div style={styles.badgeRow}>
                    <span style={styles.badge}>
                      {position.totalSeats} Seat{position.totalSeats > 1 ? 's' : ''}
                    </span>
                    <span style={styles.candidateBadge}>
                      <FiUsers size={12} /> {position.candidates.length} Candidates
                    </span>
                  </div>
                </div>

                <div style={styles.totalVotesBox}>
                  <span style={styles.totalNumber}>{totalVotes.toLocaleString()}</span>
                  <span style={styles.totalLabel}>TOTAL VOTES</span>
                </div>
              </div>

              {/* LEADER SECTION */}
              {leader && (
                <div style={{ 
                  ...styles.leaderBox, 
                  backgroundColor: isTight ? '#fff1f2' : '#D23A0110',
                  borderColor: isTight ? '#fecdd3' : '#D23A0120'
                }}>
                  <div style={styles.leaderInfo}>
                    <div style={{ 
                      ...styles.awardIcon, 
                      backgroundColor: isTight ? '#e11d48' : '#D23A01' 
                    }}>
                      {isTight ? <FiZap size={14} color="#fff" /> : <FiAward size={14} color="#fff" />}
                    </div>
                    <span style={styles.leaderText}>
                      <strong>{leader.candidateName}</strong> is leading
                    </span>
                  </div>
                  {isTight && <span style={styles.tightBadge}>TIGHT RACE</span>}
                </div>
              )}

              {/* PROGRESS LIST */}
              <div style={styles.progressWrap}>
                {position.candidates.slice(0, 3).map((c, i) => {
                  const percentage = totalVotes ? ((c.votes / totalVotes) * 100).toFixed(1) : 0;
                  const isFirst = i === 0;

                  return (
                    <div key={i} style={styles.progressItem}>
                      <div style={styles.progressTop}>
                        <span style={styles.candidateNameLabel}>{c.candidateName}</span>
                        <span style={styles.percentageLabel}>{percentage}%</span>
                      </div>

                      <div style={styles.progressBg}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${percentage}%`,
                            background: isFirst ? '#D23A01' : '#023430'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {position.candidates.length > 3 && (
                  <div style={styles.moreLabel}>
                    + {position.candidates.length - 3} other candidates competing
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: {
    marginTop: '32px',
    fontFamily: "'Poppins', sans-serif"
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '20px',
    letterSpacing: '-0.02em'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '20px'
  },
  card: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '20px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '18px'
  },
  name: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1a1a1a',
    lineHeight: '1.2'
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '8px',
    flexWrap: 'wrap'
  },
  badge: {
    fontSize: '11px',
    fontWeight: '700',
    background: '#f1f5f9',
    padding: '3px 10px',
    borderRadius: '20px',
    color: '#4b5563',
    textTransform: 'uppercase'
  },
  candidateBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#D23A01',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  totalVotesBox: {
    textAlign: 'right',
    marginLeft: '12px'
  },
  totalNumber: {
    display: 'block',
    fontWeight: '900',
    fontSize: '22px',
    color: '#1a1a1a',
    lineHeight: '1'
  },
  totalLabel: {
    fontSize: '9px',
    fontWeight: '800',
    color: '#9ca3af',
    marginTop: '4px',
    letterSpacing: '0.05em'
  },
  leaderBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    borderRadius: '12px',
    marginBottom: '18px',
    border: '1px solid'
  },
  leaderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  awardIcon: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  leaderText: {
    fontSize: '14px',
    color: '#451a03'
  },
  tightBadge: {
    fontSize: '9px',
    fontWeight: '900',
    background: '#be123c',
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '12px',
    letterSpacing: '0.02em'
  },
  progressWrap: {
    marginTop: '4px'
  },
  progressItem: {
    marginBottom: '14px'
  },
  progressTop: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px'
  },
  candidateNameLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563'
  },
  percentageLabel: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#1a1a1a'
  },
  progressBg: {
    height: '6px',
    background: '#e5e7eb',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
  },
  moreLabel: {
    fontSize: '12px',
    textAlign: 'center',
    color: '#9ca3af',
    marginTop: '8px',
    fontWeight: '500',
    fontStyle: 'italic'
  },
  emptyCard: {
    padding: '60px',
    textAlign: 'center',
    background: '#f8fafc',
    borderRadius: '20px',
    border: '1px solid #e5e7eb'
  },
  emptyText: {
    fontSize: '15px',
    color: '#6b7280',
    fontWeight: '600',
    marginTop: '12px'
  }
};

export default PositionSummary;