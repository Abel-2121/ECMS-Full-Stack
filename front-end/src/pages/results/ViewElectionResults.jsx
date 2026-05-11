// pages/results/ViewElectionResults.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicResults, clearResults } from '../../Js/results-slice';
import { fetchAllElections } from '../../Js/election-slice';
import { 
  FiDownload, FiPrinter, FiShare2, FiCalendar, FiUsers, 
  FiCheckCircle, FiAward, FiBarChart2, FiStar,  
  FiUserCheck, FiAlertCircle, FiLoader, FiEye, FiTrendingUp,
  FiFileText, FiClock, FiTrash2
} from 'react-icons/fi';
import PositionResultsTable from '../../components/results/PositionResultsTable';
import WinnerCard from '../../components/results/WinnerCard';
import ErrorModal from '../../components/ErrorModal';
import { resultService } from '../../services/resultsService';
import { MdMargin } from 'react-icons/md';

const ViewElectionResults = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentResults, loading, error } = useSelector(state => state.results);
  const { user } = useSelector(state => state.auth);
  const { elections, loading: electionsLoading } = useSelector(state => state.election);
  const [selectedElection, setSelectedElection] = useState(electionId || '');
  const [isPrinting, setIsPrinting] = useState(false);
  const [electionsFetched, setElectionsFetched] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  // Filter published elections
  const publishedElections = useMemo(() => {
    if (!elections) return [];
    return elections.filter(e => e.status === 'results_published');
  }, [elections]);

  // Check if user can delete (admin or superAdmin)
  const canDelete = useMemo(() => {
    return user?.role === 'electionAdmin';
  }, [user]);

  // Fetch elections on mount
  useEffect(() => {
    if (!electionsFetched) {
      dispatch(fetchAllElections()).then(() => {
        setElectionsFetched(true);
      });
    }
    
    return () => {
      dispatch(clearResults());
    };
  }, [dispatch, electionsFetched]);

  // Fetch results when electionId changes (from URL param)
  useEffect(() => {
    if (electionId) {
      console.log('🔍 Fetching results for election ID:', electionId);
      dispatch(fetchPublicResults(electionId));
    }
  }, [dispatch, electionId]);

  // Auto-select first published election ONLY ONCE when elections load
  useEffect(() => {
    if (electionsFetched && publishedElections.length > 0 && !electionId && !initialized) {
      const firstElection = publishedElections[0];
      console.log('🔄 Auto-selecting first published election:', firstElection.title);
      setSelectedElection(firstElection._id);
      setInitialized(true);
      
      const rolePath = user?.role === 'superAdmin' ? 'superAdmin' : 
                       user?.role === 'electionAdmin' ? 'electionAdmin' : 
                       user?.role === 'candidate' ? 'candidate' : 'voter';
      navigate(`/${rolePath}/results/${firstElection._id}`, { replace: true });
    }
  }, [electionsFetched, publishedElections, electionId, initialized, user, navigate]);

  // Sync selectedElection with URL param when it changes
  useEffect(() => {
    if (electionId && electionId !== selectedElection) {
      setSelectedElection(electionId);
    }
  }, [electionId, selectedElection]);

  // Show error modal when error occurs
  useEffect(() => {
    if (error) {
      setErrorModal({ isOpen: true, message: error });
    }
  }, [error]);

  const handleElectionChange = (id) => {
    if (id && id !== electionId) {
      const rolePath = user?.role === 'superAdmin' ? 'superAdmin' : 
                       user?.role === 'electionAdmin' ? 'electionAdmin' : 
                       user?.role === 'candidate' ? 'candidate' : 'voter';
      navigate(`/${rolePath}/results/${id}`);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => { window.print(); setIsPrinting(false); }, 100);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await resultService.deleteResult(electionId);
      setShowDeleteModal(false);
      // Refresh the page or redirect
      const rolePath = user?.role === 'superAdmin' ? 'superAdmin' : 
                       user?.role === 'electionAdmin' ? 'electionAdmin' : 'voter';
      navigate(`/${rolePath}/results`);
      window.location.reload();
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete results';
      setErrorModal({ isOpen: true, message: errorMsg });
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
    }
  };

  // Sort winners by vote count (highest first)
  const sortedWinners = useMemo(() => {
    if (!currentResults?.results) return [];
    
    const winners = [];
    currentResults.results.forEach(position => {
      const positionWinners = position.candidates
        .filter(c => c.winner === true || c.isWinner === true)
        .map((winner, idx) => ({
          ...winner,
          positionName: position.positionName,
          rank: winner.rank || idx + 1,
          electedRole: winner.electedRole,
          votes: winner.votes || 0
        }));
      
      positionWinners.sort((a, b) => b.votes - a.votes);
      winners.push(...positionWinners);
    });
    
    winners.sort((a, b) => b.votes - a.votes);
    return winners;
  }, [currentResults]);

  const turnoutRate = currentResults?.summary?.turnoutPercentage || 0;
  const getTurnoutColor = () => {
    if (turnoutRate >= 70) return '#10b981';
    if (turnoutRate >= 50) return '#f59e0b';
    return '#ef4444';
  };

  if (electionsLoading && !electionsFetched) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loaderText}>Loading elections...</p>
      </div>
    );
  }

  if (publishedElections.length === 0 && electionsFetched) {
    return (
      <div style={styles.notPublishedContainer}>
        <div style={styles.notPublishedIcon}>
          <FiBarChart2 size={64} />
        </div>
        <h2 style={styles.notPublishedTitle}>No Results Available</h2>
        <p style={styles.notPublishedText}>There are no published election results at this time.</p>
        <button style={styles.backBtn} onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  if (electionId && loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loaderText}>Loading election results...</p>
      </div>
    );
  }

  if (electionId && (error || (currentResults && !currentResults.isPublished))) {
    const message = currentResults?.message || error || 'Results not available for this election';
    return (
      <div style={styles.notPublishedContainer}>
        <div style={styles.notPublishedIcon}>
          <FiBarChart2 size={64} />
        </div>
        <h2 style={styles.notPublishedTitle}>Results Not Available</h2>
        <p style={styles.notPublishedText}>{message}</p>
        {publishedElections.length > 0 && (
          <select 
            value={selectedElection} 
            onChange={(e) => handleElectionChange(e.target.value)} 
            style={{...styles.selector, maxWidth: '300px', margin: '0 auto 20px'}}
          >
            <option value="">-- Select another election --</option>
            {publishedElections.map(election => (
              <option key={election._id} value={election._id}>
                {election.title}
              </option>
            ))}
          </select>
        )}
        <button style={styles.backBtn} onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Error Modal */}
      <ErrorModal 
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="Error"
        icon="error"
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ ...styles.modalTitle, color: '#dc2626' }}>
                <FiAlertCircle size={20} style={{ marginRight: '8px' }} /> Delete Results
              </h3>
              <button style={styles.modalClose} onClick={() => setShowDeleteModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.deleteIconWrapper}>
                <FiTrash2 size={48} color="#dc2626" />
              </div>
              <p style={styles.deleteMessage}>
                Are you sure you want to delete the results for <strong>{currentResults?.electionTitle}</strong>?
              </p>
              <p style={styles.deleteWarning}>
                ⚠️ This action cannot be undone. Results can only be deleted after 5 days of publication.
              </p>
            </div>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button style={styles.confirmDeleteBtn} onClick={handleDelete} disabled={deleting}>
                {deleting ? <FiLoader size={16} className="spin" /> : <FiTrash2 size={16} />}
                {deleting ? 'Deleting...' : 'Delete Results'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <FiAward size={32} style={styles.titleIcon} /> Election Results
          </h1>
          <p style={styles.subtitle}>Official election results and vote breakdown</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.actionBtn} onClick={handlePrint}>
            <FiPrinter size={16} /> Print
          </button>
          {canDelete && currentResults?.isPublished &&  (
            <button 
              style={{...styles.actionBtn, backgroundColor: '#fee2e2', color: '#dc2626', borderColor: '#fecaca'}}
              onClick={() => setShowDeleteModal(true)}
            >
              <FiTrash2 size={16} /> Delete Results
            </button>
          )}
        </div>
      </div>

      {/* Election Selector */}
      {publishedElections.length > 0 && (
        <div style={styles.selectorCard}>
          <label style={styles.selectorLabel}>
            <FiCalendar size={14} style={{ marginRight: '8px' }} />
            Select Election
          </label>
          <select 
            value={selectedElection} 
            onChange={(e) => handleElectionChange(e.target.value)} 
            style={styles.selector}
          >
            {publishedElections.map(election => (
              <option key={election._id} value={election._id}>
                {election.title} - {new Date(election.createdAt).toLocaleDateString()}
              </option>
            ))}
          </select>
          <p style={styles.selectorHint}>
            Showing {publishedElections.length} election{publishedElections.length !== 1 ? 's' : ''} with published results
          </p>
        </div>
      )}

      {/* Results Content */}
      {currentResults && currentResults.isPublished && (
        <>
          {/* Hero Section */}
          <div style={styles.heroSection}>
            <div>
              <div style={styles.heroBadge}>
                <FiCheckCircle size={14} /> Official Results
              </div>
              <h2 style={styles.electionTitle}>{currentResults.electionTitle}</h2>
              <div style={styles.electionMeta}>
                <div style={styles.metaItem}>
                  <FiCalendar size={14} />
                  <p>Published: {new Date(currentResults.publishedAt).toLocaleDateString()}</p>
                </div>
                <div style={styles.metaItem}>
                  <FiUsers size={14} />
                  <p>{currentResults.summary?.totalEligibleVoters?.toLocaleString()} Voters</p>
                </div>
                <div style={styles.metaItem}>
                  <FiCheckCircle size={14} />
                  <p>{currentResults.summary?.totalVotesCast?.toLocaleString()} Votes Cast</p>
                </div>
              </div>
            </div>
            <div style={styles.turnoutCard}>
              <div>
                <div style={{ ...styles.turnoutValue, color: getTurnoutColor() }}>{turnoutRate}%</div>
                <div style={styles.turnoutLabel}>Turnout Rate</div>
              </div>
              <FiTrendingUp size={32} opacity={0.7} />
            </div>
          </div>

          {/* Summary Stats */}
          <div style={styles.summaryGrid}>
            <SummaryStat icon={<FiCheckCircle size={28} />} label="Total Votes Cast" value={currentResults.summary?.totalVotesCast?.toLocaleString()} />
            <SummaryStat icon={<FiUsers size={28} />} label="Eligible Voters" value={currentResults.summary?.totalEligibleVoters?.toLocaleString()} />
            <SummaryStat icon={<FiAward size={28} />} label="Positions" value={currentResults.results?.length} />
            <SummaryStat icon={<FiStar size={28} />} label="Candidates" value={currentResults.summary?.totalCandidates} />
          </div>

          {/* Winners Showcase */}
          {sortedWinners.length > 0 && (
            <div style={styles.winnersSection}>
              <h2 style={styles.sectionTitle}>
                <FiAward size={22} color="#D23A01" /> Winners Showcase
              </h2>
              <div style={styles.winnersContainer}>
                {sortedWinners.map((winner, idx) => (
                  <WinnerCard 
                    key={idx} 
                    winner={winner} 
                    positionName={winner.positionName} 
                    rank={winner.rank} 
                    electedRole={winner.electedRole} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Detailed Results */}
          <div style={styles.detailedSection}>
            <h2 style={styles.sectionTitle}>
              <FiBarChart2 size={22} color="#D23A01" /> Detailed Results by Position
            </h2>
            {currentResults.results?.map((position, idx) => (
              <PositionResultsTable key={idx} position={position} />
            ))}
          </div>

          {/* Footer */}
          <div style={styles.footer}>
            <p>This is an official election result document from ECMS.</p>
            <p>Generated on {new Date().toLocaleString()}</p>
          </div>
        </>
      )}
    </div>
  );
};

const SummaryStat = ({ icon, label, value }) => (
  <div style={styles.summaryCard}>
    <div style={styles.summaryIcon}>{icon}</div>
    <div>
      <div style={styles.summaryValue}>{value || 0}</div>
      <div style={styles.summaryLabel}>{label}</div>
    </div>
  </div>
);

const styles = {
  container: { 
    maxWidth: '1200px', 
    margin: '0 auto', 
    padding: 'clamp(20px, 4vw, 32px)', 
    minHeight: '100vh', 
    background: '#f8fafc' ,
    marginTop:'5vh'
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
    color: '#6b7280',
    fontFamily: "'Poppins', sans-serif"
  },
  spinner: { 
    width: '50px', 
    height: '50px', 
    border: '3px solid #e5e7eb', 
    borderTop: '3px solid #D23A01', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  },
  notPublishedContainer: { 
    textAlign: 'center', 
    padding: 'clamp(40px, 8vw, 60px)', 
    background: 'white', 
    borderRadius: '24px', 
    marginTop: '15vh',
    maxWidth: '500px',
    margin: '15vh auto 0'
  },
  notPublishedIcon: { 
    color: '#D23A01', 
    marginBottom: '20px' 
  },
  notPublishedTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif"
  },
  notPublishedText: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '24px',
    fontFamily: "'Poppins', sans-serif"
  },
  backBtn: { 
    padding: '12px 28px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif"
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
    fontSize: 'clamp(28px, 6vw, 34px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontFamily: "'Poppins', sans-serif"
  },
  titleIcon: {
    color: '#D23A01'
  },
  subtitle: { 
    fontSize: '14px', 
    color: '#4b5563',
    fontFamily: "'Poppins', sans-serif"
  },
  headerActions: { 
    display: 'flex', 
    gap: '12px' 
  },
  actionBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '10px 18px', 
    background: 'white', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontSize: '13px', 
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s'
  },
  selectorCard: { 
    background: 'white', 
    borderRadius: '16px', 
    padding: 'clamp(16px, 3vw, 20px)', 
    marginBottom: '24px', 
    border: '1px solid #e5e7eb' 
  },
  selectorLabel: { 
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px', 
    fontWeight: '700', 
    marginBottom: '8px', 
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif"
  },
  selector: { 
    width: '100%', 
    padding: '12px 16px', 
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    fontSize: '14px', 
    background: '#fff', 
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    color: '#1a1a1a'
  },
  selectorHint: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px',
    fontFamily: "'Poppins', sans-serif"
  },
  heroSection: { 
    background: 'linear-gradient(135deg, #023430 0%, #011a18 100%)', 
    borderRadius: '24px', 
    padding: 'clamp(24px, 5vw, 32px)', 
    marginBottom: '32px', 
    color: 'white', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexWrap: 'wrap', 
    gap: '20px' 
  },
  heroBadge: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '8px', 
    background: 'rgba(255,255,255,0.1)', 
    padding: '6px 14px', 
    borderRadius: '30px', 
    fontSize: '12px',
    fontWeight: '500',
    marginBottom: '16px' 
  },
  electionTitle: { 
    fontSize: 'clamp(22px, 5vw, 26px)', 
    fontWeight: '800', 
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif",
    color: "white"
  },
  electionMeta: { 
    display: 'flex', 
    gap: '20px', 
    flexWrap: 'wrap' 
  },
  metaItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    fontSize: '13px', 
    opacity: 0.8,
    fontFamily: "'Poppins', sans-serif"
  },
  turnoutCard: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px', 
    background: 'rgba(255,255,255,0.05)', 
    padding: '16px 24px', 
    borderRadius: '16px' 
  },
  turnoutValue: { 
    fontSize: '32px', 
    fontWeight: '800',
    fontFamily: "'Poppins', sans-serif"
  },
  turnoutLabel: { 
    fontSize: '12px', 
    opacity: 0.7,
    fontFamily: "'Poppins', sans-serif"
  },
  summaryGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
    gap: 'clamp(12px, 2vw, 16px)', 
    marginBottom: '32px' 
  },
  summaryCard: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 'clamp(12px, 2vw, 16px)', 
    background: 'white', 
    borderRadius: '16px', 
    padding: 'clamp(12px, 2.5vw, 16px)', 
    border: '1px solid #e5e7eb', 
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
  },
  summaryIcon: { 
    color: '#D23A01',
    fontSize: '24px',
    display: 'flex',
    alignItems: 'center'
  },
  summaryValue: { 
    fontSize: 'clamp(20px, 4vw, 24px)', 
    fontWeight: '800', 
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif"
  },
  summaryLabel: { 
    fontSize: '16px', 
    color: '#4b5563', 
    marginTop: '2px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '500'
  },
  winnersSection: { 
    marginBottom: '40px' 
  },
  sectionTitle: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    fontSize: 'clamp(20px, 4vw, 24px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    marginBottom: '24px', 
    paddingBottom: '12px', 
    borderBottom: '2px solid #e5e7eb',
    fontFamily: "'Poppins', sans-serif"
  },
  winnersContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  detailedSection: { 
    marginBottom: '40px' 
  },
  footer: { 
    textAlign: 'center', 
    padding: '24px', 
    borderTop: '1px solid #e5e7eb', 
    fontSize: '12px', 
    color: '#6b7280', 
    marginTop: '24px',
    fontFamily: "'Poppins', sans-serif"
  },
  // Modal styles
  modalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    background: 'rgba(0,0,0,0.5)', 
    zIndex: 1000, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: '20px'
  },
  modal: { 
    background: 'white', 
    borderRadius: '24px', 
    width: '90%', 
    maxWidth: '450px', 
    overflow: 'hidden' 
  },
  modalHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '20px 24px', 
    borderBottom: '1px solid #e5e7eb' 
  },
  modalTitle: { 
    fontSize: '20px', 
    fontWeight: '700', 
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    fontFamily: "'Poppins', sans-serif"
  },
  modalClose: { 
    background: 'none', 
    border: 'none', 
    fontSize: '28px', 
    cursor: 'pointer', 
    color: '#94a3b8' 
  },
  modalBody: { 
    textAlign: 'center', 
    padding: '32px 24px' 
  },
  deleteIconWrapper: { 
    marginBottom: '20px' 
  },
  deleteMessage: { 
    fontSize: '16px', 
    color: '#1a1a1a', 
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif"
  },
  deleteWarning: { 
    fontSize: '13px', 
    color: '#dc2626', 
    marginBottom: 0,
    fontFamily: "'Poppins', sans-serif"
  },
  modalActions: { 
    display: 'flex', 
    justifyContent: 'flex-end', 
    gap: '12px', 
    padding: '16px 24px', 
    borderTop: '1px solid #e5e7eb' 
  },
  cancelBtn: { 
    padding: '10px 20px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563',
    fontFamily: "'Poppins', sans-serif"
  },
  confirmDeleteBtn: { 
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px', 
    background: '#dc2626', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif"
  }
};

// Add keyframe animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    .hero-section {
      flex-direction: column;
      text-align: center;
    }
    .election-meta {
      justify-content: center;
    }
  }
  
  @media (max-width: 640px) {
    .summary-card {
      flex-direction: column;
      text-align: center;
      gap: 8px;
    }
  }
`;
if (!document.head.querySelector('#results-styles')) {
  styleSheet.id = 'results-styles';
  document.head.appendChild(styleSheet);
}

export default ViewElectionResults;