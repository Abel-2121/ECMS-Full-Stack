// pages/voter/VoterStatus.jsx
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, FiActivity, FiCheckCircle, FiClock, FiShield, 
  FiAlertTriangle, FiCalendar, FiFileText, FiEye, FiAward,
  FiRefreshCw, FiMail, FiPhone, FiMapPin, FiHash, FiStar,
  FiBarChart2, FiSend
} from 'react-icons/fi';
import { voteService } from '../../services/voteService';
import { electionService } from '../../services/electionService';

const VoterStatus = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [votes, setVotes] = useState([]);
  const [eligibleElections, setEligibleElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadVoterData();
  }, []);

  const loadVoterData = async () => {
    setLoading(true);
    try {
      const myVotes = await voteService.getMyVotes();
      setVotes(myVotes || []);
      const allElections = await electionService.getAllElections();
      const eligible = allElections.filter(election => 
        election.status === 'voting_open' && 
        !(myVotes || []).some(vote => vote.electionId?._id === election._id)
      );
      setEligibleElections(eligible);
    } catch (error) {
      console.error('Error loading voter data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadVoterData();
    setTimeout(() => setRefreshing(false), 500);
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRelativeTime = (date) => {
    const now = new Date();
    const voteDate = new Date(date);
    const diffDays = Math.floor((now - voteDate) / 86400000);
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return formatDate(date);
  };

  const getElectionStatusBadge = (status) => {
    switch(status) {
      case 'results_published': return { label: 'Results Available', color: '#D23A01', bg: '#FEF3F0', icon: <FiAward size={12} /> };
      case 'completed': return { label: 'Completed', color: '#6b7280', bg: '#f3f4f6', icon: <FiCheckCircle size={12} /> };
      case 'voting_open': return { label: 'Voting Open', color: '#f59e0b', bg: '#fef3c7', icon: <FiActivity size={12} /> };
      default: return { label: status?.replace('_', ' ') || 'Unknown', color: '#94a3b8', bg: '#f1f5f9', icon: <FiClock size={12} /> };
    }
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loaderText}>Loading your voting status...</p>
      </div>
    );
  }

  const hasVoted = votes.length > 0;
  const hasEligibleElections = eligibleElections.length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <FiShield size={32} style={styles.titleIcon} /> My Voting Status
          </h1>
          <p style={styles.subtitle}>Track your voting participation and eligibility</p>
        </div>
        <button style={styles.refreshBtn} onClick={handleRefresh} disabled={refreshing}>
          <FiRefreshCw size={16} className={refreshing ? 'spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div style={styles.profileCard}>
        <div style={styles.avatar}>
          {user?.photo ? (
            <img src={user.photo} alt={user.firstName} style={styles.avatarImg} />
          ) : (
            <div style={styles.avatarPlaceholder}>{user?.firstName?.[0]}{user?.lastName?.[0]}</div>
          )}
        </div>
        <div style={styles.profileInfo}>
          <h2 style={styles.userName}>{user?.firstName} {user?.lastName}</h2>
          <div style={styles.userDetails}>
            <span><FiMail size={14} /> {user?.email}</span>
            {user?.phone && <span><FiPhone size={14} /> {user?.phone}</span>}
            <span><FiShield size={14} /> Role: {user?.role === 'user' ? 'Voter' : user?.role}</span>
          </div>
        </div>
        <div style={styles.statsBadge}>
          <div style={styles.statNumber}>{votes.length}</div>
          <div style={styles.statLabel}>Votes Cast</div>
        </div>
      </div>

      <div style={styles.contentGrid}>
        <div style={styles.historySection}>
          <div style={styles.sectionHeader}>
            <FiActivity size={20} style={styles.sectionIcon} />
            <h3 style={styles.sectionTitle}>Voting History</h3>
          </div>

          {!hasVoted ? (
            <div style={styles.emptyState}>
              <FiBarChart2 size={64} style={styles.emptyIcon} />
              <h4 style={styles.emptyTitle}>No Votes Cast Yet</h4>
              <p style={styles.emptyText}>You haven't participated in any elections yet.</p>
              {hasEligibleElections && (
                <button style={styles.voteNowBtn} onClick={() => navigate('/voter/elections')}>
                  <FiSend size={14} /> View Active Elections
                </button>
              )}
            </div>
          ) : (
            <div style={styles.votesList}>
              {votes.map((vote, index) => {
                const statusBadge = getElectionStatusBadge(vote.electionId?.status);
                return (
                  <div key={vote._id || index} style={styles.voteCard}>
                    <div style={styles.voteHeader}>
                      <div style={styles.voteIcon}>
                        <FiBarChart2 size={24} />
                      </div>
                      <div style={styles.voteInfo}>
                        <h4 style={styles.voteElectionTitle}>{vote.electionId?.title || 'Election'}</h4>
                        <div style={styles.voteMeta}>
                          <span><FiClock size={12} /> {formatRelativeTime(vote.castAt)}</span>
                          <span style={{ ...styles.voteStatus, background: statusBadge.bg, color: statusBadge.color }}>
                            {statusBadge.icon} {statusBadge.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={styles.voteDetails}>
                      <div><FiFileText size={14} /> Confirmation: <code style={styles.confirmationCode}>{vote.confirmationCode}</code></div>
                      <div><FiCalendar size={14} /> Cast on: {formatDate(vote.castAt)}</div>
                    </div>
                    <div style={styles.voteActions}>
                      <button style={styles.voteActionBtn}>
                        <FiEye size={14} /> View Receipt
                      </button>
                      {vote.electionId?.status === 'results_published' && (
                        <button style={styles.voteActionBtn}>
                          <FiAward size={14} /> View Results
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={styles.sidebar}>
          <div style={styles.infoCard}>
            <div style={styles.cardHeader}>
              <FiActivity size={18} style={styles.cardIcon} />
              <h4 style={styles.cardTitle}>Eligible Elections</h4>
            </div>
            {hasEligibleElections ? (
              <div style={styles.eligibleList}>
                {eligibleElections.slice(0, 3).map(election => (
                  <div key={election._id} style={styles.eligibleItem}>
                    <div>
                      <div style={styles.eligibleTitle}>{election.title}</div>
                      <div style={styles.eligibleDate}>Ends: {formatDate(election.timeline?.votingEnd)}</div>
                    </div>
                    <button style={styles.voteSmallBtn} onClick={() => navigate(`/voter/cast/${election._id}`)}>Vote Now</button>
                  </div>
                ))}
                {eligibleElections.length > 3 && (
                  <button style={styles.viewAllBtn} onClick={() => navigate('/voter/elections')}>
                    View {eligibleElections.length - 3} more →
                  </button>
                )}
              </div>
            ) : (
              <div style={styles.noEligible}>
                <p>No active elections available.</p>
              </div>
            )}
          </div>

          <div style={styles.securityCard}>
            <div style={styles.cardHeader}>
              <FiShield size={18} style={styles.cardIcon} />
              <h4 style={styles.cardTitle}>Security & Integrity</h4>
            </div>
            <div style={styles.securityItem}>
              <FiCheckCircle size={20} color="#10b981" />
              <div>
                <strong>Immutable Records</strong>
                <p>All votes are cryptographically signed.</p>
              </div>
            </div>
            <div style={styles.securityItem}>
              <FiShield size={20} color="#D23A01" />
              <div>
                <strong>Anonymous Voting</strong>
                <p>Votes cannot be traced back to you.</p>
              </div>
            </div>
            <div style={styles.securityItem}>
              <FiAlertTriangle size={20} color="#f59e0b" />
              <div>
                <strong>One Vote Per Election</strong>
                <p>Your vote is final once submitted.</p>
              </div>
            </div>
          </div>

          <div style={styles.statsCard}>
            <div style={styles.cardHeader}>
              <FiStar size={18} style={styles.cardIconAlt} />
              <h4 style={styles.cardTitle}>Quick Stats</h4>
            </div>
            <div style={styles.statRow}>
              <span>Total Votes Cast:</span>
              <strong>{votes.length}</strong>
            </div>
            <div style={styles.statRow}>
              <span>With Results:</span>
              <strong>{votes.filter(v => v.electionId?.status === 'results_published').length}</strong>
            </div>
            <div style={styles.statRow}>
              <span>Available to Vote:</span>
              <strong style={{ color: '#D23A01' }}>{eligibleElections.length}</strong>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }
        
        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr !important;
          }
          .profile-card {
            flex-direction: column;
            text-align: center;
          }
          .user-details {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: 'clamp(20px, 4vw, 32px)', 
    marginTop: 'clamp(60px, 10vh, 80px)', 
    background: '#f8fafc', 
    minHeight: '100vh' 
  },
  loaderContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '400px', 
    gap: '16px' 
  },
  loaderText: {
    fontSize: '15px',
    color: '#6b7280',
    
  },
  spinner: { 
    width: '50px', 
    height: '50px', 
    border: '3px solid #e5e7eb', 
    borderTop: '3px solid #D23A01', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 'clamp(24px, 5vw, 32px)', 
    flexWrap: 'wrap', 
    gap: '16px' 
  },
  title: { 
    fontSize: 'clamp(24px, 5vw, 28px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    marginBottom: '8px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px',
    
  },
  titleIcon: {
    color: '#D23A01'
  },
  subtitle: { 
    fontSize: 'clamp(14px, 3vw, 15px)', 
    color: '#4b5563',
    
  },
  refreshBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '10px 20px', 
    background: 'white', 
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: '600',
    
  },
  profileCard: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '24px', 
    background: 'white', 
    borderRadius: '24px', 
    padding: 'clamp(20px, 4vw, 28px)', 
    marginBottom: 'clamp(24px, 5vw, 32px)', 
    border: '1px solid #e5e7eb', 
    flexWrap: 'wrap' 
  },
  avatar: { 
    width: '80px', 
    height: '80px', 
    borderRadius: '50%', 
    overflow: 'hidden', 
    flexShrink: 0 
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarPlaceholder: { 
    width: '100%', 
    height: '100%', 
    background: 'linear-gradient(135deg, #D23A01, #b02e00)', 
    color: 'white', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: '32px', 
    fontWeight: '700' 
  },
  profileInfo: { 
    flex: 1 
  },
  userName: { 
    fontSize: 'clamp(20px, 4vw, 22px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    marginBottom: '8px',
    
  },
  userDetails: { 
    display: 'flex', 
    gap: '20px', 
    flexWrap: 'wrap', 
    fontSize: '13px', 
    color: '#4b5563' 
  },
  statsBadge: { 
    textAlign: 'center', 
    padding: '12px 24px', 
    background: '#FEF3F0', 
    borderRadius: '20px' 
  },
  statNumber: { 
    fontSize: 'clamp(28px, 5vw, 32px)', 
    fontWeight: '800', 
    color: '#D23A01',
    
  },
  statLabel: { 
    fontSize: '12px', 
    color: '#4b5563',
    
  },
  contentGrid: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 360px', 
    gap: 'clamp(24px, 4vw, 32px)' 
  },
  historySection: { 
    background: 'white', 
    borderRadius: '24px', 
    padding: 'clamp(20px, 4vw, 24px)', 
    border: '1px solid #e5e7eb' 
  },
  sectionHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    marginBottom: '20px', 
    paddingBottom: '12px', 
    borderBottom: '2px solid #e5e7eb' 
  },
  sectionIcon: {
    color: '#D23A01'
  },
  sectionTitle: { 
    fontSize: '18px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    margin: 0,
    
  },
  emptyState: { 
    textAlign: 'center', 
    padding: 'clamp(40px, 8vw, 60px) 20px' 
  },
  emptyIcon: { 
    color: '#9ca3af',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
    
  },
  emptyText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '20px',
    
  },
  voteNowBtn: { 
    marginTop: '20px', 
    padding: '12px 28px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: '700',
    fontSize: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    
  },
  votesList: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px' 
  },
  voteCard: { 
    border: '1px solid #e5e7eb', 
    borderRadius: '18px', 
    padding: '18px', 
    transition: 'box-shadow 0.2s' 
  },
  voteHeader: { 
    display: 'flex', 
    gap: '14px', 
    marginBottom: '16px' 
  },
  voteIcon: { 
    color: '#D23A01'
  },
  voteInfo: { 
    flex: 1 
  },
  voteElectionTitle: { 
    fontSize: '16px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    marginBottom: '6px',
    
  },
  voteMeta: { 
    display: 'flex', 
    gap: '12px', 
    alignItems: 'center', 
    flexWrap: 'wrap' 
  },
  voteStatus: { 
    fontSize: '11px', 
    padding: '3px 10px', 
    borderRadius: '20px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '4px', 
    fontWeight: '600' 
  },
  voteDetails: { 
    background: '#f8fafc', 
    borderRadius: '14px', 
    padding: '14px', 
    marginBottom: '16px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px', 
    fontSize: '13px' 
  },
  confirmationCode: { 
    background: '#e2e8f0', 
    padding: '2px 6px', 
    borderRadius: '6px', 
    fontSize: '12px', 
    marginLeft: '8px' 
  },
  voteActions: { 
    display: 'flex', 
    gap: '12px',
    flexWrap: 'wrap'
  },
  voteActionBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '8px 16px', 
    background: '#f1f5f9', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontSize: '12px', 
    fontWeight: '600',
    
  },
  sidebar: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: 'clamp(20px, 4vw, 24px)' 
  },
  infoCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: '20px', 
    border: '1px solid #e5e7eb' 
  },
  securityCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: '20px', 
    border: '1px solid #e5e7eb' 
  },
  statsCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: '20px', 
    border: '1px solid #e5e7eb' 
  },
  cardHeader: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    marginBottom: '16px', 
    paddingBottom: '12px', 
    borderBottom: '1px solid #e5e7eb' 
  },
  cardIcon: {
    color: '#D23A01'
  },
  cardIconAlt: {
    color: '#023430'
  },
  cardTitle: { 
    fontSize: '16px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    margin: 0,
    
  },
  eligibleList: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px' 
  },
  eligibleItem: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '12px', 
    background: '#f8fafc', 
    borderRadius: '14px',
    gap: '12px'
  },
  eligibleTitle: { 
    fontSize: '14px', 
    fontWeight: '600', 
    color: '#1a1a1a' 
  },
  eligibleDate: { 
    fontSize: '11px', 
    color: '#6b7280', 
    marginTop: '4px' 
  },
  voteSmallBtn: { 
    padding: '6px 14px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '12px', 
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  viewAllBtn: { 
    marginTop: '12px', 
    padding: '8px', 
    background: 'none', 
    border: 'none', 
    color: '#D23A01', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: '600',
    width: '100%', 
    textAlign: 'center' 
  },
  noEligible: { 
    textAlign: 'center', 
    padding: '20px', 
    color: '#6b7280', 
    fontSize: '13px' 
  },
  securityItem: { 
    display: 'flex', 
    gap: '14px', 
    marginBottom: '16px' 
  },
  statRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    padding: '10px 0', 
    borderBottom: '1px solid #e5e7eb', 
    fontSize: '13px',
    
  }
};

export default VoterStatus;