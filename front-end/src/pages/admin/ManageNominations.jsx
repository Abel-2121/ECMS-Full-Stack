// pages/admin/ManageNominations.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllElections } from '../../Js/election-slice';
import { 
  fetchNominationsByElection, 
  approveNomination, 
  rejectNomination,
  setFilterStatus,
  setFilterPosition,
  setPage,
  clearError
} from '../../Js/nomination-slice';
import { 
  FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiX, 
  FiUser, FiMail, FiPhone, FiCalendar, FiFileText, FiCheckCircle, 
  FiXCircle, FiClock, FiEye, FiDownload, FiAward, FiUserCheck,
  FiMapPin, FiBriefcase, FiFlag, FiRefreshCw,
  FiBarChart2, FiAlertCircle, FiInbox, FiStar
} from 'react-icons/fi';

// API base URL from environment
const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:4001';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  const normalizedPath = imagePath.replace(/\\/g, '/');
  let cleanPath = normalizedPath;
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath;
  } else if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  return `${API_BASE_URL}/${cleanPath}`;
};

const ManageNominations = () => {
  const dispatch = useDispatch();
  const { elections } = useSelector(state => state.election);
  const { 
    nominations, 
    loading, 
    error, 
    totalCount, 
    currentPage, 
    totalPages,
    filterStatus,
    filterPosition,
    stats
  } = useSelector(state => state.nomination);

  const [selectedElection, setSelectedElection] = useState('');
  const [selectedNomination, setSelectedNomination] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState({ reason: '', ballotPosition: '', notes: '' });

  // Helper function to render avatar with image support
  const renderCandidateAvatar = (nomination, size = 'large') => {
    const imageUrl = getImageUrl(nomination.campaignPhoto || nomination.userId?.photo);
    const initials = `${nomination.userId?.firstName?.[0] || ''}${nomination.userId?.lastName?.[0] || ''}`;
    
    const avatarSize = size === 'large' ? 72 : 56;
    const fontSize = size === 'large' ? 28 : 22;
    
    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt={initials}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%'
          }}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = initials || '?';
          }}
        />
      );
    }
    
    return initials || '?';
  };

  const formatLocalDate = (dateString, includeTime = false) => {
    if (!dateString) return 'N/A';
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      ...(includeTime && { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  useEffect(() => {
    dispatch(fetchAllElections());
  }, [dispatch]);

  useEffect(() => {
    if (elections.length > 0 && !selectedElection) {
      const sortedElections = [...elections].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      if (sortedElections[0]) {
        setSelectedElection(sortedElections[0]._id);
      }
    }
  }, [elections, selectedElection]);

  useEffect(() => {
    if (selectedElection) {
      loadNominations();
    }
  }, [selectedElection, filterStatus, filterPosition, currentPage]);

  const loadNominations = () => {
    dispatch(fetchNominationsByElection({ 
      electionId: selectedElection, 
      status: filterStatus !== 'all' ? filterStatus : undefined,
      positionId: filterPosition || undefined,
      page: currentPage,
      limit: 12
    }));
  };

  const handleElectionChange = (electionId) => {
    setSelectedElection(electionId);
    setSelectedNomination(null);
    dispatch(setFilterStatus('all'));
    dispatch(setFilterPosition(''));
    dispatch(setPage(1));
  };

  const handleApprove = async () => {
    await dispatch(approveNomination({ 
      id: selectedNomination._id, 
      adminComments: modalData.notes, 
    })).unwrap();
    setShowModal(false);
    setSelectedNomination(null);
    loadNominations();
  };

  const handleReject = async () => {
    if (!modalData.reason) {
      alert('Please provide a rejection reason');
      return;
    }
    await dispatch(rejectNomination({ 
      id: selectedNomination._id, 
      rejectionReason: modalData.reason,
      adminComments: modalData.notes
    })).unwrap();
    setShowModal(false);
    setSelectedNomination(null);
    loadNominations();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return { bg: '#FEF3F0', color: '#D23A01', icon: <FiClock size={14} />, text: 'PENDING' };
      case 'approved': return { bg: '#E8F5E9', color: '#023430', icon: <FiCheckCircle size={14} />, text: 'APPROVED' };
      case 'rejected': return { bg: '#fee2e2', color: '#dc2626', icon: <FiXCircle size={14} />, text: 'REJECTED' };
      default: return { bg: '#f1f5f9', color: '#64748b', icon: null, text: 'UNKNOWN' };
    }
  };

  const positions = [...new Set(nominations.map(n => n.positionName))];

  const getSelectedElectionTitle = () => {
    const election = elections.find(e => e._id === selectedElection);
    return election?.title || 'Select Election';
  };


  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Candidate Nominations</h1>
          <p style={styles.subtitle}>Review and manage candidate nominations for elections</p>
        </div>
      </div>

      <div style={styles.electionSelectorContainer}>
        <div style={styles.filterGroup}>
          <FiFlag size={18} color="#D23A01" />
          <select 
            value={selectedElection} 
            onChange={(e) => handleElectionChange(e.target.value)}
            style={styles.electionSelect}
          >
            <option value="">Select Election</option>
            {elections.map(election => (
              <option key={election._id} value={election._id}>
                {election.title}
              </option>
            ))}
          </select>
        </div>
        
        {selectedElection && (
          <div style={styles.selectedElectionInfo}>
            <FiFlag size={14} style={{ color: '#023430' }} />
            <span style={styles.selectedElectionLabel}>Current Election:</span>
            <span style={styles.selectedElectionValue}>{getSelectedElectionTitle()}</span>
          </div>
        )}
      </div>

      {!selectedElection && elections.length === 0 && (
        <div style={styles.noElections}>
          <FiAlertCircle size={48} color="#cbd5e1" />
          <p>No elections found. Please create an election first.</p>
        </div>
      )}

      {selectedElection && (
        <>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statIconWrapper}>
                <FiBarChart2 size={28} color="#D23A01" />
              </div>
              <div>
                <div style={styles.statValue}>{totalCount}</div>
                <div style={styles.statLabel}>Total Nominations</div>
              </div>
            </div>
            <div style={{ ...styles.statCard, borderBottomColor: '#f59e0b' }}>
              <div style={styles.statIconWrapper}>
                <FiClock size={28} color="#f59e0b" />
              </div>
              <div>
                <div style={{ ...styles.statValue, color: '#f59e0b' }}>{stats.pending}</div>
                <div style={styles.statLabel}>Pending Review</div>
              </div>
            </div>
            <div style={{ ...styles.statCard, borderBottomColor: '#10b981' }}>
              <div style={styles.statIconWrapper}>
                <FiCheckCircle size={28} color="#10b981" />
              </div>
              <div>
                <div style={{ ...styles.statValue, color: '#10b981' }}>{stats.approved}</div>
                <div style={styles.statLabel}>Approved</div>
              </div>
            </div>
            <div style={{ ...styles.statCard, borderBottomColor: '#ef4444' }}>
              <div style={styles.statIconWrapper}>
                <FiXCircle size={28} color="#ef4444" />
              </div>
              <div>
                <div style={{ ...styles.statValue, color: '#ef4444' }}>{stats.rejected}</div>
                <div style={styles.statLabel}>Rejected</div>
              </div>
            </div>
          </div>

          <div style={styles.filterBar}>
            <div style={styles.filterGroup}>
              <FiFilter size={16} color="#D23A01" />
              <select 
                value={filterStatus} 
                onChange={(e) => dispatch(setFilterStatus(e.target.value))}
                style={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            {positions.length > 0 && (
              <div style={styles.filterGroup}>
                <FiAward size={16} color="#023430" />
                <select 
                  value={filterPosition} 
                  onChange={(e) => dispatch(setFilterPosition(e.target.value))}
                  style={styles.filterSelect}
                >
                  <option value="">All Positions</option>
                  {positions.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}
            
            <button style={styles.refreshBtn} onClick={loadNominations}>
              <FiRefreshCw size={16} /> Refresh
            </button>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <FiAlertCircle size={18} />
              <span>{error}</span>
              <button onClick={() => dispatch(clearError())} style={styles.errorClose}>×</button>
            </div>
          )}

          {loading ? (
            <div style={styles.loader}>
              <div style={styles.spinner}></div>
              <p>Loading nominations...</p>
            </div>
          ) : nominations.length === 0 ? (
            <div style={styles.emptyState}>
              <FiInbox size={48} color="#cbd5e1" />
              <p>No nominations found for {getSelectedElectionTitle()}</p>
            </div>
          ) : (
            <>
              <div style={styles.cardsGrid}>
                {nominations.map(nom => {
                  const statusStyle = getStatusColor(nom.status);
                  const isSelected = selectedNomination?._id === nom._id;
                  return (
                    <div 
                      key={nom._id}
                      style={{ ...styles.nominationCard, ...(isSelected ? styles.nominationCardSelected : {}) }}
                      onClick={() => setSelectedNomination(nom)}
                    >
                      <div style={{ ...styles.cardStatusBadge, background: statusStyle.bg, color: statusStyle.color }}>
                        {statusStyle.icon} {statusStyle.text}
                      </div>
                      
                      <div style={styles.cardContent}>
                        <div style={styles.candidateAvatar}>
                          {renderCandidateAvatar(nom, 'large')}
                        </div>
                        
                        <div style={styles.candidateDetails}>
                          <h3 style={styles.candidateName}>
                            {nom.userId?.firstName} {nom.userId?.lastName}
                          </h3>
                          <div style={styles.positionBadge}>{nom.positionName}</div>
                          <div style={styles.candidateMeta}>
                            <span><FiCalendar size={12} /> {formatLocalDate(nom.submittedAt, false)}</span>
                            <span><FiMail size={12} /> {nom.userId?.email}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div style={styles.cardFooter}>
                        <button style={styles.viewDetailsBtn}>
                          <FiEye size={16} /> Review Application
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div style={styles.pagination}>
                  <button 
                    disabled={currentPage === 1} 
                    onClick={() => dispatch(setPage(currentPage - 1))}
                    style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    <FiChevronLeft size={16} /> Previous
                  </button>
                  <span style={styles.pageInfo}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => dispatch(setPage(currentPage + 1))}
                    style={{ ...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1 }}
                  >
                    Next <FiChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Modals */}
      {showModal && selectedNomination && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                {modalType === 'approve' ? <><FiCheckCircle size={20} /> Approve Nomination</> : <><FiXCircle size={20} /> Reject Nomination</>}
              </h3>
              <button style={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.modalCandidateInfo}>
                <div style={styles.modalAvatar}>
                  {renderCandidateAvatar(selectedNomination, 'small')}
                </div>
                <div>
                  <div style={styles.modalCandidateName}>
                    {selectedNomination.userId?.firstName} {selectedNomination.userId?.lastName}
                  </div>
                  <div style={styles.modalCandidatePosition}>
                    {selectedNomination.positionName}
                  </div>
                </div>
              </div>

              {modalType === 'reject' ? (
                <>
                  <label style={styles.modalLabel}>Rejection Reason <span style={{ color: '#dc2626' }}>*</span></label>
                  <textarea
                    placeholder="Please provide a clear reason for rejection..."
                    value={modalData.reason}
                    onChange={(e) => setModalData({ ...modalData, reason: e.target.value })}
                    rows={4}
                    style={styles.modalTextarea}
                  />
                  <label style={styles.modalLabel}>Admin Notes (Optional)</label>
                  <textarea
                    placeholder="Internal notes about this decision..."
                    value={modalData.notes}
                    onChange={(e) => setModalData({ ...modalData, notes: e.target.value })}
                    rows={2}
                    style={styles.modalTextarea}
                  />
                </>
              ) : (
                <>
                  <label style={styles.modalLabel}>Admin Comments (Optional)</label>
                  <textarea
                    placeholder="Any additional notes about this approval..."
                    value={modalData.notes}
                    onChange={(e) => setModalData({ ...modalData, notes: e.target.value })}
                    rows={2}
                    style={styles.modalTextarea}
                  />
                </>
              )}
            </div>
            
            <div style={styles.modalFooter}>
              <button style={styles.cancelModalBtn} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button 
                style={modalType === 'approve' ? styles.confirmApproveBtn : styles.confirmRejectBtn}
                onClick={modalType === 'approve' ? handleApprove : handleReject}
              >
                {modalType === 'approve' ? 'Approve Nomination' : 'Reject Nomination'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedNomination && !showModal && (
        <div style={styles.detailModalOverlay} onClick={() => setSelectedNomination(null)}>
          <div style={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.detailModalHeader}>
              <div style={styles.detailModalHeaderInfo}>
                <div style={styles.detailModalAvatar}>
                  {renderCandidateAvatar(selectedNomination, 'small')}
                </div>
                <div>
                  <h2 style={styles.detailModalTitle}>
                    {selectedNomination.userId?.firstName} {selectedNomination.userId?.lastName}
                  </h2>
                  <p style={styles.detailModalSubtitle}>{selectedNomination.positionName}</p>
                </div>
              </div>
              <button style={styles.detailModalClose} onClick={() => setSelectedNomination(null)}>×</button>
            </div>

            <div style={styles.detailModalBody}>
              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>Status</div>
                <span style={{ 
                  ...styles.detailStatusBadge, 
                  background: getStatusColor(selectedNomination.status).bg,
                  color: getStatusColor(selectedNomination.status).color
                }}>
                  {getStatusColor(selectedNomination.status).icon} {getStatusColor(selectedNomination.status).text}
                </span>
              </div>

              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>Candidate Information</div>
                <div style={styles.detailRow}>
                  <FiMail size={16} style={{ color: '#D23A01' }} />
                  <span>{selectedNomination.userId?.email}</span>
                </div>
                <div style={styles.detailRow}>
                  <FiPhone size={16} style={{ color: '#023430' }} />
                  <span>{selectedNomination.userId?.phone || 'Not provided'}</span>
                </div>
                <div style={styles.detailRow}>
                  <FiCalendar size={16} style={{ color: '#D23A01' }} />
                  <span>Submitted: {formatLocalDate(selectedNomination.submittedAt, false)}</span>
                </div>
              </div>

              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>Biography</div>
                <div style={styles.biography}>
                  {selectedNomination.biography || 'No biography provided'}
                </div>
              </div>

              <div style={styles.detailSection}>
                <div style={styles.sectionTitle}>Manifesto / Campaign Platform</div>
                <div style={styles.manifestoBox}>
                  {selectedNomination.manifesto || 'No manifesto provided'}
                </div>
              </div>

              {selectedNomination.supportingDocuments?.length > 0 && (
                <div style={styles.detailSection}>
                  <div style={styles.sectionTitle}>Supporting Documents</div>
                  <div style={styles.documentsList}>
                    {selectedNomination.supportingDocuments.map((doc, idx) => (
                      <div key={idx} style={styles.documentItem}>
                        <FiFileText size={16} />
                        <span>{doc.documentType}</span>
                        <button style={styles.viewDocBtn}>View Document</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedNomination.status === 'rejected' && selectedNomination.rejectionReason && (
                <div style={styles.detailSection}>
                  <div style={styles.sectionTitle}>Rejection Reason</div>
                  <div style={styles.rejectionBox}>
                    {selectedNomination.rejectionReason}
                  </div>
                </div>
              )}
            </div>

            {selectedNomination.status === 'pending' && (
              <div style={styles.detailModalFooter}>
                <button 
                  style={styles.rejectActionBtn} 
                  onClick={() => {
                    setModalType('reject');
                    setModalData({ reason: '', notes: '', ballotPosition: '' });
                    setShowModal(true);
                  }}
                >
                  <FiXCircle size={18} /> Reject Nomination
                </button>
                <button 
                  style={styles.approveActionBtn} 
                  onClick={() => {
                    setModalType('approve');
                    setModalData({ reason: '', notes: '', ballotPosition: '' });
                    setShowModal(true);
                  }}
                >
                  <FiCheckCircle size={18} /> Approve Candidate
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Avatar styles with image support
const avatarStyles = {
  candidateAvatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #D23A01, #D23A01cc)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '700',
    flexShrink: 0,
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(210, 58, 1, 0.3)'
  },
  modalAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #D23A01, #D23A01cc)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    overflow: 'hidden',
    flexShrink: 0
  },
  detailModalAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #D23A01, #D23A01cc)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '700',
    overflow: 'hidden',
    flexShrink: 0
  }
};

// Merge avatar styles with existing styles
const styles = {
  container: {
    padding: 'clamp(16px, 4vw, 32px)',
    maxWidth: '1200px',
    margin: '0 auto',
    marginTop: 'clamp(60px, 8vh, 80px)',
    background: '#f8fafc',
    minHeight: '100vh'
  },
  header: { marginBottom: 'clamp(24px, 5vw, 32px)' },
  title: { fontSize: 'clamp(24px, 5vw, 28px)', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' },
  subtitle: { fontSize: '15px', color: '#4a5568' },
  
  electionSelectorContainer: {
    marginBottom: 'clamp(24px, 5vw, 28px)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap'
  },
  electionSelect: {
    border: 'none',
    background: 'transparent',
    padding: '8px 12px',
    fontSize: '15px',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '250px',
    fontWeight: '500'
  },
  selectedElectionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 18px',
    background: '#FEF3F0',
    borderRadius: '24px',
    fontSize: '14px'
  },
  selectedElectionLabel: { fontWeight: '500', color: '#4a5568' },
  selectedElectionValue: { fontWeight: '600', color: '#D23A01' },
  
  noElections: { 
    textAlign: 'center', 
    padding: '60px', 
    background: 'white', 
    borderRadius: '20px', 
    color: '#4a5568',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '28px'
  },
  statCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0'
  },
  statIconWrapper: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    background: '#FEF3F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: { fontSize: 'clamp(24px, 5vw, 28px)', fontWeight: '800', color: '#1a1a1a' },
  statLabel: { fontSize: '14px', color: '#4a5568', marginTop: '4px', fontWeight: '500' },
  
  filterBar: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'white',
    padding: '10px 18px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  filterSelect: { border: 'none', background: 'transparent', padding: '6px', fontSize: '15px', outline: 'none', cursor: 'pointer', fontWeight: '500' },
  refreshBtn: { 
    padding: '10px 22px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontSize: '15px', 
    fontWeight: '600', 
    color: '#D23A01', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px'
  },
  
  errorBanner: { 
    background: '#fee2e2', 
    color: '#dc2626', 
    padding: '14px 18px', 
    borderRadius: '12px', 
    marginBottom: '20px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    fontSize: '15px'
  },
  errorClose: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#dc2626' },
  
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
    gap: '24px',
    marginBottom: '24px'
  },
  
  nominationCard: {
    position: 'relative',
    background: 'white',
    borderRadius: '20px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    minHeight: '280px'
  },
  
  nominationCardSelected: {
    borderColor: '#D23A01',
    boxShadow: '0 8px 25px rgba(210, 58, 1, 0.15)',
    transform: 'translateY(-2px)'
  },
  
  cardStatusBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '30px',
    fontSize: '13px',
    fontWeight: '700',
    zIndex: 1,
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  
  cardContent: {
    padding: '28px 24px 20px 24px',
    display: 'flex',
    gap: '18px',
    alignItems: 'center'
  },
  
  candidateAvatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #D23A01, #D23A01cc)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    fontWeight: '700',
    flexShrink: 0,
    overflow: 'hidden',
    boxShadow: '0 4px 10px rgba(210, 58, 1, 0.3)'
  },
  
  candidateDetails: {
    flex: 1,
    minWidth: 0
  },
  
  candidateName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '10px',
    lineHeight: 1.3
  },
  
  positionBadge: {
    display: 'inline-block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#D23A01',
    background: '#FEF3F0',
    padding: '5px 14px',
    borderRadius: '20px',
    marginBottom: '14px'
  },
  
  candidateMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '14px',
    color: '#4a5568'
  },
  
  cardFooter: {
    padding: '18px 24px 24px 24px',
    borderTop: '1px solid #f1f5f9',
    background: '#ffffff'
  },
  
  viewDetailsBtn: {
    width: '100%',
    padding: '14px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    color: '#D23A01',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s'
  },
  
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', padding: '20px', background: 'white', borderRadius: '12px', marginTop: '20px', border: '1px solid #e2e8f0' },
  pageBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '600' },
  pageInfo: { fontSize: '15px', color: '#4a5568', fontWeight: '500' },
  
  loader: { 
    textAlign: 'center', 
    padding: '80px', 
    color: '#4a5568', 
    background: 'white', 
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #D23A01',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  emptyState: { textAlign: 'center', padding: '80px', color: '#94a3b8', background: 'white', borderRadius: '20px' },
  
  detailModalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  detailModal: { background: 'white', borderRadius: '24px', width: '100%', maxWidth: '650px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' },
  detailModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', borderTopLeftRadius: '24px', borderTopRightRadius: '24px' },
  detailModalHeaderInfo: { display: 'flex', gap: '16px', alignItems: 'center' },
  detailModalAvatar: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #D23A01, #D23A01cc)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '700',
    overflow: 'hidden',
    flexShrink: 0
  },
  detailModalTitle: { fontSize: '20px', fontWeight: '800', color: 'white', marginBottom: '4px' },
  detailModalSubtitle: { fontSize: '13px', opacity: 0.8 },
  detailModalClose: { background: 'rgba(255, 255, 255, 0.1)', border: 'none', fontSize: '28px', cursor: 'pointer', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  detailModalBody: { padding: '24px' },
  detailSection: { marginBottom: '24px' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#1a1a1a', marginBottom: '12px', display: 'flex', alignIitems: 'center', gap: '8px', paddingBottom: '8px', borderBottom: '1px solid #e2e8f0' },
  detailStatusBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '24px', fontSize: '13px', fontWeight: '600' },
  detailRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', fontSize: '15px', color: '#1a1a1a' },
  biography: { fontSize: '15px', color: '#4a5568', lineHeight: '1.6', padding: '12px', background: '#f8fafc', borderRadius: '12px' },
  manifestoBox: { padding: '16px', background: '#f8fafc', borderRadius: '12px', fontSize: '15px', lineHeight: '1.6', color: '#1a1a1a' },
  documentsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  documentItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '12px', fontSize: '14px' },
  viewDocBtn: { marginLeft: 'auto', padding: '6px 14px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '500' },
  rejectionBox: { padding: '14px', background: '#fef2f2', borderRadius: '12px', borderLeft: '3px solid #dc2626', fontSize: '14px', color: '#991b1b' },
  detailModalFooter: { display: 'flex', gap: '12px', padding: '20px 24px', borderTop: '1px solid #e2e8f0', background: '#fafafa', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' },
  rejectActionBtn: { flex: 1, padding: '12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' },
  approveActionBtn: { flex: 1, padding: '12px', background: '#dcfce7', color: '#059669', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '15px' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal: { background: 'white', borderRadius: '20px', width: '90%', maxWidth: '550px', overflow: 'hidden' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' },
  modalTitle: { fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' },
  modalClose: { background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: '#94a3b8' },
  modalBody: { padding: '24px' },
  modalCandidateInfo: { display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', marginBottom: '20px' },
  modalAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #D23A01, #D23A01cc)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    overflow: 'hidden',
    flexShrink: 0
  },
  modalCandidateName: { fontSize: '18px', fontWeight: '700', color: '#1a1a1a' },
  modalCandidatePosition: { fontSize: '14px', color: '#4a5568' },
  modalLabel: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#1a1a1a', marginBottom: '8px' },
  modalInput: { width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', marginBottom: '16px' },
  modalTextarea: { width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '15px', resize: 'vertical', fontFamily: 'inherit', marginBottom: '16px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 24px', borderTop: '1px solid #e2e8f0', background: '#fafafa' },
  cancelModalBtn: { padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '500' },
  confirmApproveBtn: { padding: '10px 24px', background: '#D23A01', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' },
  confirmRejectBtn: { padding: '10px 24px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' }
};

// Add keyframe animation for spinner
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
if (!document.head.querySelector('#manage-nominations-styles')) {
  styleSheet.id = 'manage-nominations-styles';
  document.head.appendChild(styleSheet);
}

export default ManageNominations;