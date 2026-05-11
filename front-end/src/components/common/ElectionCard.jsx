import React, { useState } from 'react';
import { 
  FiClock, FiUsers, FiEye, FiShield, FiCheckCircle, 
  FiAlertCircle, FiUserPlus, FiFileText, FiBarChart2,
  FiAward, FiCalendar
} from 'react-icons/fi';
import { formatLocalDate } from '../../utils/formatLocalDate';

const ElectionCard = ({ 
  election, 
  onViewDetails, 
  onAction, 
  buttonConfig,
  registrationStatus,
  nominationStatus 
}) => {
  const [expanded, setExpanded] = useState(false);
  const isLongDescription = election.description?.length > 90;

  const getStatusConfig = (status) => {
    const configs = {
      draft: { label: 'DRAFT', bg: '#f1f5f9', color: '#475569', icon: <FiClock size={14} /> },
      registration_open: { label: 'REGISTRATION OPEN', bg: '#D23A0110', color: '#D23A01', icon: <FiUserPlus size={14} /> },
      nomination_open: { label: 'NOMINATION OPEN', bg: '#02343010', color: '#023430', icon: <FiFileText size={14} /> },
      voting_open: { label: 'VOTING LIVE', bg: '#D23A0110', color: '#D23A01', icon: <FiShield size={14} /> },
      results_published: { label: 'RESULTS', bg: '#02343010', color: '#023430', icon: <FiBarChart2 size={14} /> },
      completed: { label: 'COMPLETED', bg: '#e5e7eb', color: '#4b5563', icon: <FiCheckCircle size={14} /> }
    };
    return configs[status] || configs.draft;
  };

  const getTimeRemaining = (votingEnd) => {
    const end = new Date(votingEnd);
    const now = new Date();
    const diff = end - now;
    
    if (diff <= 0) return 'Voting ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (86400000)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  };

  const status = getStatusConfig(election.status);
  const btnConfig = buttonConfig || {
    text: 'View Details',
    disabled: false,
    color: '#D23A01',
    message: ''
  };

  const getStatusMessage = () => {
    if (election.status === 'registration_open' && registrationStatus?.isRegistered) {
      return { text: 'You are registered. Check your email for credentials.', icon: <FiCheckCircle size={14} />, color: '#10b981' };
    }
    if (election.status === 'voting_open' && !registrationStatus?.isRegistered) {
      return { text: 'Registration required before voting', icon: <FiAlertCircle size={14} />, color: '#f59e0b' };
    }
    if (election.status === 'nomination_open' && nominationStatus?.hasNomination) {
      const statusText = nominationStatus.status === 'pending' ? 'Pending Review' : nominationStatus.status.toUpperCase();
      return { text: `Nomination ${statusText}`, icon: <FiFileText size={14} />, color: '#f59e0b' };
    }
    if (btnConfig.message) {
      return { text: btnConfig.message, icon: <FiAlertCircle size={14} />, color: '#64748b' };
    }
    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <div 
      style={styles.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 24px -10px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
      }}
    >
      <div style={styles.header}>
        <div style={styles.topRow}>
          <div style={{ ...styles.badge, backgroundColor: status.bg, color: status.color }}>
            <span style={styles.icon}>{status.icon}</span> {status.label}
          </div>
          <div style={styles.rightActions}>
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
              {election.status === 'voting_open' ? 'Ends:' : 'Voting Period Ends:'} <strong>{formatLocalDate(election.timeline?.votingEnd, true)}</strong>
            </span>
          </div>
          {election.status === 'voting_open' && (
            <div style={styles.timeRemaining}>
              <FiClock size={14} color="#D23A01" />
              <span style={styles.remainingText}>
                {getTimeRemaining(election.timeline?.votingEnd)}
              </span>
            </div>
          )}
        </div>

        {statusMessage && (
          <div style={{ ...styles.statusMessage, color: statusMessage.color }}>
            {statusMessage.icon}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <button 
          style={{
            ...styles.actionBtn,
            background: btnConfig.color,
            opacity: btnConfig.disabled ? 0.6 : 1,
            cursor: btnConfig.disabled ? 'not-allowed' : 'pointer'
          }}
          onClick={() => !btnConfig.disabled && onAction(election)}
          disabled={btnConfig.disabled}
        >
          {btnConfig.text}
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
  header: {
    padding: '24px 24px 16px',
    background: 'linear-gradient(to bottom, #f8fafc, #ffffff)'
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
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
    letterSpacing: '0.02em'
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
    fontSize: '20px',
    fontWeight: '800',
    color: '#1a1a1a',
    margin: 0,
    lineHeight: '1.4',
    fontFamily: "'Poppins', sans-serif"
  },
  content: {
    padding: '0 24px 24px'
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
    marginBottom: '16px',
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
    padding: '6px 12px',
    borderRadius: '20px'
  },
  remainingText: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#D23A01',
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
    background: '#f8fafc',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'Poppins', sans-serif"
  },
  actionBtn: {
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

export default ElectionCard;