// components/voting/ElectionHeader.jsx
import React, { useState } from 'react';
import { FiCalendar, FiClock, FiUsers, FiInfo, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const ElectionHeader = ({ election }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  
  if (!election) return null;

   const formatLocalDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...(includeTime && { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true  // 12-hour format with AM/PM
      })
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const getTimeRemaining = () => {
    const end = new Date(election.timeline?.votingEnd);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Voting has ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (86400000)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (3600000)) / (1000 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  };

  const description = election.description || 'No description provided.';
  const shouldTruncate = description.length > 200;
  const displayDescription = showFullDescription || !shouldTruncate 
    ? description 
    : `${description.slice(0, 200)}...`;

  return (
    <div style={styles.container}>
      {/* Main Header */}
      <div style={styles.header}>
        <div style={styles.titleSection}>
          <h1 style={styles.title}>{election.title}</h1>
          <p style={styles.liveBadge}>
            <p style={styles.liveDot} />
            LIVE VOTING
          </p>
        </div>
        
        <div style={styles.countdownBox}>
          <FiClock size={18} />
          <div>
            <div style={styles.countdownLabel}>Voting Ends In</div>
            <div style={styles.countdownValue}>{getTimeRemaining()}</div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={styles.descriptionBox}>
        <FiInfo size={16} style={styles.descriptionIcon} />
        <div style={styles.descriptionContent}>
          <p style={styles.description}>
            {displayDescription}
          </p>
          {shouldTruncate && (
            <button 
              style={styles.readMoreBtn}
              onClick={() => setShowFullDescription(!showFullDescription)}
            >
              {showFullDescription ? 'Show Less' : 'Read More'}
              {showFullDescription ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Timeline Info */}
      <div style={styles.timelineGrid}>
        <div style={styles.timelineItem}>
          <FiCalendar size={16} style={styles.timelineIcon} />
          <div>
            <div style={styles.timelineLabel}>Voting Opens</div>
            <div style={styles.timelineDate}>{formatLocalDate(election.timeline?.votingStart, true)}</div>
          </div>
        </div>
        <div style={styles.timelineItem}>
          <FiCalendar size={16} style={styles.timelineIcon} />
          <div>
            <div style={styles.timelineLabel}>Voting Closes</div>
            <div style={styles.timelineDate}>{formatLocalDate(election.timeline?.votingEnd, true)}</div>
          </div>
        </div>
        <div style={styles.timelineItem}>
          <FiUsers size={16} style={styles.timelineIcon} />
          <div>
            <div style={styles.timelineLabel}>Results Published</div>
            <div style={styles.timelineDate}>{formatLocalDate(election.timeline?.resultPublicationDate, true)}</div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div style={styles.securityNotice}>
        <p style={styles.securityIcon}>🔒</p>
        <p style={styles.securityText}>
          Your vote is encrypted and anonymous. This is a secure, verifiable voting session.
        </p>
      </div>

      {/* Add UTC note */}
      <div style={styles.utcNote}>
        <p>🌐</p>
        <p>All times are in UTC</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: '20px',
    padding: '28px',
    marginBottom: '24px',
    color: 'white'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px'
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    margin: 0,
    color: 'white'
  },
  liveBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(239, 68, 68, 0.2)',
    padding: '6px 14px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.3)'
  },
  liveDot: {
    width: '8px',
    height: '8px',
    background: '#ef4444',
    borderRadius: '50%',
    animation: 'pulse 1.5s infinite'
  },
  countdownBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.1)',
    padding: '12px 20px',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)'
  },
  countdownLabel: {
    fontSize: '11px',
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  countdownValue: {
    fontSize: '16px',
    fontWeight: '600'
  },
  descriptionBox: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    marginBottom: '20px'
  },
  descriptionIcon: {
    flexShrink: 0,
    marginTop: '2px',
    opacity: 0.7
  },
  descriptionContent: {
    flex: 1
  },
  description: {
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
    opacity: 0.9
  },
  readMoreBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '13px',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: 0
  },
  timelineGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '20px'
  },
  timelineItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.05)',
    padding: '12px 16px',
    borderRadius: '12px'
  },
  timelineIcon: {
    opacity: 0.7,
    flexShrink: 0
  },
  timelineLabel: {
    fontSize: '11px',
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  timelineDate: {
    fontSize: '13px',
    fontWeight: '500'
  },
  securityNotice: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: 'rgba(16, 185, 129, 0.1)',
    borderRadius: '10px',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    marginBottom: '12px'
  },
  securityIcon: {
    fontSize: '16px'
  },
  securityText: {
    fontSize: '12px',
    opacity: 0.8
  },
  utcNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    fontSize: '11px',
    opacity: 0.6,
    justifyContent: 'flex-end'
  }
};

// Add keyframes for pulse animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes pulse {
    0% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.2); }
    100% { opacity: 1; transform: scale(1); }
  }
`;
document.head.appendChild(styleSheet);

export default ElectionHeader;