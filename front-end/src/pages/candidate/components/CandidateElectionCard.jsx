// pages/candidate/components/CandidateElectionCard.jsx
import React, { useState } from 'react';
import { 
  FiClock, FiUsers, FiEye, FiShield, FiCheckCircle, 
  FiAlertCircle, FiFileText, FiUserPlus, FiBarChart2,
  FiCalendar
} from 'react-icons/fi';
import { formatLocalDate } from '../../../utils/formatLocalDate';

const CandidateElectionCard = ({ election, onViewDetails, onSelectElection, hasNomination, nominationStatus }) => {
  const [expanded, setExpanded] = useState(false);
  const isLongDescription = election.description?.length > 90;

  const getStatusConfig = (status) => {
    const configs = {
      draft: { label: 'DRAFT', bg: '#f1f5f9', color: '#475569', icon: <FiClock size={14} /> },
      registration_open: { label: 'REGISTRATION', bg: '#dbeafe', color: '#1e40af', icon: <FiUserPlus size={14} /> },
      nomination_open: { label: 'NOMINATION OPEN', bg: '#D23A0110', color: '#D23A01', icon: <FiFileText size={14} /> },
      voting_open: { label: 'VOTING LIVE', bg: '#dcfce7', color: '#166534', icon: <FiShield size={14} /> },
      results_published: { label: 'RESULTS', bg: '#ede9fe', color: '#6d28d9', icon: <FiBarChart2 size={14} /> },
      completed: { label: 'COMPLETED', bg: '#e5e7eb', color: '#4b5563', icon: <FiCheckCircle size={14} /> }
    };
    return configs[status] || configs.draft;
  };

  const getTimeRemaining = (nominationEnd) => {
    const end = new Date(nominationEnd);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Nomination ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (86400000)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  };

  const status = getStatusConfig(election.status);
  const canNominate = election.status === 'nomination_open' && !hasNomination;
  const showNominationTimeRemaining = election.status === 'nomination_open';

  return (
    <div 
      style={{
        ...styles.card,
        ...(hasNomination && styles.cardDisabled)
      }}
      onMouseEnter={(e) => {
        if (!hasNomination) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 24px -10px rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
      }}
    >
      <div style={styles.header}>
        <div style={styles.topRow}>
          <div style={{ ...styles.badge, backgroundColor: status.bg, color: status.color }}>
            {status.icon} {status.label}
          </div>
          <div style={styles.rightActions}>
            <div style={styles.secureBadge}>
              <FiShield size={12} /> Secure
            </div>
            <button 
              style={styles.viewIconBtn}
              onClick={() => onViewDetails(election)}
              title="View Details"
            >
              <FiEye size={18} />
            </button>
          </div>
        </div>
        <h3 style={styles.title}>{election.title}</h3>
      </div>

      <div style={styles.content}>
        <div style={styles.descBox}>
          <p style={{ ...styles.description, ...(!expanded && isLongDescription ? styles.lineClamp : {}) }}>
            {election.description || "No description provided for this election."}
          </p>
          {isLongDescription && (
            <button style={styles.moreBtn} onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Show Less' : 'Read Full Description'}
            </button>
          )}
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statItem}>
            <div style={styles.statVal}>{election.positions?.length || 0}</div>
            <div style={styles.statLab}>Positions</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statVal}>{election.statistics?.totalCandidates || 0}</div>
            <div style={styles.statLab}>Candidates</div>
          </div>
          <div style={styles.statItem}>
            <div style={styles.statVal}>{(election.statistics?.totalEligibleVoters || 0).toLocaleString()}</div>
            <div style={styles.statLab}>Voters</div>
          </div>
        </div>

        <div style={styles.timeline}>
          <div style={styles.timeItem}>
            <FiClock size={14} color="#6b7280" />
            <span style={styles.timeText}>
              {showNominationTimeRemaining ? 'Nomination Ends:' : 'Voting Ends:'} 
              <strong>
                {showNominationTimeRemaining 
                  ? formatLocalDate(election.timeline?.nominationEnd, true)
                  : formatLocalDate(election.timeline?.votingEnd, true)}
              </strong>
            </span>
          </div>
          {showNominationTimeRemaining && (
            <div style={styles.timeRemaining}>
              <FiClock size={14} color="#D23A01" />
              <span style={{ ...styles.remainingText, color: '#D23A01' }}>
                {getTimeRemaining(election.timeline?.nominationEnd)}
              </span>
            </div>
          )}
        </div>

        {hasNomination && (
          <div style={styles.statusMessage}>
            <FiAlertCircle size={14} />
            <span>
              You have already submitted a nomination. 
              Status: <strong>{nominationStatus === 'pending' ? 'Pending Review' : nominationStatus || 'Submitted'}</strong>
            </span>
          </div>
        )}

        <button 
          style={{
            ...styles.selectBtn,
            background: canNominate ? '#D23A01' : '#9ca3af',
            cursor: canNominate ? 'pointer' : 'not-allowed',
            opacity: canNominate ? 1 : 0.7
          }}
          onClick={() => canNominate && onSelectElection(election)}
          disabled={!canNominate}
          onMouseEnter={(e) => {
            if (canNominate) e.currentTarget.style.background = '#b02e00';
          }}
          onMouseLeave={(e) => {
            if (canNominate) e.currentTarget.style.background = '#D23A01';
          }}
        >
          <FiFileText size={16} />
          {hasNomination ? `Nomination ${nominationStatus === 'pending' ? 'Pending' : nominationStatus || 'Submitted'}` : 'Select Election'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: '#ffffff',
    borderRadius: '20px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'default',
    overflow: 'hidden'
  },
  cardDisabled: {
    opacity: 0.85,
    background: '#f8fafc'
  },
  header: {
    padding: 'clamp(20px, 4vw, 24px) clamp(20px, 4vw, 24px) 16px',
    background: 'linear-gradient(to bottom, #f8fafc, #ffffff)'
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '8px'
  },
  rightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  badge: {
    padding: '6px 14px',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: '800',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    letterSpacing: '0.02em',
    fontFamily: "'Poppins', sans-serif"
  },
  secureBadge: {
    background: '#dbeafe',
    color: '#1e40af',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: "'Poppins', sans-serif"
  },
  viewIconBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    transition: 'all 0.2s'
  },
  title: {
    fontSize: 'clamp(18px, 4vw, 20px)',
    fontWeight: '800',
    color: '#1a1a1a',
    margin: 0,
    lineHeight: '1.4',
    fontFamily: "'Poppins', sans-serif"
  },
  content: {
    padding: '0 clamp(20px, 4vw, 24px) 24px'
  },
  descBox: {
    marginBottom: '20px'
  },
  description: {
    fontSize: '14px',
    color: '#4b5563',
    lineHeight: '1.6',
    margin: 0,
    fontFamily: "'Poppins', sans-serif"
  },
  lineClamp: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  moreBtn: {
    background: 'none',
    border: 'none',
    color: '#D23A01',
    fontSize: '13px',
    fontWeight: '700',
    padding: '4px 0',
    cursor: 'pointer',
    marginTop: '4px',
    fontFamily: "'Poppins', sans-serif"
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    padding: '16px 0',
    borderTop: '1px solid #e5e7eb',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '20px'
  },
  statItem: {
    textAlign: 'center'
  },
  statVal: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif"
  },
  statLab: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginTop: '4px',
    fontFamily: "'Poppins', sans-serif"
  },
  timeline: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px'
  },
  timeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  timeRemaining: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#D23A0110',
    padding: '4px 12px',
    borderRadius: '20px'
  },
  remainingText: {
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif"
  },
  timeText: {
    fontSize: '13px',
    color: '#4b5563',
    fontFamily: "'Poppins', sans-serif"
  },
  statusMessage: {
    fontSize: '12px',
    marginBottom: '14px',
    padding: '10px 14px',
    background: '#D23A0110',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#D23A01',
    fontFamily: "'Poppins', sans-serif"
  },
  selectBtn: {
    width: '100%',
    padding: '14px',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'background 0.2s',
    fontFamily: "'Poppins', sans-serif",
    cursor: 'pointer'
  }
};

// Add hover effect
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .view-icon-btn:hover {
    background: #f1f5f9 !important;
    color: #D23A01 !important;
  }
`;
document.head.appendChild(styleSheet);

export default CandidateElectionCard;