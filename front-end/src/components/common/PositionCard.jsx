import React, { useState } from 'react';
import { FiEye, FiUsers, FiAward, FiTrendingUp, FiStar, FiUser } from 'react-icons/fi';
import { FaTrophy, FaCrown } from 'react-icons/fa';

// API base URL for image handling
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001';

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
  
  // Calculate turnout percentage
  const totalVotes = position.totalVotes || 0;
  const estimatedTotalVoters = totalCandidates * 500;
  const turnout = totalCandidates > 0 && estimatedTotalVoters > 0 
    ? Math.min(100, Math.round((totalVotes / estimatedTotalVoters) * 100)) 
    : 0;

  const styles = {
    positionCard: {
      background: 'white',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.25s ease',
      border: '1px solid #e2e8f0',
      cursor: 'pointer',
      transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
      boxShadow: isHovered ? '0 20px 25px -12px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.05)',
      borderColor: isHovered ? '#D23A01' : '#e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },
    cardHeader: {
      padding: '20px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
      borderBottom: '1px solid #e2e8f0'
    },
    positionTitleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '12px',
      flexWrap: 'wrap',
      gap: '10px'
    },
    positionName: {
      fontSize: '20px',
      fontWeight: '800',
      color: '#1a1a1a',
      marginBottom: '4px'
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
      padding: '4px 12px',
      borderRadius: '30px',
      fontSize: '12px',
      fontWeight: '600'
    },
    positionDesc: {
      fontSize: '14px',
      color: '#64748b',
      lineHeight: '1.5',
      marginTop: '12px'
    },
    cardContent: {
      padding: '20px',
      flex: 1
    },
    statsRow: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: '1px solid #f1f5f9',
      gap: '12px'
    },
    stat: {
      textAlign: 'center',
      flex: 1
    },
    statValue: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#1a1a1a',
      lineHeight: '1.2'
    },
    statLabel: {
      fontSize: '12px',
      color: '#64748b',
      marginTop: '4px',
      fontWeight: '500'
    },
   
    
    
    
    candidatesPreview: {
      marginBottom: '20px'
    },
    previewHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '12px'
    },
    previewTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#1a1a1a'
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
      padding: '4px 12px 4px 6px',
      background: '#f8fafc',
      borderRadius: '30px',
      fontSize: '13px',
      color: '#1e293b',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s ease'
    },
    candidateChipAvatar: {
      width: '28px',
      height: '28px',
      borderRadius: '50%',
      background: '#D23A01',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '700',
      overflow: 'hidden'
    },
    candidateChipAvatarImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    candidateChipName: {
      maxWidth: '80px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    },
    winnerCrown: {
      color: '#f59e0b',
      marginLeft: '4px',
      fontSize: '11px',
      display: 'inline-flex',
      alignItems: 'center'
    },
    moreCandidates: {
      fontSize: '13px',
      color: '#64748b',
      padding: '6px 12px',
      background: '#f8fafc',
      borderRadius: '30px',
      fontWeight: '500'
    },
    viewBtn: {
      width: 'calc(100% - 40px)',
      margin: '0 20px 20px 20px',
      padding: '12px 20px',
      background: isHovered ? '#D23A01' : '#f1f5f9',
      border: 'none',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '700',
      color: isHovered ? 'white' : '#475569',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px'
    }
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(position.positionId);
    }
  };

  const renderCandidateAvatar = (candidate, idx) => {
    const imageUrl = getImageUrl(candidate.photoUrl || candidate.campaignPhoto);
    const candidateName = candidate.name || candidate.candidateName || '';
    const initial = candidateName.charAt(0) || '?';
    
    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt={candidateName}
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
      onClick={() => onViewDetails && onViewDetails(position.positionId)}
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
              <FiUser size={10} /> {totalCandidates} Candidate{totalCandidates !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div style={styles.positionDesc}>
          {position.positionDescription ? 
            (position.positionDescription.length > 100 ? 
              `${position.positionDescription.substring(0, 100)}...` : 
              position.positionDescription) 
            : 'No description available'}
        </div>
      </div>
      
      <div style={styles.cardContent}>
        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <div style={styles.statValue}>{totalCandidates}</div>
            <div style={styles.statLabel}>Candidates</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statValue}>{totalVotes.toLocaleString()}</div>
            <div style={styles.statLabel}>Total Votes</div>
          </div>
          <div style={styles.stat}>
            <div style={styles.statValue}>{turnout}%</div>
            <div style={styles.statLabel}>Turnout</div>
          </div>
        </div>
        
     
        
      
      </div>
      
      <button 
        style={styles.viewBtn}
        onClick={handleViewClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <FiEye size={16} />
        View Position Details
      </button>
    </div>
  );
};

export default PositionCard;