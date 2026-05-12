import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchMyNominations, 
  withdrawNomination, 
  requestAppeal,
  clearError 
} from '../../Js/nomination-slice';
import { fetchAllElections } from '../../Js/election-slice';
import { 
  FiEye, FiFileText, FiClock, FiCheckCircle, 
  FiXCircle, FiMessageCircle, FiCalendar,
  FiFlag, FiFilter, FiRefreshCw, FiBarChart2,
  FiUser, FiAward, FiHome, FiAlertCircle, FiSend,
  FiInbox, FiStar, FiTrendingUp
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001';

// Helper function to get campaign photo URL
const getCampaignPhotoUrl = (campaignPhotoPath) => {
  if (!campaignPhotoPath) return null;
  
  if (campaignPhotoPath.startsWith('http://') || campaignPhotoPath.startsWith('https://')) {
    return campaignPhotoPath;
  }
  
  const normalizedPath = campaignPhotoPath.replace(/\\/g, '/');
  let cleanPath = normalizedPath;
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath;
  } else if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  return `${API_BASE_URL}/${cleanPath}`;
};

const MyNominations = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { elections, loading: electionsLoading } = useSelector(state => state.election);
  const { nominations, loading, error } = useSelector(state => state.nomination);
  const { user } = useSelector(state => state.auth);
  
  const [selectedNomination, setSelectedNomination] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealMessage, setAppealMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedElectionId, setSelectedElectionId] = useState('all');

  useEffect(() => {
    dispatch(fetchAllElections());
    dispatch(fetchMyNominations());
  }, [dispatch]);

  useEffect(() => {
    if (elections.length > 0 && selectedElectionId === 'all') {
      const sortedElections = [...elections].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      if (sortedElections[0]) {
        setSelectedElectionId(sortedElections[0]._id);
      }
    }
  }, [elections]);

  const handleWithdraw = async (id) => {
    if (window.confirm('Are you sure you want to withdraw this nomination? This action cannot be undone.')) {
      try {
        await dispatch(withdrawNomination(id)).unwrap();
        dispatch(fetchMyNominations());
        setShowDetailModal(false);
        alert('Nomination withdrawn successfully');
      } catch (err) {
        alert(err.message || 'Failed to withdraw nomination');
      }
    }
  };

  const handleDetail = (nom) => {
    navigate(`/${user.role}/my-nominations/${nom?._id}`);
  };

  const handleAppealSubmit = async () => {
    if (!appealMessage.trim()) {
      alert('Please provide an appeal message');
      return;
    }
    try {
      await dispatch(requestAppeal({ id: selectedNomination._id, appealMessage })).unwrap();
      setShowAppealModal(false);
      setAppealMessage('');
      dispatch(fetchMyNominations());
      alert('Appeal submitted successfully');
    } catch (err) {
      alert(err.message || 'Failed to submit appeal');
    }
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'pending': 
        return { bg: '#D23A0110', color: '#D23A01', icon: <FiClock size={14} />, text: 'PENDING' };
      case 'approved': 
        return { bg: '#10b98120', color: '#10b981', icon: <FiCheckCircle size={14} />, text: 'APPROVED' };
      case 'rejected': 
        return { bg: '#fee2e2', color: '#dc2626', icon: <FiXCircle size={14} />, text: 'REJECTED' };
      case 'withdrawn':
        return { bg: '#f1f5f9', color: '#6b7280', icon: <FiXCircle size={14} />, text: 'WITHDRAWN' };
      case 'elected':
        return { bg: '#ede9fe', color: '#6d28d9', icon: <FiStar size={14} />, text: 'ELECTED' };
      default: 
        return { bg: '#f1f5f9', color: '#6b7280', icon: <FiClock size={14} />, text: status?.toUpperCase() || 'UNKNOWN' };
    }
  };

  const formatLocalDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...(includeTime && { hour: '2-digit', minute: '2-digit', hour12: true })
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  const filteredNominations = nominations.filter(nom => {
    const matchesElection = selectedElectionId === 'all' || nom.electionId?._id === selectedElectionId || nom.electionId === selectedElectionId;
    const matchesStatus = statusFilter === 'all' || nom.status === statusFilter;
    return matchesElection && matchesStatus;
  });

  const dashboardStats = {
    total: filteredNominations.length,
    pending: filteredNominations.filter(n => n.status === 'pending').length,
    approved: filteredNominations.filter(n => n.status === 'approved' || n.status === 'elected').length,
    rejected: filteredNominations.filter(n => n.status === 'rejected').length,
    withdrawn: filteredNominations.filter(n => n.status === 'withdrawn').length
  };

  const getSelectedElectionTitle = () => {
    if (selectedElectionId === 'all') return 'All Elections';
    const election = elections.find(e => e._id === selectedElectionId);
    return election?.title || 'Select Election';
  };

  // Get campaign photo or initials for display
  const renderCandidateAvatar = (nomination) => {
    const campaignPhotoUrl = getCampaignPhotoUrl(nomination.campaignPhoto);
    const positionFirstLetter = nomination.positionName?.charAt(0) || 'P';
    
    if (campaignPhotoUrl) {
      return (
        <img 
          src={campaignPhotoUrl}
          alt={nomination.positionName}
          style={styles.candidateAvatarImg}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = positionFirstLetter;
          }}
        />
      );
    }
    
    return positionFirstLetter;
  };

  if (loading && nominations.length === 0) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loaderText}>Loading your nominations...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <FiAward size={28} style={styles.titleIcon} /> My Nominations
          </h1>
          <p style={styles.subtitle}>Track and manage your nomination applications</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#D23A0110', color: '#D23A01' }}>
            <FiBarChart2 size={24} />
          </div>
          <div>
            <div style={styles.statValue}>{dashboardStats.total}</div>
            <div style={styles.statLabel}>Total Nominations</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#fef3c7', color: '#f59e0b' }}>
            <FiClock size={24} />
          </div>
          <div>
            <div style={{ ...styles.statValue, color: '#f59e0b' }}>{dashboardStats.pending}</div>
            <div style={styles.statLabel}>Pending Review</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#10b98120', color: '#10b981' }}>
            <FiCheckCircle size={24} />
          </div>
          <div>
            <div style={{ ...styles.statValue, color: '#10b981' }}>{dashboardStats.approved}</div>
            <div style={styles.statLabel}>Approved / Elected</div>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: '#fee2e2', color: '#dc2626' }}>
            <FiXCircle size={24} />
          </div>
          <div>
            <div style={{ ...styles.statValue, color: '#dc2626' }}>{dashboardStats.rejected}</div>
            <div style={styles.statLabel}>Rejected</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <FiFlag size={16} color="#D23A01" />
          <select 
            value={selectedElectionId} 
            onChange={(e) => setSelectedElectionId(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Elections</option>
            {elections.map(election => (
              <option key={election._id} value={election._id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <FiFilter size={16} color="#D23A01" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>
        </div>

        <button style={styles.refreshBtn} onClick={() => dispatch(fetchMyNominations())}>
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Selected Election Display */}
      <div style={styles.selectedElectionInfo}>
        <span style={styles.selectedElectionLabel}>Showing:</span>
        <span style={styles.selectedElectionValue}>{getSelectedElectionTitle()}</span>
        {selectedElectionId !== 'all' && (
          <button 
            style={styles.clearFilterBtn}
            onClick={() => setSelectedElectionId('all')}
          >
            Clear
          </button>
        )}
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <FiAlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => dispatch(clearError())} style={styles.errorClose}>×</button>
        </div>
      )}

      {filteredNominations.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            <FiInbox size={48} color="#9ca3af" />
          </div>
          <p style={styles.emptyText}>No nominations found for {getSelectedElectionTitle()}</p>
          {nominations.length === 0 && (
            <button 
              style={styles.submitBtn} 
              onClick={() => navigate(`/${user.role}/submit-nomination`)}
            >
              <FiSend size={14} /> Submit Your First Nomination
            </button>
          )}
        </div>
      ) : (
        <div style={styles.cardsGrid}>
          {filteredNominations.map(nom => {
            const statusStyle = getStatusConfig(nom.status);
            return (
              <div 
                key={nom._id}
                style={styles.nominationCard}
              >
                <div style={{ ...styles.cardStatusBadge, background: statusStyle.bg, color: statusStyle.color }}>
                  {statusStyle.icon} {statusStyle.text}
                </div>
                
                <div style={styles.cardContent}>
                  <div style={styles.candidateAvatar}>
                    {renderCandidateAvatar(nom)}
                  </div>
                  
                  <div style={styles.candidateDetails}>
                    <h3 style={styles.candidateName}>{nom.positionName}</h3>
                    <div style={styles.electionBadge}>{nom.electionId?.title || 'Election'}</div>
                    <div style={styles.candidateMeta}>
                      <span><FiCalendar size={12} /> Submitted: {formatLocalDate(nom.submittedAt, false)}</span>
                      <span><FiFileText size={12} /> ID: {nom.nominationId || nom._id.slice(-8)}</span>
                    </div>
                  </div>
                </div>
                
                <div style={styles.cardFooter}>
                  <button 
                    style={styles.viewDetailsBtn}
                    onClick={() => handleDetail(nom)}
                  >
                    <FiEye size={14} /> View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: 'clamp(20px, 4vw, 32px)',
    maxWidth: '1200px',
    margin: '0 auto',
    marginTop: 'clamp(60px, 10vh, 80px)',
    background: '#f8fafc',
    minHeight: '100vh'
  },
  header: { 
    marginBottom: 'clamp(28px, 5vw, 36px)' 
  },
  title: { 
    fontSize: 'clamp(26px, 5vw, 32px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  titleIcon: {
    color: '#D23A01'
  },
  subtitle: { 
    fontSize: 'clamp(14px, 3vw, 16px)', 
    color: '#000000'
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 'clamp(16px, 3vw, 20px)',
    marginBottom: 'clamp(24px, 5vw, 32px)'
  },
  statCard: {
    background: 'white',
    borderRadius: '20px',
    padding: 'clamp(16px, 3vw, 20px)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  statIcon: { 
    width: '52px',
    height: '52px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: { 
    fontSize: 'clamp(26px, 5vw, 32px)', 
    fontWeight: '800', 
    color: '#1a1a1a'
  },
  statLabel: { 
    fontSize: '12px', 
    color: '#000000', 
    marginTop: '4px',
    fontWeight: '500'
  },
  
  filterBar: { 
    display: 'flex', 
    gap: '12px', 
    marginBottom: '16px', 
    flexWrap: 'wrap', 
    alignItems: 'center' 
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'white',
    padding: '10px 16px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  filterSelect: { 
    border: 'none', 
    background: 'transparent', 
    padding: '4px', 
    fontSize: '14px', 
    fontWeight: '500',
    outline: 'none', 
    cursor: 'pointer', 
    minWidth: '180px',
    color: '#1a1a1a'
  },
  refreshBtn: { 
    padding: '10px 20px', 
    background: '#f1f5f9', 
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: '600', 
    color: '#4b5563', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px',
    transition: 'all 0.2s'
  },
  
  selectedElectionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    padding: '10px 16px',
    background: '#D23A0110',
    borderRadius: '12px',
    fontSize: '13px',
    flexWrap: 'wrap'
  },
  selectedElectionLabel: { 
    fontWeight: '600', 
    color: '#000000'
  },
  selectedElectionValue: { 
    fontWeight: '700', 
    color: '#D23A01'
  },
  clearFilterBtn: { 
    padding: '4px 12px', 
    background: 'white', 
    border: '1px solid #e5e7eb', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '11px', 
    fontWeight: '600',
    color: '#D23A01'
  },
  
  errorBanner: { 
    background: '#fee2e2', 
    color: '#dc2626', 
    padding: '12px 16px', 
    borderRadius: '12px', 
    marginBottom: '20px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px',
    fontSize: '13px'
  },
  errorClose: { 
    background: 'none', 
    border: 'none', 
    fontSize: '20px', 
    cursor: 'pointer', 
    color: '#dc2626', 
    marginLeft: 'auto' 
  },
  
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
    marginBottom: '24px'
  },
  
  nominationCard: {
    position: 'relative',
    background: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    minHeight: '280px'
  },
  
  cardStatusBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: '700',
    zIndex: 1
  },
  
  cardContent: {
    padding: 'clamp(20px, 4vw, 24px)',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginTop:'4vh'
  },
  
  candidateAvatar: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #D23A01, #b02e00)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '700',
    flexShrink: 0
  },
  candidateAvatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  
  candidateDetails: {
    flex: 1,
    minWidth: 0
  },
  
  candidateName: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '8px'
  },
  
  electionBadge: {
    display: 'inline-block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#D23A01',
    background: '#D23A0110',
    padding: '4px 12px',
    borderRadius: '20px',
    marginBottom: '12px'
  },
  
  candidateMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    fontSize: '12px',
    color: '#040507'
  },
  
  cardFooter: {
    padding: '16px 24px 24px 24px',
    borderTop: '1px solid #e5e7eb',
    background: '#ffffff'
  },
  
  viewDetailsBtn: {
    width: '100%',
    padding: '12px',
    background: '#f8fafc',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    color: '#080a0c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  
  emptyState: { 
    textAlign: 'center', 
    padding: 'clamp(40px, 8vw, 60px)', 
    color: '#9ca3af', 
    background: 'white', 
    borderRadius: '20px',
    border: '1px solid #e5e7eb'
  },
  emptyIcon: { 
    marginBottom: '16px' 
  },
  emptyText: {
    fontSize: '14px',
    color: '#090a0e'
  },
  submitBtn: { 
    marginTop: '20px', 
    padding: '12px 28px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  loaderContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '60vh', 
    gap: '20px' 
  },
  loaderText: {
    fontSize: '15px',
    color: '#000000'
  },
  spinner: { 
    width: '50px', 
    height: '50px', 
    border: '3px solid #e5e7eb', 
    borderTop: '3px solid #D23A01', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  }
};

// Add keyframes for spinner and hover effects
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .cards-grid {
      grid-template-columns: 1fr !important;
    }
    .stats-grid {
      grid-templateColumns: repeat(auto-fit, minmax(180px, 1fr)) !important;
    }
  }
  
  button:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(210, 58, 1, 0.15);
  }
  
  .view-details-btn:hover {
    background: #D23A01;
    color: white;
    border-color: #D23A01;
  }
  
  .nomination-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  }
`;
if (!document.head.querySelector('#my-nominations-styles')) {
  styleSheet.id = 'my-nominations-styles';
  document.head.appendChild(styleSheet);
}

export default MyNominations;