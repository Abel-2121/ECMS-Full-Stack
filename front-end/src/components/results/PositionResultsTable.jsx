import React, { useState } from 'react';
import { 
  FiChevronDown, FiChevronUp, FiAward, FiUser, FiTrendingUp, 
  FiPieChart, FiUsers, FiBarChart2, FiCheckCircle, FiClipboard, 
  FiTarget, FiStar
} from 'react-icons/fi';
import { FaCrown, FaMedal, FaTrophy } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL_UPLOAD || 'http://localhost:4001';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const normalizedPath = imagePath.replace(/\\/g, '/');
  let cleanPath = normalizedPath;
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath;
  } else if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.substring(1);
  }
  return `${API_BASE_URL}/${cleanPath}`;
};


const PositionResultsTable = ({ position }) => {
  const [expanded, setExpanded] = useState(true);
  
  const winners = position.candidates.filter(c => c.winner);
  const sortedCandidates = [...position.candidates].sort((a, b) => b.votes - a.votes);
  const totalVotes = position.totalVotesForPosition || 0;

  const getPositionIcon = () => {
    if (position.electionType === 'single_winner') return <FaTrophy size={28} />;
    if (position.electionType === 'multiple_winners') return <FiUsers size={28} />;
    return <FiBarChart2 size={28} />;
  };

  const getElectionTypeText = () => {
    if (position.electionType === 'single_winner') return 'Single Winner';
    if (position.electionType === 'multiple_winners') return `${position.totalSeats} Winners`;
    return 'Ranked Voting';
  };

  const getWinnerBadgeColor = (rank) => {
    if (rank === 1) return { bg: '#D23A0110', color: '#D23A01', text: 'GOLD WINNER', icon: <FaTrophy size={12} /> };
    if (rank === 2) return { bg: '#e5e7eb', color: '#4b5563', text: 'SILVER WINNER', icon: <FaMedal size={12} /> };
    if (rank === 3) return { bg: '#fef3c7', color: '#d97706', text: 'BRONZE WINNER', icon: <FiStar size={12} /> };
    return { bg: '#dcfce7', color: '#166534', text: 'WINNER', icon: <FiCheckCircle size={12} /> };
  };

  const renderCandidateAvatar = (candidate, size = 'large') => {
    const imageUrl = getImageUrl(candidate.photoUrl || candidate.campaignPhoto);
    const avatarSize = size === 'large' ? 80 : 36;
    const fontSize = size === 'large' ? 34 : 15;
    
    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt={candidate.candidateName}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = candidate.candidateName?.charAt(0) || '?';
          }}
        />
      );
    }
    return candidate.candidateName?.charAt(0) || '?';
  };

  return (
    <div style={styles.container}>
      <div style={styles.header} onClick={() => setExpanded(!expanded)}>
        <div style={styles.headerLeft}>
          <div style={styles.positionIcon}>{getPositionIcon()}</div>
          <div>
            <h3 style={styles.positionName}>{position.positionName}</h3>
            <div style={styles.positionStats}>
              <span style={styles.statBadge}>
                <FiAward size={12} /> {winners.length} Winner{winners.length !== 1 ? 's' : ''}
              </span>
              <span style={styles.statBadge}>
                <FiUser size={12} /> {position.candidates.length} Candidates
              </span>
              <span style={styles.statBadge}>
                <FiPieChart size={12} /> {totalVotes.toLocaleString()} Votes
              </span>
            </div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.electionTypeBadge}>
            {getElectionTypeText()}
          </div>
          {expanded ? <FiChevronUp size={22} /> : <FiChevronDown size={22} />}
        </div>
      </div>

      {expanded && (
        <div style={styles.expandedContent}>
          {winners.length > 0 && (
            <div style={styles.winnersSection}>
              <h4 style={styles.sectionTitle}>
                <FiAward size={18} color="#D23A01" /> Winners
              </h4>
              <div style={styles.winnersGrid}>
                {winners.map((candidate, idx) => {
                  const badge = getWinnerBadgeColor(candidate.rank || idx + 1);
                  return (
                    <div key={candidate.candidateId} style={styles.winnerCard}>
                      <div style={styles.winnerAvatar}>
                        <div style={styles.winnerAvatarInner}>
                          {renderCandidateAvatar(candidate, 'large')}
                        </div>
                        <div style={styles.winnerCrown}>
                          <FaCrown size={24} color="#D23A01" />
                        </div>
                      </div>
                      <div style={styles.winnerInfo}>
                        <div style={styles.winnerName}>{candidate.candidateName}</div>
                        {candidate.electedRole && (
                          <div style={styles.winnerRole}>{candidate.electedRole}</div>
                        )}
                        <div style={styles.winnerStats}>
                          <span style={styles.winnerVotes}>{candidate.votes?.toLocaleString()} votes</span>
                          <span style={styles.winnerPercentage}>{candidate.percentage}%</span>
                        </div>
                        <div style={{ ...styles.winnerBadge, background: badge.bg, color: badge.color }}>
                          {badge.icon} {badge.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={styles.resultsSection}>
            <h4 style={styles.sectionTitle}>
              <FiClipboard size={18} color="#023430" /> Complete Results
            </h4>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th style={styles.th}>Rank</th>
                    <th style={styles.th}>Candidate</th>
                    <th style={styles.th}>Votes</th>
                    <th style={styles.th}>Percentage</th>
                    <th style={styles.th}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCandidates.map((candidate, idx) => (
                    <tr key={candidate.candidateId} style={{ ...styles.tr, ...(candidate.winner ? styles.winnerRow : {}) }}>
                      <td style={styles.td}>
                        <div style={styles.rankBadge}>#{idx + 1}</div>
                       </td>
                      <td style={styles.td}>
                        <div style={styles.candidateCell}>
                          <div style={styles.candidateAvatar}>
                            {renderCandidateAvatar(candidate, 'small')}
                          </div>
                          <div>
                            <div style={styles.candidateName}>{candidate.candidateName}</div>
                            {candidate.electedRole && (
                              <div style={styles.candidateRole}>{candidate.electedRole}</div>
                            )}
                          </div>
                        </div>
                       </td>
                      <td style={styles.td}>
                        <span style={styles.voteCount}>{candidate.votes?.toLocaleString()}</span>
                       </td>
                      <td style={styles.td}>
                        <div style={styles.percentageContainer}>
                          <div style={styles.percentageBar}>
                            <div style={{ ...styles.percentageFill, width: `${candidate.percentage}%` }} />
                          </div>
                          <span style={styles.percentageText}>{candidate.percentage}%</span>
                        </div>
                       </td>
                      <td style={styles.td}>
                        {candidate.winner ? (
                          <span style={styles.winnerBadgeSmall}>
                            <FiCheckCircle size={12} /> Elected
                          </span>
                        ) : (
                          <span style={styles.runnerUpBadge}>Runner-up</span>
                        )}
                       </td>
                     </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {position.electionType === 'ranked' && position.seatAllocation?.length > 0 && (
            <div style={styles.allocationSection}>
              <h4 style={styles.sectionTitle}>
                <FiTarget size={18} color="#D23A01" /> Role Allocation
              </h4>
              <div style={styles.allocationGrid}>
                {position.seatAllocation.map((alloc) => {
                  const winner = winners.find(w => w.rank === alloc.rank);
                  return (
                    <div key={alloc.rank} style={styles.allocationCard}>
                      <div style={styles.allocationRank}>Rank #{alloc.rank}</div>
                      <div style={styles.allocationRole}>{alloc.roleName}</div>
                      <div style={styles.allocationWinner}>
                        <FiAward size={12} /> {winner ? winner.candidateName : 'Not assigned'}
                      </div>
                      {alloc.description && (
                        <div style={styles.allocationDesc}>{alloc.description}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    border: '1px solid #e5e7eb',
    borderRadius: '20px',
    marginBottom: '20px',
    overflow: 'hidden',
    background: '#ffffff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    cursor: 'pointer',
    background: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
  },
  headerLeft: { 
    display: 'flex', 
    gap: '16px', 
    alignItems: 'center' 
  },
  positionIcon: { 
    fontSize: '32px',
    color: '#D23A01'
  },
  positionName: { 
    fontSize: '18px', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    margin: 0, 
    marginBottom: '8px',
  },
  positionStats: { 
    display: 'flex', 
    gap: '12px', 
    flexWrap: 'wrap' 
  },
  statBadge: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    fontSize: '12px', 
    color: '#4b5563', 
    background: '#f8fafc', 
    padding: '4px 10px', 
    borderRadius: '20px',
    fontWeight: '500'
  },
  headerRight: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px' 
  },
  electionTypeBadge: { 
    fontSize: '12px', 
    background: '#D23A0110', 
    color: '#D23A01', 
    padding: '6px 14px', 
    borderRadius: '30px', 
    fontWeight: '700'
  },
  expandedContent: { 
    padding: '20px 24px', 
    borderTop: '1px solid #e5e7eb' 
  },
  winnersSection: { 
    marginBottom: '32px' 
  },
  sectionTitle: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    fontSize: '16px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    marginBottom: '20px', 
    paddingBottom: '10px', 
    borderBottom: '2px solid #e5e7eb',
  },
  winnersGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
    gap: '20px' 
  },
  winnerCard: { 
    display: 'flex', 
    gap: '20px', 
    padding: '20px', 
    background: '#f8fafc', 
    borderRadius: '16px', 
    borderLeft: `4px solid #D23A01`,
  },
  winnerAvatar: { 
    position: 'relative', 
    flexShrink: 0 
  },
  winnerAvatarInner: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #D23A01, #b02e00)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '34px',
    fontWeight: '800',
    color: '#fff'
  },
  winnerCrown: { 
    position: 'absolute', 
    top: '-10px', 
    right: '-5px' 
  },
  winnerInfo: { 
    flex: 1 
  },
  winnerName: { 
    fontSize: '18px', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    marginBottom: '4px'
  },
  winnerRole: { 
    fontSize: '13px', 
    color: '#D23A01', 
    fontWeight: '700', 
    marginBottom: '8px', 
    background: '#D23A0110', 
    display: 'inline-block', 
    padding: '2px 10px', 
    borderRadius: '20px' 
  },
  winnerStats: { 
    display: 'flex', 
    gap: '12px', 
    marginBottom: '8px' 
  },
  winnerVotes: { 
    fontSize: '14px', 
    fontWeight: '700', 
    color: '#1a1a1a' 
  },
  winnerPercentage: { 
    fontSize: '14px', 
    color: '#D23A01', 
    fontWeight: '700' 
  },
  winnerBadge: { 
    fontSize: '11px', 
    fontWeight: '700', 
    padding: '4px 12px', 
    borderRadius: '20px', 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  },
  resultsSection: { 
    marginBottom: '32px' 
  },
  tableWrapper: { 
    overflowX: 'auto', 
    borderRadius: '12px', 
    border: '1px solid #e5e7eb' 
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse', 
    minWidth: '600px' 
  },
  tableHeader: { 
    background: '#f8fafc', 
    borderBottom: '1px solid #e5e7eb' 
  },
  th: { 
    textAlign: 'left', 
    padding: '14px 16px', 
    fontWeight: '700', 
    fontSize: '13px', 
    color: '#1a1a1a'
  },
  tr: { 
    borderBottom: '1px solid #e5e7eb' 
  },
  td: { 
    padding: '14px 16px', 
    verticalAlign: 'middle'
  },
  winnerRow: { 
    background: '#D23A0110' 
  },
  rankBadge: { 
    width: '36px', 
    height: '36px', 
    background: '#f1f5f9', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontWeight: '800', 
    fontSize: '14px', 
    color: '#4b5563' 
  },
  candidateCell: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px' 
  },
  candidateAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: '#D23A01',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '700',
    color: '#fff'
  },
  candidateName: { 
    fontSize: '14px', 
    fontWeight: '700', 
    color: '#1a1a1a' 
  },
  candidateRole: { 
    fontSize: '11px', 
    color: '#D23A01', 
    fontWeight: '600' 
  },
  voteCount: { 
    fontWeight: '800', 
    color: '#1a1a1a',
    fontSize: '14px'
  },
  percentageContainer: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    minWidth: '120px' 
  },
  percentageBar: { 
    flex: 1, 
    height: '6px', 
    background: '#e5e7eb', 
    borderRadius: '3px', 
    overflow: 'hidden' 
  },
  percentageFill: { 
    height: '100%', 
    background: 'linear-gradient(90deg, #D23A01, #ff6b35)', 
    borderRadius: '3px' 
  },
  percentageText: { 
    fontSize: '13px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    minWidth: '45px' 
  },
  winnerBadgeSmall: { 
    fontSize: '11px', 
    fontWeight: '700', 
    background: '#dcfce7', 
    color: '#166534', 
    padding: '4px 12px', 
    borderRadius: '20px', 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '5px' 
  },
  runnerUpBadge: { 
    fontSize: '11px', 
    fontWeight: '600', 
    background: '#f1f5f9', 
    color: '#6b7280', 
    padding: '4px 12px', 
    borderRadius: '20px' 
  },
  allocationSection: { 
    marginTop: '16px' 
  },
  allocationGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
    gap: '16px' 
  },
  allocationCard: { 
    padding: '16px', 
    background: '#f8fafc', 
    borderRadius: '12px', 
    border: '1px solid #e5e7eb' 
  },
  allocationRank: { 
    fontSize: '12px', 
    fontWeight: '800', 
    color: '#D23A01', 
    marginBottom: '8px',
    textTransform: 'uppercase'
  },
  allocationRole: { 
    fontSize: '16px', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    marginBottom: '6px'
  },
  allocationWinner: { 
    fontSize: '13px', 
    color: '#D23A01', 
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  allocationDesc: { 
    fontSize: '11px', 
    color: '#6b7280', 
    marginTop: '8px' 
  }
};

export default PositionResultsTable;