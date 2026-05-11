import React from 'react';
import { formatLocalDate } from '../../utils/formatLocalDate';
import { 
  FiShield, FiClock, FiUsers, FiCheckCircle, FiFileText, 
  FiEdit3, FiBarChart2, FiAward, FiTarget, FiCalendar, 
  FiUserCheck, FiLock, FiAlertCircle, FiInfo, FiList,
  FiGrid, FiCheck, FiX, FiPlay, FiStar, FiEye
} from 'react-icons/fi';

const ElectionDetailModal = ({ election, isOpen, onClose }) => {
  if (!isOpen || !election) return null;

  const getStatusConfig = (status) => {
    const configs = {
      draft: { label: 'DRAFT', className: 'status-draft', icon: <FiFileText size={14} /> },
      registration_open: { label: 'REGISTRATION OPEN', className: 'status-registration_open', icon: <FiEdit3 size={14} /> },
      nomination_open: { label: 'NOMINATION OPEN', className: 'status-nomination_open', icon: <FiEdit3 size={14} /> },
      voting_open: { label: 'VOTING OPEN', className: 'status-voting_open', icon: <FiShield size={14} /> },
      results_published: { label: 'RESULTS PUBLISHED', className: 'status-results_published', icon: <FiBarChart2 size={14} /> },
      completed: { label: 'COMPLETED', className: 'status-completed', icon: <FiCheckCircle size={14} /> }
    };
    return configs[status] || configs.draft;
  };

  const getElectionTypeIcon = (type) => {
    switch (type) {
      case 'ranked': return <FiBarChart2 size={14} />;
      case 'multiple_winners': return <FiUsers size={14} />;
      default: return <FiAward size={14} />;
    }
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

  const getStatusBg = (status) => {
    switch(status) {
      case 'draft': return { background: '#f1f5f9', color: '#475569', dotBg: '#94a3b8' };
      case 'registration_open': return { background: '#D23A0110', color: '#D23A01', dotBg: '#D23A01' };
      case 'nomination_open': return { background: '#02343010', color: '#023430', dotBg: '#023430' };
      case 'voting_open': return { background: '#D23A0110', color: '#D23A01', dotBg: '#D23A01' };
      case 'results_published': return { background: '#02343010', color: '#023430', dotBg: '#023430' };
      case 'completed': return { background: '#e5e7eb', color: '#4b5563', dotBg: '#9ca3af' };
      default: return { background: '#f1f5f9', color: '#475569', dotBg: '#94a3b8' };
    }
  };

  const statusConfig = getStatusConfig(election.status);
  const statusStyle = getStatusBg(election.status);
  const turnout = election.statistics?.totalEligibleVoters > 0
    ? Math.round((election.statistics.totalVotesCast / election.statistics.totalEligibleVoters) * 100)
    : 0;

  const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(6px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    modal: {
      background: 'white',
      borderRadius: '24px',
      width: '90%',
      maxWidth: '640px',
      maxHeight: '85vh',
      overflowY: 'auto',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    modalHeader: {
      padding: '20px',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      color: 'white'
    },
    modalElectionTitle: {
      fontSize: '22px',
      fontWeight: '800',
      marginBottom: '8px',
      fontFamily: "'Poppins', sans-serif"
    },
    modalElectionId: {
      fontSize: '12px',
      fontFamily: 'monospace',
      opacity: 0.7,
      marginBottom: '12px'
    },
    modalStatusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 16px',
      borderRadius: '30px',
      fontSize: '12px',
      fontWeight: '700',
      marginBottom: '12px',
      background: statusStyle.background,
      color: statusStyle.color
    },
    statusDot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: statusStyle.dotBg
    },
    modalElectionDesc: {
      fontSize: '14px',
      opacity: 0.85,
      lineHeight: '1.6',
      fontFamily: "'Poppins', sans-serif"
    },
    modalBody: {
      padding: '20px'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '12px',
      marginBottom: '20px'
    },
    statCard: {
      background: '#f8fafc',
      padding: '14px',
      borderRadius: '12px',
      textAlign: 'center',
      border: '1px solid #e5e7eb'
    },
    statCardValue: {
      fontSize: '24px',
      fontWeight: '800',
      color: '#D23A01',
      fontFamily: "'Poppins', sans-serif"
    },
    statCardLabel: {
      fontSize: '11px',
      color: '#4b5563',
      marginTop: '4px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      fontFamily: "'Poppins', sans-serif",
      fontWeight: '600'
    },
    timeRemainingBox: {
      background: '#D23A0110',
      padding: '14px',
      borderRadius: '12px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      border: '1px solid #D23A0120'
    },
    timeRemainingText: {
      fontSize: '15px',
      fontWeight: '700',
      color: '#D23A01',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontFamily: "'Poppins', sans-serif"
    },
    modalSection: {
      marginBottom: '20px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      paddingBottom: '8px',
      borderBottom: '2px solid #e5e7eb',
      fontFamily: "'Poppins', sans-serif"
    },
    timelineGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px'
    },
    timelineCard: {
      background: '#f8fafc',
      padding: '14px',
      borderRadius: '10px',
      border: '1px solid #e5e7eb'
    },
    timelineCardLabel: {
      fontSize: '11px',
      color: '#6b7280',
      fontWeight: '700',
      textTransform: 'uppercase',
      marginBottom: '6px',
      fontFamily: "'Poppins', sans-serif"
    },
    timelineCardDate: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#1a1a1a',
      fontFamily: "'Poppins', sans-serif"
    },
    positionsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    positionItem: {
      background: '#f8fafc',
      borderRadius: '10px',
      padding: '14px',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s'
    },
    positionName: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '6px',
      fontFamily: "'Poppins', sans-serif"
    },
    positionMeta: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      fontSize: '12px',
      color: '#4b5563',
      marginBottom: '8px'
    },
    positionType: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 8px',
      background: 'white',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '600'
    },
    positionDesc: {
      fontSize: '13px',
      color: '#6b7280',
      lineHeight: '1.5',
      fontFamily: "'Poppins', sans-serif"
    },
    eligibilityList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px'
    },
    eligibilityItem: {
      background: '#f8fafc',
      padding: '10px 16px',
      borderRadius: '8px',
      fontSize: '13px',
      border: '1px solid #e5e7eb',
      fontFamily: "'Poppins', sans-serif"
    },
    eligibilityLabel: {
      fontWeight: '700',
      color: '#1a1a1a'
    },
    rulesGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px'
    },
    ruleChip: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: '#f8fafc',
      borderRadius: '30px',
      fontSize: '13px',
      border: '1px solid #e5e7eb',
      fontFamily: "'Poppins', sans-serif"
    },
    modalFooter: {
      padding: '16px 20px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-between',
      background: '#fafafa',
      borderBottomLeftRadius: '24px',
      borderBottomRightRadius: '24px',
      gap: '12px'
    },
    closeModalBtn: {
      padding: '10px 20px',
      background: '#f1f5f9',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      color: '#4b5563',
      transition: 'all 0.2s',
      flex: 1,
      fontFamily: "'Poppins', sans-serif"
    },
    voteFromModalBtn: {
      padding: '10px 20px',
      background: '#D23A01',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '700',
      color: 'white',
      transition: 'all 0.2s',
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontFamily: "'Poppins', sans-serif"
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHeader}>
          <div style={styles.modalElectionTitle}>{election.title}</div>
          <div style={styles.modalElectionId}>Election ID: {election.electionId}</div>
          <div style={styles.modalStatusBadge}>
            <span style={styles.statusDot}></span>
            {statusConfig.icon} {statusConfig.label}
          </div>
          <div style={styles.modalElectionDesc}>{election.description}</div>
        </div>

        <div style={styles.modalBody}>
          {election.status === 'voting_open' && (
            <div style={styles.timeRemainingBox}>
              <FiClock size={20} color="#D23A01" />
              <span style={styles.timeRemainingText}>
                <FiClock size={14} /> {getTimeRemaining(election.timeline?.votingEnd)}
              </span>
            </div>
          )}

          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statCardValue}>{election.positions?.length || 0}</div>
              <div style={styles.statCardLabel}>Positions</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statCardValue}>{election.statistics?.totalCandidates || 0}</div>
              <div style={styles.statCardLabel}>Candidates</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statCardValue}>{(election.statistics?.totalEligibleVoters || 0).toLocaleString()}</div>
              <div style={styles.statCardLabel}>Voters</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statCardValue}>{turnout}%</div>
              <div style={styles.statCardLabel}>Turnout</div>
            </div>
          </div>

          <div style={styles.modalSection}>
            <div style={styles.sectionTitle}><FiCalendar size={16} /> Timeline</div>
            <div style={styles.timelineGrid}>
              <div style={styles.timelineCard}>
                <div style={styles.timelineCardLabel}>Voting Starts</div>
                <div style={styles.timelineCardDate}>
                  {formatLocalDate(election.timeline?.votingStart, true)}
                </div>
              </div>
              <div style={styles.timelineCard}>
                <div style={styles.timelineCardLabel}>Voting Ends</div>
                <div style={styles.timelineCardDate}>
                  {formatLocalDate(election.timeline?.votingEnd, true)}
                </div>
              </div>
            </div>
          </div>

          <div style={styles.modalSection}>
            <div style={styles.sectionTitle}><FiTarget size={16} /> Positions ({election.positions?.length || 0})</div>
            <div style={styles.positionsList}>
              {election.positions?.map((pos, idx) => (
                <div key={idx} style={styles.positionItem}>
                  <div style={styles.positionName}>{pos.positionName}</div>
                  <div style={styles.positionMeta}>
                    <span style={styles.positionType}>
                      {getElectionTypeIcon(pos.electionType)} {pos.electionType === 'ranked' ? 'Ranked Voting' : pos.electionType === 'multiple_winners' ? `${pos.totalSeats} Winners` : 'Single Winner'}
                    </span>
                    <span><FiAward size={12} /> {pos.totalSeats} Seat{pos.totalSeats > 1 ? 's' : ''}</span>
                  </div>
                  <div style={styles.positionDesc}>{pos.positionDescription}</div>
                </div>
              ))}
            </div>
          </div>

          
          <div style={styles.modalSection}>
            <div style={styles.sectionTitle}><FiLock size={16} /> Voting Rules</div>
            <div style={styles.rulesGrid}>
              <div style={styles.ruleChip}><FiCheckCircle size={14} /> One vote per position</div>
              <div style={styles.ruleChip}>{election.votingRules?.requireAllPositions ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />} {election.votingRules?.requireAllPositions ? 'Must vote for all positions' : 'Optional positions'}</div>
            </div>
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button 
            style={styles.closeModalBtn}
            onClick={onClose}
          >
            Close
          </button>
          {election.status === 'voting_open' && (
            <button 
              style={styles.voteFromModalBtn}
              onClick={() => {
                onClose();
                const voteEvent = new CustomEvent('startVoting', { detail: election });
                window.dispatchEvent(voteEvent);
              }}
            >
              <FiShield size={16} /> Verify & Vote Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectionDetailModal;