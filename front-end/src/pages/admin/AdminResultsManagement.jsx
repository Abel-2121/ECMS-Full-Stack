// pages/admin/AdminResultsManagement.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllElections } from '../../Js/election-slice';
import { fetchDetailedResults, publishResults, clearPublishSuccess } from '../../Js/results-slice';
import { FiCheckCircle, FiAlertCircle, FiRefreshCw, FiEye, FiAward, FiDownload } from 'react-icons/fi';
import PositionResultsTable from '../../components/results/PositionResultsTable';
import WinnerCard from '../../components/results/WinnerCard';

const AdminResultsManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { elections, loading: electionsLoading } = useSelector(state => state.election);
  const { currentResults, publishLoading, publishSuccess, error } = useSelector(state => state.results);
  
  const [selectedElection, setSelectedElection] = useState('');
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchAllElections());
  }, [dispatch]);

  useEffect(() => {
    if (publishSuccess) {
      setToastMessage({ type: 'success', text: 'Results published successfully!' });
      setShowPublishConfirm(false);
      dispatch(clearPublishSuccess());
      setTimeout(() => setToastMessage(null), 3000);
    }
  }, [publishSuccess, dispatch]);

  const handleElectionSelect = async (electionId) => {
    setSelectedElection(electionId);
    if (electionId) {
      await dispatch(fetchDetailedResults(electionId));
    }
  };

  const handlePublishResults = async () => {
    if (selectedElection) {
      await dispatch(publishResults(selectedElection));
    }
  };

  const completedElections = elections.filter(e => 
    e.status === 'completed' || e.status === 'results_published'
  );
  const pendingElections = elections.filter(e => 
    e.status === 'voting_open' && new Date() > new Date(e.timeline?.votingEnd)
  );

  const allWinners = [];
  if (currentResults?.results) {
    currentResults.results.forEach(position => {
      const winners = position.candidates.filter(c => c.winner);
      winners.forEach((winner, idx) => {
        allWinners.push({
          ...winner,
          positionName: position.positionName,
          positionType: position.electionType,
          rank: idx + 1
        });
      });
    });
  }

  return (
    <div style={styles.container}>
      {toastMessage && (
        <div style={{ ...styles.toast, background: toastMessage.type === 'success' ? '#10b981' : '#ef4444' }}>
          {toastMessage.text}
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>Results Management</h1>
        <p style={styles.subtitle}>Publish and manage election results</p>
      </div>

      {/* Election Selector with Status */}
      <div style={styles.selectorCard}>
        <div style={styles.selectorHeader}>
          <label style={styles.selectorLabel}>Select Election</label>
          {pendingElections.length > 0 && (
            <p style={styles.pendingBadge}>
              {pendingElections.length} Election{pendingElections.length !== 1 ? 's' : ''} Ready for Publication
            </p>
          )}
        </div>
        <select
          value={selectedElection}
          onChange={(e) => handleElectionSelect(e.target.value)}
          style={styles.selector}
        >
          <option value="">-- Select an election --</option>
          {pendingElections.length > 0 && (
            <optgroup label="Ready for Publication">
              {pendingElections.map(e => (
                <option key={e._id} value={e._id}>
                  {e.title} - Voting Ended
                </option>
              ))}
            </optgroup>
          )}
          {completedElections.length > 0 && (
            <optgroup label="Published Results">
              {completedElections.map(e => (
                <option key={e._id} value={e._id}>
                  {e.title} - Results Published
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>

      {/* Publish Button */}
      {selectedElection && pendingElections.some(e => e._id === selectedElection) && (
        <div style={styles.publishCard}>
          <div style={styles.publishInfo}>
            <FiAward size={24} color="#f59e0b" />
            <div>
              <strong>Ready to Publish</strong>
              <p>Voting has ended. You can now publish the official results.</p>
            </div>
          </div>
          <button 
            style={styles.publishBtn} 
            onClick={() => setShowPublishConfirm(true)}
            disabled={publishLoading}
          >
            {publishLoading ? 'Publishing...' : 'Publish Results'}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={styles.errorBox}>
          <FiAlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Results Display */}
      {currentResults && currentResults.results && (
        <>
          {/* Summary Stats */}
          <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <p style={styles.summaryLabel}>Published At</p>
              <p style={styles.summaryValue}>
                {new Date(currentResults.publishedAt).toLocaleString()}
              </p>
            </div>
            <div style={styles.summaryCard}>
              <p style={styles.summaryLabel}>Published By</p>
              <p style={styles.summaryValue}>
                {currentResults.publishedBy?.firstName} {currentResults.publishedBy?.lastName}
              </p>
            </div>
            <div style={styles.summaryCard}>
              <p style={styles.summaryLabel}>Turnout</p>
              <p style={styles.summaryValue}>
                {currentResults.summary?.turnoutPercentage || 0}%
              </p>
            </div>
            <div style={styles.summaryCard}>
              <p style={styles.summaryLabel}>Total Votes</p>
              <p style={styles.summaryValue}>
                {currentResults.summary?.totalVotesCast?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Winners Section */}
          {allWinners.length > 0 && (
            <div style={styles.winnersSection}>
              <h2 style={styles.sectionTitle}>🏆 Winners</h2>
              <div style={styles.winnersGrid}>
                {allWinners.map((winner, idx) => (
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
            <h2 style={styles.sectionTitle}>Detailed Results</h2>
            {currentResults.results.map((position, idx) => (
              <PositionResultsTable key={idx} position={position} />
            ))}
          </div>
        </>
      )}

      {/* Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div style={styles.modalOverlay} onClick={() => setShowPublishConfirm(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalIcon}>⚠️</div>
            <h3 style={styles.modalTitle}>Publish Election Results</h3>
            <p style={styles.modalText}>
              Are you sure you want to publish the results for <strong>{pendingElections.find(e => e._id === selectedElection)?.title}</strong>?
            </p>
            <p style={styles.modalWarning}>
              This action is irreversible. Once published, results will be visible to all voters and candidates.
            </p>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowPublishConfirm(false)}>
                Cancel
              </button>
              <button style={styles.confirmBtn} onClick={handlePublishResults} disabled={publishLoading}>
                {publishLoading ? 'Publishing...' : 'Yes, Publish Results'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '32px',
    marginTop: '8vh'
  },
  header: {
    marginBottom: '32px'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '8px'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b'
  },
  selectorCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e2e8f0'
  },
  selectorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  selectorLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b'
  },
  pendingBadge: {
    fontSize: '12px',
    background: '#fef3c7',
    color: '#92400e',
    padding: '4px 12px',
    borderRadius: '20px'
  },
  selector: {
    width: '100%',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '14px'
  },
  publishCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#fef3c7',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  publishInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  publishBtn: {
    padding: '10px 24px',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  errorBox: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  summaryCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid #e2e8f0'
  },
  winnersSection: {
    marginBottom: '40px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '20px'
  },
  winnersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px'
  },
  detailedSection: {
    marginBottom: '40px'
  },
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    zIndex: 1000
  },
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
    justifyContent: 'center'
  },
  modal: {
    background: 'white',
    borderRadius: '20px',
    padding: '32px',
    maxWidth: '450px',
    width: '90%',
    textAlign: 'center'
  },
  modalIcon: {
    fontSize: '48px',
    marginBottom: '16px'
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '12px'
  },
  modalText: {
    fontSize: '14px',
    color: '#475569',
    marginBottom: '16px'
  },
  modalWarning: {
    fontSize: '13px',
    color: '#dc2626',
    background: '#fee2e2',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '24px'
  },
  modalActions: {
    display: 'flex',
    gap: '12px'
  },
  cancelBtn: {
    flex: 1,
    padding: '10px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  confirmBtn: {
    flex: 1,
    padding: '10px',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};

export default AdminResultsManagement;