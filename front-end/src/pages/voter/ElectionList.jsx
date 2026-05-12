
// pages/voter/ElectionList.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllElections } from '../../Js/election-slice';
import { batchCheckRegistration } from '../../Js/voterRegistration-slice';
import { batchCheckNomination } from '../../Js/nomination-slice';
import ElectionCard from '../../components/common/ElectionCard';
import ElectionDetailModal from '../../components/common/ElectionDetailModal';
import RegistrationModal from '../../components/common/RegistrationModal';
import { 
  FiFilter, FiChevronDown, FiSearch, FiCalendar, 
  FiClock, FiCheckCircle, FiAward, FiUsers 
} from 'react-icons/fi';

const ElectionList = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { elections, loading } = useSelector(state => state.election);
  const { user } = useSelector(state => state.auth || { user: null });
  
  const [selectedElection, setSelectedElection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [nominationStatus, setNominationStatus] = useState({});
  const [statusesLoaded, setStatusesLoaded] = useState(false);

  // 1. Fetch all elections
  useEffect(() => {
    dispatch(fetchAllElections());
  }, [dispatch]);

  // 2. Batch fetch registration and nomination statuses (2 API calls total!)
  useEffect(() => {
    if (elections && elections.length > 0 && user && !statusesLoaded) {
      const electionIds = elections.map(e => e._id);
      
      // Batch check registration for all elections (1 API call)
      dispatch(batchCheckRegistration(electionIds)).then((result) => {
        if (result.payload) {
          setRegistrationStatus(result.payload);
        }
      });
      
      // Batch check nomination for all elections (1 API call)
      dispatch(batchCheckNomination(electionIds)).then((result) => {
        if (result.payload) {
          setNominationStatus(result.payload);
        }
      });
      
      setStatusesLoaded(true);
    }
  }, [elections, user, dispatch, statusesLoaded]);

  // Sort elections by createdAt (most recent first)
  const sortedElections = useMemo(() => {
    if (!elections) return [];
    return [...elections].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  }, [elections]);

  // Filter elections
  const filteredElections = useMemo(() => {
    let filtered = sortedElections;
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(e => e.status === statusFilter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.title?.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.electionId?.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [sortedElections, statusFilter, searchQuery]);

  const handleViewDetails = (election) => {
    setSelectedElection(election);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedElection(null);
  };

  const handleOpenRegisterModal = (election) => {
    setSelectedElection(election);
    setIsRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
    setSelectedElection(null);
    // Refresh registration status for this election only
    if (selectedElection) {
      dispatch(batchCheckRegistration([selectedElection._id])).then((result) => {
        if (result.payload && result.payload[selectedElection._id]) {
          setRegistrationStatus(prev => ({
            ...prev,
            [selectedElection._id]: result.payload[selectedElection._id]
          }));
        }
      });
    }
  };

  const handleAction = (election) => {
    const status = election.status;
    const regStatus = registrationStatus[election._id];
    const nomStatus = nominationStatus[election._id];
    const isRegistered = regStatus?.isRegistered || false;
    const hasNomination = nomStatus?.hasNomination || false;
    const nominationStatusText = nomStatus?.status;

    if (status === 'registration_open') {
      if (isRegistered) {
        alert('You have already registered for this election. Please check your email for credentials.');
        return;
      }
      handleOpenRegisterModal(election);
      return;
    }

    if (status === 'nomination_open') {
      if (hasNomination) {
        const statusMsg = nominationStatusText === 'pending' ? 'pending review' : nominationStatusText;
        alert(`You have already submitted a nomination for this election. Status: ${statusMsg}`);
        return;
      }
      navigate(`/${user.role}/submit-nomination`, { state: { preselectedElection: election } });
      return;
    }

    if (status === 'voting_open') {
      if (!isRegistered) {
        alert('You must register for this election before voting. Registration is now closed.');
        return;
      }
      const isVerified = sessionStorage.getItem(`verified_${election._id}`);
      if (isVerified === 'true') {
        navigate(`/voter/cast/${election._id}`, { state: { election } });
      } else {
        navigate(`/voter/verify/${election._id}`, { state: { election } });
      }
      return;
    }

    if (status === 'results_published' || status === 'completed') {
      navigate(`/${user?.role}/results/${election._id}`, { state: { election } });
      return;
    }

    alert('This election is not yet open for any action.');
  };

  const getButtonConfig = (election) => {
    const status = election.status;
    const regStatus = registrationStatus[election._id];
    const nomStatus = nominationStatus[election._id];
    const isRegistered = regStatus?.isRegistered || false;
    const hasNomination = nomStatus?.hasNomination || false;
    const nominationStatusText = nomStatus?.status;

    const configs = {
      registration_open: {
        text: isRegistered ? '✓ Registered' : 'Register Now',
        disabled: isRegistered,
        color: isRegistered ? '#10b981' : '#D23A01',
        message: isRegistered ? 'Already registered' : ''
      },
      nomination_open: {
        text: hasNomination ? `Nomination ${nominationStatusText === 'pending' ? 'Pending' : 'Submitted'}` : 'Submit Nomination',
        disabled: hasNomination,
        color: hasNomination ? '#f59e0b' : '#023430',
        message: hasNomination ? `Status: ${nominationStatusText}` : ''
      },
      voting_open: {
        text: isRegistered ? 'Vote Now' : 'Registration Required',
        disabled: !isRegistered,
        color: isRegistered ? '#D23A01' : '#94a3b8',
        message: !isRegistered ? 'Registration required' : ''
      },
      results_published: {
        text: 'View Results',
        disabled: false,
        color: '#023430',
        message: ''
      },
      completed: {
        text: 'View Results',
        disabled: false,
        color: '#4b5563',
        message: ''
      },
      draft: {
        text: 'Coming Soon',
        disabled: true,
        color: '#9ca3af',
        message: 'Not yet started'
      }
    };

    return configs[status] || configs.draft;
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'registration_open': return { text: 'Registration Open', bg: '#D23A0110', color: '#D23A01' };
      case 'nomination_open': return { text: 'Nomination Open', bg: '#02343010', color: '#023430' };
      case 'voting_open': return { text: 'Voting Open', bg: '#D23A0110', color: '#D23A01' };
      case 'results_published': return { text: 'Results Published', bg: '#02343010', color: '#023430' };
      case 'completed': return { text: 'Completed', bg: '#e5e7eb', color: '#4b5563' };
      default: return { text: 'Draft', bg: '#f1f5f9', color: '#6b7280' };
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Elections' },
    { value: 'registration_open', label: 'Registration Open' },
    { value: 'nomination_open', label: 'Nomination Open' },
    { value: 'voting_open', label: 'Voting Open' },
    { value: 'results_published', label: 'Results Published' },
    { value: 'completed', label: 'Completed' }
  ];

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loaderText}>Loading elections...</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>
            <FiAward size={32} style={styles.titleIcon} /> All Elections
          </h1>
          <p style={styles.subtitle}>Browse and participate in elections</p>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.statChip}>
            <FiCalendar size={14} />
            <span>{elections?.length || 0} Total Elections</span>
          </div>
          <div style={styles.statChip}>
            <FiUsers size={14} />
            <span>Active Participation</span>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <FiSearch size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search elections by title, description, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.filterGroup}>
          <FiFilter size={16} style={styles.filterIconLabel} />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <FiChevronDown size={14} style={styles.selectIcon} />
        </div>
      </div>

      {/* Results Summary */}
      <div style={styles.resultsSummary}>
        <span style={styles.resultsCount}>
          Showing <strong>{filteredElections.length}</strong> of <strong>{sortedElections.length}</strong> elections
        </span>
        {searchQuery && (
          <button style={styles.clearSearch} onClick={() => setSearchQuery('')}>
            Clear search ×
          </button>
        )}
      </div>

      {/* Elections Grid */}
      {filteredElections.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}></div>
          <h3 style={styles.emptyTitle}>No Elections Found</h3>
          <p style={styles.emptyText}>No elections match your search criteria.</p>
          {(searchQuery || statusFilter !== 'all') && (
            <button style={styles.resetBtn} onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div style={styles.electionsGrid}>
          {filteredElections.map((election) => {
            const buttonConfig = getButtonConfig(election);
            return (
              <ElectionCard 
                key={election._id}
                election={election}
                onViewDetails={handleViewDetails}
                onAction={handleAction}
                buttonConfig={buttonConfig}
                registrationStatus={registrationStatus[election._id]}
                nominationStatus={nominationStatus[election._id]}
              />
            );
          })}
        </div>
      )}

      <ElectionDetailModal 
        election={selectedElection}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      <RegistrationModal 
        election={selectedElection}
        isOpen={isRegisterModalOpen}
        onClose={handleCloseRegisterModal}
      />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: 'clamp(20px, 4vw, 32px)',
    marginTop: 'clamp(40px, 10vh, 70px)',
    minHeight: '100vh',
    background: '#f8fafc'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'clamp(24px, 5vw, 32px)',
    flexWrap: 'wrap',
    gap: '20px'
  },
  headerLeft: {
    flex: 1
  },
  title: {
    fontSize: 'clamp(28px, 6vw, 36px)',
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
    fontSize: 'clamp(14px, 3vw, 16px)',
    color: '#4b5563',
    
  },
  headerStats: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  statChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'white',
    borderRadius: '40px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#1a1a1a',
    border: '1px solid #e5e7eb',
    
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  searchWrapper: {
    position: 'relative',
    flex: 1,
    maxWidth: '400px',
    width: '100%'
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#000000'
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 44px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s',
    background: 'white'
  },
  filterGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'white',
    padding: '10px 18px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  filterIconLabel: {
    color: '#000000'
  },
  filterSelect: {
    border: 'none',
    background: 'transparent',
    padding: '4px',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '160px',
    appearance: 'none',
    paddingRight: '24px',
    color: '#1a1a1a'
  },
  selectIcon: {
    position: 'absolute',
    right: '16px',
    pointerEvents: 'none',
    color: '#000000'
  },
  resultsSummary: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  resultsCount: {
    fontSize: '13px',
    color: '#4b5563',
    
  },
  clearSearch: {
    background: 'none',
    border: 'none',
    color: '#D23A01',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    
  },
  electionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '24px'
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
    color: '#0d0d0f',
    
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #D23A01',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  emptyState: {
    textAlign: 'center',
    padding: 'clamp(40px, 8vw, 60px)',
    background: 'white',
    borderRadius: '20px',
    border: '1px solid #e5e7eb'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
    
  },
  emptyText: {
    fontSize: '14px',
    color: '#090a0c',
    
  },
  resetBtn: {
    marginTop: '20px',
    padding: '10px 24px',
    background: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    
  }
};

// Responsive media queries
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @media (max-width: 768px) {
    .elections-grid {
      gridTemplateColumns: 1fr !important;
    }
    
    .search-wrapper {
      max-width: 100% !important;
    }
    
    .filter-group {
      width: 100% !important;
    }
    
    .select-wrapper {
      width: 100% !important;
    }
    
    .header-stats {
      width: 100% !important;
    }
  }
  
  @media (max-width: 640px) {
    .filter-bar {
      flex-direction: column !important;
    }
    
    .search-wrapper {
      max-width: 100% !important;
    }
    
    .filter-group {
      width: 100% !important;
    }
  }
  
  input:focus {
    border-color: #D23A01 !important;
    box-shadow: 0 0 0 3px rgba(210, 58, 1, 0.1);
  }
  
  select:focus {
    border-color: #D23A01 !important;
  }
`;
if (!document.head.querySelector('#election-list-styles')) {
  styleSheet.id = 'election-list-styles';
  document.head.appendChild(styleSheet);
}

export default ElectionList;





