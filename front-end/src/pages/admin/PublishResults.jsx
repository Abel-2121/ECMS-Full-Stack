import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchElectionById, fetchAllElections } from '../../Js/election-slice';
import { formatLocalDate } from '../../utils/formatLocalDate';
import { 
  fetchDetailedResults, 
  resolveTie, 
  publishResults, 
  clearPublishSuccess 
} from '../../Js/results-slice';
import { 
  FiCheckCircle, FiAlertCircle, FiEye, FiAward, 
  FiArrowLeft, FiRefreshCw, FiShuffle, FiX, FiLoader 
} from 'react-icons/fi';
import PositionResultsTable from '../../components/results/PositionResultsTable';

const PublishResults = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentElection, loading: electionLoading, elections } = useSelector(state => state.election);
  const { currentResults, publishLoading, publishSuccess, error } = useSelector(state => state.results);
  
  const [selectedElectionId, setSelectedElectionId] = useState(electionId || '');
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [ties, setTies] = useState([]);
  const [showTieModal, setShowTieModal] = useState(false);
  const [currentTieIndex, setCurrentTieIndex] = useState(0);
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedCount, setResolvedCount] = useState(0);
  
  // Fetch all elections on mount
  useEffect(() => {
    dispatch(fetchAllElections());
  }, [dispatch]);

  // Load election details when selectedElectionId changes
  useEffect(() => {
    if (selectedElectionId) {
      dispatch(fetchElectionById(selectedElectionId));
      loadResults();
    }
  }, [dispatch, selectedElectionId]);

  useEffect(() => {
    if (publishSuccess) {
      showToast('Results published successfully! Voters can now view the results.', 'success');
      setShowPublishConfirm(false);
      setShowTieModal(false);
      dispatch(clearPublishSuccess());
      setTimeout(() => navigate(`/electionAdmin/results/${selectedElectionId}`), 2000);
    }
  }, [publishSuccess, dispatch, navigate]);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadResults = async () => {
    if (!selectedElectionId) return;
    try {
      const result = await dispatch(fetchDetailedResults(selectedElectionId)).unwrap();
      if (result?.hasTies && result?.ties?.length > 0) {
        setTies(result.ties);
        setShowTieModal(true);
      } else {
        setTies([]);
      }
    } catch (err) {
      console.error('Error loading results:', err);
    }
  };
  const handleElectionChange = (e) => {
    const newElectionId = e.target.value;
    setSelectedElectionId(newElectionId);
    setTies([]);
    setShowTieModal(false);
    setCurrentTieIndex(0);
    setResolvedCount(0);
    // Update URL without reload
    navigate(`/electionAdmin/publish-results/${newElectionId}`, { replace: true });
  };

  const handleResolveTie = async () => {
    const currentTie = ties[currentTieIndex];
    setIsResolving(true);
    
    try {
      await dispatch(resolveTie({ 
        electionId: selectedElectionId, 
        positionId: currentTie.positionId 
      })).unwrap();
      
      setResolvedCount(prev => prev + 1);
      
      if (currentTieIndex + 1 < ties.length) {
        setCurrentTieIndex(prev => prev + 1);
        showToast(`Tie resolved! ${ties.length - currentTieIndex - 1} more to go.`, 'success');
      } else {
        setShowTieModal(false);
        showToast('All ties resolved! You can now publish the results.', 'success');
        await loadResults();
      }
    } catch (err) {
      showToast(err.message || 'Failed to resolve tie', 'error');
    } finally {
      setIsResolving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await dispatch(publishResults(selectedElectionId)).unwrap();
    } catch (err) {
      showToast(err.message || 'Failed to publish results', 'error');
    }
  };

  const canPublish = () => {
    if (!currentElection) return false;
    const now = new Date();
    const votingEnd = new Date(currentElection.timeline?.votingEnd);
    const hasEnded = now > votingEnd;
    const isNotPublished = currentElection.status !== 'results_published';
    return hasEnded && isNotPublished;
  };



  // Filter only completed elections (not yet published)
  const completedElections = elections.filter(e => e.status === 'completed');

  if (electionLoading && selectedElectionId) {
    return <Loader text="Loading election data..." />;
  }

  const isPublishable = canPublish();
  const hasEnded = currentElection ? new Date() > new Date(currentElection.timeline?.votingEnd) : false;
  const currentTie = ties[currentTieIndex];

  return (
    <div style={styles.container}>
      <Toast message={toastMessage} />
      
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/electionAdmin/elections')}>
          <FiArrowLeft size={18} /> Back to Elections
        </button>
        <div>
          <h1 style={styles.title}>Publish Election Results </h1>
          <p style={styles.subtitle}>Review and publish official election results</p>
        </div>
      </div>

      {/* Election Selector */}
      <div style={styles.selectorCard}>
        <label style={styles.selectorLabel}>Select Election to Publish</label>
        <select 
          value={selectedElectionId} 
          onChange={handleElectionChange} 
          style={styles.selector}
        >
          <option value="">-- Select an election --</option>
          {completedElections.map(election => (
            <option key={election._id} value={election._id}>
              {election.title} - Voting Ended
            </option>
          ))}
        </select>
        {completedElections.length === 0 && (
          <p style={styles.noElectionsMsg}>No completed elections available for publishing.</p>
        )}
      </div>

      {selectedElectionId && currentElection && (
        <>
          {/* Election Info Card */}
          <div style={styles.infoCard}>
            <div style={styles.infoHeader}>
              <h2 style={styles.electionTitle}>{currentElection.title}</h2>
              <p style={{
                ...styles.statusBadge,
                background: currentElection.status === 'results_published' ? '#dcfce7' : '#fef3c7',
                color: currentElection.status === 'results_published' ? '#166534' : '#92400e'
              }}>
                {currentElection.status === 'results_published' ? 'Published' : 'Ready to Publish'}
              </p>
            </div>
            
            <div style={styles.infoGrid}>
              <InfoItem label="Voting Period" value={`${formatLocalDate(currentElection.timeline?.votingStart,true)} - ${formatLocalDate(currentElection.timeline?.votingEnd,true)}`} />
              <InfoItem label="Voting Status" value={hasEnded ? 'Voting Ended' : 'Voting Still Active'} status={hasEnded ? 'ended' : 'active'} />
              <InfoItem label="Total Voters" value={currentElection.statistics?.totalEligibleVoters || 0} />
              <InfoItem label="Votes Cast" value={currentElection.statistics?.totalVotesCast || 0} />
            </div>
          </div>

          {/* Already Published */}
          {currentElection.status === 'results_published' && (
            <div style={styles.alreadyPublishedCard}>
              <FiCheckCircle size={24} color="#10b981" />
              <div>
                <strong>Results Already Published</strong>
                <p>Results for this election have already been published and are visible to voters.</p>
              </div>
              <button style={styles.viewResultsBtn} onClick={() => navigate(`/electionAdmin/results/${selectedElectionId}`)}>
                View Published Results
              </button>
            </div>
          )}

          {/* Cannot Publish Warning */}
          {!isPublishable && currentElection.status !== 'results_published' && (
            <div style={styles.warningCard}>
              <FiAlertCircle size={24} color="#f59e0b" />
              <div>
                <strong>Cannot Publish Results Yet</strong>
                <p>Voting must end before results can be published. Voting ends on {formatLocalDate(currentElection.timeline?.votingEnd,true)}.</p>
              </div>
            </div>
          )}

          {/* Preview Results Section */}
          {currentResults?.results && (
            <div style={styles.previewSection}>
              <div style={styles.previewHeader}>
                <h3 style={styles.previewTitle}><FiEye size={18} /> Preview Results</h3>
                <button style={styles.refreshBtn} onClick={loadResults}><FiRefreshCw size={14} /> Refresh</button>
              </div>
              
              <div style={styles.summaryGrid}>
                <SummaryCard label="Total Votes" value={currentResults.summary?.totalVotesCast?.toLocaleString() || 0} />
                <SummaryCard label="Turnout" value={`${currentResults.summary?.turnoutPercentage || 0}%`} />
                <SummaryCard label="Positions" value={currentResults.results?.length || 0} />
                <SummaryCard label="Candidates" value={currentResults.summary?.totalCandidates || 0} />
              </div>

              {currentResults.results.map((position, idx) => (
                <PositionResultsTable key={idx} position={position} />
              ))}
            </div>
          )}

          {/* Publish Button */}
          {isPublishable && currentElection.status !== 'results_published' && (
            <div style={styles.publishSection}>
              <div style={styles.publishInfo}>
                <FiAward size={24} color="#f59e0b" />
                <div>
                  <strong>Ready to Publish</strong>
                  <p>Review the preview results above. Once published, results will be visible to all voters.</p>
                </div>
              </div>
              <button style={styles.publishBtn} onClick={() => setShowPublishConfirm(true)} disabled={publishLoading}>
                {publishLoading ? <FiLoader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {publishLoading ? 'Publishing...' : 'Publish Official Results'}
              </button>
            </div>
          )}

          {/* Tie-Breaking Modal */}
          {showTieModal && currentTie && (
            <TieModal
              tie={currentTie}
              index={currentTieIndex}
              total={ties.length}
              onResolve={handleResolveTie}
              onClose={() => setShowTieModal(false)}
              isResolving={isResolving}
              resolvedCount={resolvedCount}
            />
          )}

          {/* Publish Confirmation Modal */}
          {showPublishConfirm && (
            <ConfirmModal
              title="Publish Election Results"
              message={`Are you sure you want to publish the results for "${currentElection.title}"?`}
              warning="This action is irreversible. Once published, results will be visible to all voters and candidates."
              onConfirm={handlePublish}
              onCancel={() => setShowPublishConfirm(false)}
              isLoading={publishLoading}
            />
          )}
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Helper Components (same as before, plus new selector styles)
const Loader = ({ text }) => (
  <div style={styles.loaderContainer}>
    <div style={styles.spinner}></div>
    <p>{text}</p>
  </div>
);

const NotFound = ({ onBack }) => (
  <div style={styles.errorContainer}>
    <FiAlertCircle size={48} color="#dc2626" />
    <h2>Election Not Found</h2>
    <button style={styles.backBtn} onClick={onBack}>Back to Elections</button>
  </div>
);

const Toast = ({ message }) => {
  if (!message) return null;
  const colors = {
    success: '#10b981', error: '#ef4444', info: '#3b82f6'
  };
  return (
    <div style={{ ...styles.toast, background: colors[message.type] || colors.info }}>
      {message.message}
    </div>
  );
};

const InfoItem = ({ label, value, status }) => (
  <div style={styles.infoItem}>
    <p style={styles.infoLabel}>{label}</p>
    <p style={{ ...styles.infoValue, color: status === 'ended' ? '#dc2626' : '#10b981' }}>{value}</p>
  </div>
);

const SummaryCard = ({ label, value }) => (
  <div style={styles.summaryCard}>
    <p style={styles.summaryLabel}>{label}</p>
    <p style={styles.summaryValue}>{value}</p>
  </div>
);

const TieModal = ({ tie, index, total, onResolve, onClose, isResolving, resolvedCount }) => (
  <div style={styles.modalOverlay} onClick={onClose}>
    <div style={styles.tieModal} onClick={(e) => e.stopPropagation()}>
      <div style={styles.tieModalHeader}>
        <h3><FiAlertCircle size={20} /> Tie Detected</h3>
        <button style={styles.modalClose} onClick={onClose}><FiX size={20} /></button>
      </div>
      <div style={styles.tieModalBody}>
        <div style={styles.tieInfo}>
          <p><strong>Position:</strong> {tie.positionName}</p>
          <p><strong>Type:</strong> {tie.type === 'first_place' ? 'First Place Tie' : 'Cutoff Tie'}</p>
          <p><strong>Tied Candidates:</strong></p>
        </div>
        <div style={styles.tiedCandidatesList}>
          {tie.tiedCandidates.map((candidate, idx) => (
            <div key={candidate.candidateId} style={styles.tiedCandidateCard}>
              <div style={styles.tiedCandidateRank}>#{idx + 1}</div>
              <div style={styles.tiedCandidateInfo}>
                <div style={styles.tiedCandidateName}>{candidate.candidateName}</div>
                <div style={styles.tiedCandidateVotes}>{candidate.votes} votes</div>
              </div>
            </div>
          ))}
        </div>
        <p style={styles.tieNote}>🎲 Winner will be selected randomly. Click resolve to continue.</p>
      </div>
      <div style={styles.tieModalFooter}>
        <div style={styles.tieProgress}>Tie {index + 1} of {total} | Resolved: {resolvedCount}</div>
        <button style={styles.resolveBtn} onClick={onResolve} disabled={isResolving}>
          {isResolving ? <FiLoader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <FiShuffle size={16} />}
          {isResolving ? 'Resolving...' : 'Resolve Tie'}
        </button>
      </div>
    </div>
  </div>
);

const ConfirmModal = ({ title, message, warning, onConfirm, onCancel, isLoading }) => (
  <div style={styles.modalOverlay} onClick={onCancel}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      <div style={styles.modalIcon}>⚠️</div>
      <h3 style={styles.modalTitle}>{title}</h3>
      <p style={styles.modalText}>{message}</p>
      <p style={styles.modalWarning}>{warning}</p>
      <div style={styles.modalActions}>
        <button style={styles.cancelBtn} onClick={onCancel}>Cancel</button>
        <button style={styles.confirmBtn} onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Publishing...' : 'Yes, Publish Results'}
        </button>
      </div>
    </div>
  </div>
);

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: 'clamp(16px, 4vw, 32px)', marginTop: 'clamp(60px, 8vh, 80px)', minHeight: '100vh', background: '#f8fafc' },
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' },
  spinner: { width: '48px', height: '48px', border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  errorContainer: { textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px' },
  backBtn: { marginTop: '20px', padding: '10px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  header: { marginBottom: '24px' },
  backButton: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginBottom: '16px', fontSize: '14px' },
  title: { fontSize: 'clamp(24px, 5vw, 28px)', fontWeight: '700', color: '#0f172a', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#64748b' },
  
  // Selector Styles
  selectorCard: { background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '24px', border: '1px solid #e2e8f0' },
  selectorLabel: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1e293b' },
  selector: { width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', background: '#fff', cursor: 'pointer' },
  noElectionsMsg: { fontSize: '13px', color: '#64748b', marginTop: '12px', textAlign: 'center' },
  
  infoCard: { background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  infoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  electionTitle: { fontSize: '20px', fontWeight: '600', color: '#0f172a', margin: 0 },
  statusBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
  infoItem: { display: 'flex', flexDirection: 'column', gap: '4px' },
  infoLabel: { fontSize: '12px', color: '#64748b' },
  infoValue: { fontSize: '14px', fontWeight: '500', color: '#1e293b' },
  warningCard: { display: 'flex', alignItems: 'center', gap: '16px', background: '#fef3c7', borderRadius: '16px', padding: '20px', marginBottom: '24px' },
  alreadyPublishedCard: { display: 'flex', alignItems: 'center', gap: '16px', background: '#dcfce7', borderRadius: '16px', padding: '20px', marginBottom: '24px', flexWrap: 'wrap' },
  viewResultsBtn: { marginLeft: 'auto', padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  previewSection: { marginBottom: '32px' },
  previewHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  previewTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '600', color: '#0f172a', margin: 0 },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' },
  summaryCard: { background: '#f8fafc', borderRadius: '12px', padding: '16px', textAlign: 'center' },
  summaryLabel: { fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' },
  summaryValue: { fontSize: '24px', fontWeight: '700', color: '#0f172a' },
  publishSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fef3c7', borderRadius: '16px', padding: '20px', marginTop: '24px', flexWrap: 'wrap', gap: '16px' },
  publishInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
  publishBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  toast: { position: 'fixed', top: '20px', right: '20px', padding: '12px 20px', borderRadius: '10px', color: 'white', fontSize: '14px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  tieModal: { background: 'white', borderRadius: '20px', width: '90%', maxWidth: '500px', maxHeight: '85vh', overflow: 'auto' },
  tieModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' },
  tieModalBody: { padding: '24px' },
  tieInfo: { marginBottom: '20px' },
  tiedCandidatesList: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
  tiedCandidateCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', border: '2px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' },
  tiedCandidateRank: { width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', color: '#64748b' },
  tiedCandidateInfo: { flex: 1 },
  tiedCandidateName: { fontSize: '16px', fontWeight: '600', color: '#0f172a' },
  tiedCandidateVotes: { fontSize: '12px', color: '#64748b' },
  tieNote: { fontSize: '13px', color: '#64748b', background: '#f1f5f9', padding: '12px', borderRadius: '10px', marginTop: '12px' },
  tieModalFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#fafafa' },
  tieProgress: { fontSize: '13px', color: '#64748b' },
  resolveBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
  modalClose: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' },
  modal: { background: 'white', borderRadius: '20px', padding: '32px', maxWidth: '450px', width: '90%', textAlign: 'center' },
  modalIcon: { fontSize: '48px', marginBottom: '16px' },
  modalTitle: { fontSize: '20px', fontWeight: '600', marginBottom: '12px' },
  modalText: { fontSize: '14px', color: '#475569', marginBottom: '16px' },
  modalWarning: { fontSize: '13px', color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '24px' },
  modalActions: { display: 'flex', gap: '12px' },
  cancelBtn: { flex: 1, padding: '10px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  confirmBtn: { flex: 1, padding: '10px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }
};

export default PublishResults;