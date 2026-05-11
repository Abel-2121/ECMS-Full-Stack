import React, { useState } from 'react';
import { FiEye, FiUsers, FiAward, FiTrendingUp, FiStar, FiUser } from 'react-icons/fi';
import { FaTrophy, FaCrown } from 'react-icons/fa';

// API base URL for image handling
const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:4001';

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

const PositionCard = ({ position, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getElectionTypeIcon = (type) => {
    switch (type) {
      case 'ranked': return <FiTrendingUp size={12} />;
      case 'multiple_winners': return <FiUsers size={12} />;
      default: return <FaTrophy size={12} />;
    }
  };

  const getStatusBadge = (type) => {
    if (type === 'ranked') return { text: 'Ranked Voting', color: '#8b5cf6', bg: '#ede9fe', icon: <FiTrendingUp size={10} /> };
    if (type === 'multiple_winners') return { text: 'Multiple Winners', color: '#10b981', bg: '#dcfce7', icon: <FiUsers size={10} /> };
    return { text: 'Single Winner', color: '#D23A01', bg: '#FEF3F0', icon: <FaTrophy size={10} /> };
  };

  const status = getStatusBadge(position.electionType);
  const totalCandidates = position.candidates?.length || 0;
  const topCandidates = position.candidates?.slice(0, 3) || [];
  const turnout = totalCandidates > 0 ? Math.min(100, Math.round((position.totalVotes || 0) / (totalCandidates * 500) * 100)) : 0;

  const styles = {
    positionCard: {
      background: 'white',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.25s ease',
      border: '1px solid #e2e8f0',
      cursor: 'pointer',
      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
      boxShadow: isHovered ? '0 12px 24px -12px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
      borderColor: isHovered ? '#cbd5e1' : '#e2e8f0'
    },
    cardHeader: {
      padding: '16px 20px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
      borderBottom: '1px solid #e2e8f0'
    },
    positionTitleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '8px',
      flexWrap: 'wrap',
      gap: '10px'
    },
    positionName: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#0f172a'
    },
    positionBadge: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px',
      borderRadius: '30px',
      fontSize: '11px',
      fontWeight: '600'
    },
    positionDesc: {
      fontSize: '13px',
      color: '#64748b',
      lineHeight: '1.5',
      marginTop: '8px'
    },
    cardContent: {
      padding: '16px 20px'
    },
    statsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '16px',
      paddingBottom: '12px',
      borderBottom: '1px solid #f1f5f9'
    },
    stat: {
      textAlign: 'center',
      flex: 1
    },
    statValue: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#0f172a'
    },
    statLabel: {
      fontSize: '11px',
      color: '#64748b',
      marginTop: '2px'
    },
    progressSection: {
      marginBottom: '16px'
    },
    progressHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '6px',
      fontSize: '12px',
      color: '#64748b'
    },
    progressBar: {
      height: '6px',
      background: '#e2e8f0',
      borderRadius: '3px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      background: '#D23A01',
      borderRadius: '3px',
      transition: 'width 0.3s ease'
    },
    candidatesPreview: {
      marginBottom: '16px'
    },
    previewHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    previewTitle: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#0f172a'
    },
    previewCount: {
      fontSize: '12px',
      color: '#64748b'
    },
    candidateAvatars: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    candidateChip: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 10px 4px 6px',
      background: '#f8fafc',
      borderRadius: '30px',
      fontSize: '12px',
      color: '#1e293b',
      border: '1px solid #e2e8f0'
    },
    candidateChipAvatar: {
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      background: '#D23A01',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: '600',
      overflow: 'hidden'
    },
    candidateChipAvatarImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    winnerCrown: {
      color: '#f59e0b',
      marginLeft: '4px',
      fontSize: '11px',
      display: 'inline-flex',
      alignItems: 'center'
    },
    moreCandidates: {
      fontSize: '12px',
      color: '#64748b',
      padding: '6px 10px',
      background: '#f8fafc',
      borderRadius: '30px'
    },
    viewBtn: {
      width: '100%',
      padding: '10px',
      background: isHovered ? '#D23A01' : '#f1f5f9',
      border: 'none',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '600',
      color: isHovered ? 'white' : '#475569',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    }
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    onViewDetails(position.positionId);
  };

  const renderCandidateAvatar = (candidate, idx) => {
    const imageUrl = getImageUrl(candidate.photoUrl || candidate.campaignPhoto);
    const initial = (candidate.name || candidate.candidateName)?.charAt(0) || '?';
    
    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt={candidate.name || candidate.candidateName}
          style={styles.candidateChipAvatarImg}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = initial;
          }}
        />
      );
    }
    return initial;
  };

  return (
    <div 
      style={styles.positionCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onViewDetails(position.positionId)}
    >
      <div style={styles.cardHeader}>
        <div style={styles.positionTitleRow}>
          <div>
            <div style={styles.positionName}>{position.positionName}</div>
          </div>
          <div style={styles.positionBadge}>
            <span style={{ ...styles.badge, background: status.bg, color: status.color }}>
              {getElectionTypeIcon(position.electionType)} {status.text}
            </span>
            <span style={{ ...styles.badge, background: '#f1f5f9', color: '#475569' }}>
              <FiAward size={10} /> {position.totalSeats} Seat{position.totalSeats > 1 ? 's' : ''}
            </span>
            <span style={{ ...styles.badge, background: '#dcfce7', color: '#166534' }}>
              <FiUser size={10} /> {totalCandidates} Candidates
            </span>
          </div>
        </div>
        <div style={styles.positionDesc}>
          {position.positionDescription?.substring(0, 100)}...
        </div>
      </div>
      
      <div style={styles.cardContent}>
        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <div style={styles.statValue}>{totalCandidates}</div>
            <div style={styles.statLabel}>Candidates</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statValue}>{position.totalVotes?.toLocaleString() || 0}</div>
            <div style={styles.statLabel}>Total Votes</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statValue}>{turnout}%</div>
            <div style={styles.statLabel}>Turnout</div>
          </div>
        </div>
        
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span>Vote Progress</span>
            <span>{turnout}%</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${turnout}%` }} />
          </div>
        </div>
        
        <div style={styles.candidatesPreview}>
          <div style={styles.previewHeader}>
            <span style={styles.previewTitle}>Leading Candidates</span>
            <span style={styles.previewCount}>Top {Math.min(3, totalCandidates)} of {totalCandidates}</span>
          </div>
          <div style={styles.candidateAvatars}>
            {topCandidates.map((candidate, idx) => (
              <div key={candidate.candidateId || idx} style={styles.candidateChip}>
                <div style={styles.candidateChipAvatar}>
                  {renderCandidateAvatar(candidate, idx)}
                </div>
                <span>{(candidate.name || candidate.candidateName)?.split(' ')[0]}</span>
                {candidate.isWinner && (
                  <span style={styles.winnerCrown}>
                    <FaCrown size={10} color="#f59e0b" />
                  </span>
                )}
              </div>
            ))}
            {totalCandidates > 3 && (
              <div style={styles.moreCandidates}>+{totalCandidates - 3} more</div>
            )}
          </div>
        </div>
      </div>
      
      <button 
        style={styles.viewBtn}
        onClick={handleViewClick}
      >
        <FiEye size={14} />
        View Position Details
      </button>
    </div>
  );
};

export default PositionCard;