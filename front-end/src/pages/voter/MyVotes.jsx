// pages/voter/MyVotes.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheckCircle, FiClock, FiCalendar, FiEye, 
  FiPrinter, FiFileText, FiAlertCircle,
  FiSearch, FiChevronLeft, FiChevronRight,
  FiAward, FiShield, FiX, FiCheck
} from 'react-icons/fi';
import { voteService } from '../../services/voteService';

const MyVotes = () => {
  const navigate = useNavigate();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Verify Modal States
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState(null);
  const [autoCloseTimer, setAutoCloseTimer] = useState(null);

  useEffect(() => {
    loadMyVotes();
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
    };
  }, [autoCloseTimer]);

  const loadMyVotes = async () => {
    setLoading(true);
    try {
      const data = await voteService.getMyVotes();
      console.log("Votes data:", data);
      setVotes(data || []);
    } catch (err) {
      console.error('Error loading votes:', err);
      setError(err.response?.data?.message || 'Failed to load your voting history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleVerifyVote = async () => {
    if (!confirmationCode.trim()) {
      setVerifyError('Please enter a confirmation code');
      return;
    }

    setVerifying(true);
    setVerifyError(null);
    setVerifyResult(null);

    try {
      // Call your verification API
      const response = await voteService.verifyVote(confirmationCode);
      setVerifyResult({
        success: true,
        message: 'Vote verified successfully! Your vote has been recorded.',
        data: response.data
      });
      
      // Auto close after 10 seconds
      const timer = setTimeout(() => {
        resetVerifyModal();
      }, 10000);
      setAutoCloseTimer(timer);
      
    } catch (err) {
      setVerifyResult({
        success: false,
        message: err.response?.data?.message || 'Invalid confirmation code. Please check and try again.'
      });
      
      // Auto close error after 10 seconds
      const timer = setTimeout(() => {
        resetVerifyModal();
      }, 10000);
      setAutoCloseTimer(timer);
      
    } finally {
      setVerifying(false);
    }
  };

  const resetVerifyModal = () => {
    if (autoCloseTimer) clearTimeout(autoCloseTimer);
    setShowVerifyModal(false);
    setConfirmationCode('');
    setVerifyResult(null);
    setVerifyError(null);
    setVerifying(false);
    setAutoCloseTimer(null);
  };

  const openVerifyModal = () => {
    setShowVerifyModal(true);
    setConfirmationCode('');
    setVerifyResult(null);
    setVerifyError(null);
  };

  // Filter votes
  const filteredVotes = votes.filter(vote => {
    return searchTerm === '' || 
      vote.electionId?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vote.confirmationCode?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination
  const totalPages = Math.ceil(filteredVotes.length / itemsPerPage);
  const paginatedVotes = filteredVotes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p>Loading your voting history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <FiAlertCircle size={48} color="#ef4444" />
        <p>{error}</p>
        <button style={styles.retryBtn} onClick={loadMyVotes}>Try Again</button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <FiAward size={28} style={{ color: '#D23A01' }} /> My Voting History
          </h1>
          <p style={styles.subtitle}>View all your past votes and receipts</p>
        </div>
        <div style={styles.headerButtons}>
          <button style={styles.verifyBtn} onClick={openVerifyModal}>
            <FiShield size={18} /> Verify Vote
          </button>
          <div style={styles.statsCard}>
            <div style={styles.statValue}>{votes.length}</div>
            <div style={styles.statLabel}>Total Votes</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={styles.searchBox}>
        <FiSearch size={18} color="#6b7280" />
        <input 
          type="text" 
          placeholder="Search by election name or receipt code..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          style={styles.searchInput} 
        />
      </div>

      {filteredVotes.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🗳️</div>
          <h3>No Votes Found</h3>
          <p>{searchTerm ? "No votes match your search criteria." : "You haven't cast any votes yet."}</p>
          {!searchTerm && (
            <button style={styles.voteBtn} onClick={() => navigate('/voter/elections')}>
              View Active Elections
            </button>
          )}
        </div>
      ) : (
        <>
          <div style={styles.votesList}>
            {paginatedVotes.map((vote) => (
              <div key={vote._id} style={styles.voteCard}>
                {/* Header */}
                <div style={styles.voteHeader}>
                  <div>
                    <h3 style={styles.electionTitle}>{vote.electionId?.title || 'Election'}</h3>
                    <div style={styles.voteMeta}>
                      <span style={styles.metaItem}>
                        <FiCalendar size={12} /> {formatDate(vote.castAt)}
                      </span>
                      <span style={styles.metaItem}>
                        <FiFileText size={12} /> {vote.confirmationCode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Votes Details - Position and Candidate */}
                <div style={styles.votesDetails}>
                  <strong style={styles.sectionTitle}>You voted for:</strong>
                  {vote.votes?.map((v, idx) => (
                    <div key={idx} style={styles.voteItem}>
                      <span style={styles.positionName}>{v.positionName}:</span>
                      <span style={styles.candidateName}>
                        {v.candidateName || `${v.candidateId?.firstName || ''} ${v.candidateId?.lastName || ''}`.trim() || 'Unknown'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Actions */}
                <div style={styles.voteFooter}>
                  <button style={styles.viewBtn} onClick={() => {
                    navigate(`/voter/vote-receipt/${vote.confirmationCode}`, { 
                      state: { 
                        confirmationCode: vote.confirmationCode,
                        electionTitle: vote.electionId?.title,
                        castAt: vote.castAt,
                        votes: vote.votes
                      } 
                    });
                  }}>
                    <FiEye size={14} /> View Receipt
                  </button>
                  <button style={styles.printBtn} onClick={() => {
                    const printWindow = window.open('', '_blank');
                    printWindow.document.write(`
                      <html>
                        <head><title>Vote Receipt - ${vote.confirmationCode}</title>
                        <style>
                          body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
                          .receipt { border: 2px solid #D23A01; padding: 20px; border-radius: 16px; }
                          .header { text-align: center; border-bottom: 2px solid #D23A01; margin-bottom: 20px; }
                          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ccc; }
                          .votes { margin-top: 20px; }
                          .vote-row { display: flex; justify-content: space-between; padding: 6px 0; }
                          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #000; }
                          h1 { color: #D23A01; }
                        </style>
                        </head>
                        <body>
                          <div class="receipt">
                            <div class="header"><h1>OFFICIAL VOTE RECEIPT</h1><p>ECMS - Election Control & Management System</p></div>
                            <div class="row"><strong>RECEIPT ID:</strong><span>${vote.confirmationCode}</span></div>
                            <div class="row"><strong>ELECTION:</strong><span>${vote.electionId?.title}</span></div>
                            <div class="row"><strong>DATE & TIME:</strong><span>${formatDate(vote.castAt)}</span></div>
                            <div class="votes"><strong>VOTES CAST:</strong></div>
                            ${vote.votes?.map(v => `<div class="vote-row"><span>${v.positionName}:</span><span>${v.candidateName || v.candidateId?.firstName + ' ' + v.candidateId?.lastName}</span></div>`).join('')}
                            <div class="footer"><p>This is an official receipt confirming your vote has been recorded.</p></div>
                          </div>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.print();
                  }}>
                    <FiPrinter size={14} /> Print
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button 
                style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }} 
                onClick={() => setCurrentPage(p => p - 1)} 
                disabled={currentPage === 1}
              >
                <FiChevronLeft size={16} /> Previous
              </button>
              <span style={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
              <button 
                style={{ ...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1 }} 
                onClick={() => setCurrentPage(p => p + 1)} 
                disabled={currentPage === totalPages}
              >
                Next <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Verify Vote Modal */}
      {showVerifyModal && (
        <div style={styles.modalOverlay} onClick={resetVerifyModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={resetVerifyModal}>×</button>
            
            <div style={styles.modalHeader}>
              <FiShield size={28} color="#D23A01" />
              <h2>Verify Your Vote</h2>
              <p>Enter your confirmation code to verify your vote was recorded</p>
            </div>

            <div style={styles.modalBody}>
              {!verifyResult ? (
                <>
                  <div style={styles.inputGroup}>
                    <label style={styles.inputLabel}>Confirmation Code</label>
                    <input
                      type="text"
                      placeholder="e.g., VOTE-1734567890123-1234"
                      value={confirmationCode}
                      onChange={(e) => setConfirmationCode(e.target.value)}
                      style={styles.modalInput}
                      autoFocus
                    />
                  </div>
                  {verifyError && (
                    <div style={styles.errorMessage}>
                      <FiAlertCircle size={16} /> {verifyError}
                    </div>
                  )}
                  <div style={styles.modalActions}>
                    <button style={styles.cancelBtn} onClick={resetVerifyModal}>
                      Cancel
                    </button>
                    <button 
                      style={styles.submitBtn} 
                      onClick={handleVerifyVote}
                      disabled={verifying}
                    >
                      {verifying ? <div style={styles.smallSpinner}></div> : <><FiShield size={16} /> Verify</>}
                    </button>
                  </div>
                </>
              ) : (
                <div style={verifyResult.success ? styles.successResult : styles.errorResult}>
                  {verifyResult.success ? (
                    <FiCheck size={48} color="#10b981" />
                  ) : (
                    <FiX size={48} color="#ef4444" />
                  )}
                  <p>{verifyResult.message}</p>
                  {verifyResult.success && verifyResult.data && (
                    <div style={styles.resultDetails}>
                      <div><strong>Confirmation:</strong> {verifyResult.data.confirmationCode}</div>
                      <div><strong>Election:</strong> {verifyResult.data.electionTitle}</div>
                      <div><strong>Cast At:</strong> {new Date(verifyResult.data.castAt).toLocaleString()}</div>
                    </div>
                  )}
                  <button style={styles.closeResultBtn} onClick={resetVerifyModal}>
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
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

const styles = {
  container: { 
    maxWidth: '1100px', 
    margin: '0 auto', 
    padding: '20px', 
    marginTop: '70px', 
    minHeight: '100vh', 
    background: '#f8fafc' 
  },
  loaderContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '400px', 
    gap: '16px' 
  },
  spinner: { 
    width: '40px', 
    height: '40px', 
    border: '3px solid #e5e7eb', 
    borderTop: '3px solid #D23A01', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  },
  errorContainer: {
    textAlign: 'center',
    padding: '40px',
    background: 'white',
    borderRadius: '16px',
    margin: '40px auto',
    maxWidth: '400px'
  },
  retryBtn: {
    marginTop: '16px',
    padding: '8px 20px',
    background: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '24px', 
    flexWrap: 'wrap', 
    gap: '16px' 
  },
  title: { 
    fontSize: '24px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    marginBottom: '4px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px' 
  },
  subtitle: { 
    fontSize: '14px', 
    color: '#1a1a1a',
    fontWeight: '500'
  },
  headerButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  verifyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  statsCard: { 
    background: 'white', 
    borderRadius: '12px', 
    padding: '10px 20px', 
    textAlign: 'center', 
    border: '1px solid #e5e7eb' 
  },
  statValue: { 
    fontSize: '24px', 
    fontWeight: '700', 
    color: '#D23A01' 
  },
  statLabel: { 
    fontSize: '14px', 
    color: '#1a1a1a',
    fontWeight: '500'
  },
  searchBox: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '10px 16px', 
    background: 'white', 
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    marginBottom: '24px' 
  },
  searchInput: { 
    flex: 1, 
    border: 'none', 
    outline: 'none', 
    fontSize: '14px' 
  },
  emptyState: { 
    textAlign: 'center', 
    padding: '40px', 
    background: 'white', 
    borderRadius: '16px', 
    border: '1px solid #e5e7eb' 
  },
  emptyIcon: { 
    fontSize: '48px', 
    marginBottom: '12px' 
  },
  voteBtn: { 
    marginTop: '16px', 
    padding: '10px 24px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: '500' 
  },
  votesList: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '16px' 
  },
  voteCard: { 
    background: 'white', 
    borderRadius: '16px', 
    border: '1px solid #e5e7eb', 
    overflow: 'hidden' 
  },
  voteHeader: { 
    padding: '16px 20px', 
    background: '#f8fafc', 
    borderBottom: '1px solid #e5e7eb' 
  },
  electionTitle: { 
    fontSize: '17px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    marginBottom: '6px' 
  },
  voteMeta: { 
    display: 'flex', 
    gap: '16px', 
    flexWrap: 'wrap' 
  },
  metaItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '5px', 
    fontSize: '14px', 
    color: '#1a1a1a',
    fontWeight: '700'
  },
  votesDetails: { 
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb'
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1a1a1a',
    display: 'block',
    marginBottom: '12px'
  },
  voteItem: { 
    display: 'flex', 
    gap: '12px', 
    padding: '8px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  positionName: { 
    fontWeight: '600', 
    color: '#D23A01', 
    minWidth: '120px',
    fontSize: '13px'
  },
  candidateName: { 
    color: '#1a1a1a',
    fontSize: '15px',
    fontWeight: '700'
  },
  voteFooter: { 
    display: 'flex', 
    gap: '12px', 
    padding: '12px 20px', 
    background: '#fafafa' 
  },
  viewBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '6px 14px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '14px', 
    fontWeight: '700',
    color: '#1a1a1a'
  },
  printBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '6px 14px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '15px', 
    fontWeight: '700',
    color: '#1a1a1a'
  },
  pagination: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: '16px', 
    marginTop: '24px', 
    padding: '16px', 
    background: 'white', 
    borderRadius: '12px', 
    border: '1px solid #e5e7eb' 
  },
  pageBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '8px 16px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '15px', 
    fontWeight: '700',
    color: '#1a1a1a'
  },
  pageInfo: { 
    fontSize: '15px', 
    color: '#1a1a1a',
    fontWeight: '700'
  },
  // Modal Styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px'
  },
  modal: {
    background: 'white',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '480px',
    overflow: 'hidden',
    position: 'relative'
  },
  modalClose: {
    position: 'absolute',
    top: '16px',
    right: '20px',
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#1a1a1a',
    zIndex: 1
  },
  modalHeader: {
    textAlign: 'center',
    padding: '30px 24px 20px',
    borderBottom: '1px solid #e5e7eb'
  },
  modalHeaderh2: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '12px 0 8px'
  },
  modalHeaderp: {
    fontSize: '16px',
    color: '#1a1a1a',
    fontWeight: '500'
  },
  modalBody: {
    padding: '24px'
  },
  inputGroup: {
    marginBottom: '24px'
  },
  inputLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '8px'
  },
  modalInput: {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  modalActions: {
    display: 'flex',
    gap: '12px'
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  submitBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: '#D23A01',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white'
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    background: '#fee2e2',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#dc2626',
    marginBottom: '20px'
  },
  successResult: {
    textAlign: 'center',
    padding: '16px'
  },
  errorResult: {
    textAlign: 'center',
    padding: '16px'
  },
  resultDetails: {
    marginTop: '20px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
    textAlign: 'left'
  },
  closeResultBtn: {
    marginTop: '20px',
    padding: '10px 24px',
    background: '#D23A01',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600'
  },
  smallSpinner: {
    width: '18px',
    height: '18px',
    border: '2px solid white',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }
};

// Override modal header styles
styles.modalHeader = {
  ...styles.modalHeader,
  '& h2': styles.modalHeaderh2,
  '& p': styles.modalHeaderp
};

// Add keyframe animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin { 
    from { transform: rotate(0deg); } 
    to { transform: rotate(360deg); } 
  }
`;
if (!document.head.querySelector('#my-votes-styles')) {
  styleSheet.id = 'my-votes-styles';
  document.head.appendChild(styleSheet);
}

export default MyVotes;