// pages/electionAdmin/ManageCandidates.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiArrowLeft, FiSearch, FiRefreshCw, FiEye, FiEdit2, FiTrash2, 
  FiCheckCircle, FiXCircle, FiLoader, FiAlertCircle, FiUser, 
  FiMail, FiPhone, FiFileText, FiCalendar, FiAward, FiTrendingUp,
  FiCheck, FiX, FiHome, FiChevronLeft, FiChevronRight, FiImage
} from 'react-icons/fi';
import { formatLocalDate } from '../../utils/formatLocalDate';
import { fetchAllElections } from '../../Js/election-slice';
import { nominationService } from '../../services/nominationService';
import CandidateModal from '../../components/candidate/CandidateModal';
import ErrorModal from '../../components/ErrorModal';

const API_BASE_URL = import.meta.env.VITE_API_URL_UPLOAD || 'http://localhost:4001';

const ManageCandidates = () => {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEmbedded = !!electionId;

  const { elections, loading: electionsLoading } = useSelector((state) => state.election);

  const [candidates, setCandidates] = useState([]);
  const [selectedElection, setSelectedElection] = useState(electionId || '');
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('');
  const [positionOptions, setPositionOptions] = useState([]);
  const [stats, setStats] = useState(null);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminComments, setAdminComments] = useState('');
  
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [hoveredRowPosition, setHoveredRowPosition] = useState({ top: 0, left: 0 });
  const rowRefs = useRef({});
  const hoverTimerRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

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

  const shouldDisableEditDelete = (candidateStatus) => {
    if (!election) return false;
    
    if (candidateStatus === 'approved') {
      const editableElectionStatuses = ['draft', 'voting_started', 'voting_completed', 'published'];
      const isElectionEditable = editableElectionStatuses.includes(election.status);
      return !isElectionEditable;
    }
    
    return false;
  };

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const closeAllModals = () => {
    setShowDetailModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowApproveModal(false);
    setShowRejectModal(false);
    setSelectedCandidate(null);
    setHoveredRowId(null);
  };

  const handleRowMouseEnter = (candidateId, event) => {
    clearHoverTimer();
    const rowElement = rowRefs.current[candidateId];
    if (rowElement) {
      const rect = rowElement.getBoundingClientRect();
      setHoveredRowPosition({
        top: rect.top + window.scrollY + 8,
        left: rect.right - 250
      });
    }
    setHoveredRowId(candidateId);
  };

  const handleRowMouseLeave = () => {
    clearHoverTimer();
    hoverTimerRef.current = setTimeout(() => {
      setHoveredRowId(null);
    }, 150);
  };

  const handleOverlayMouseEnter = () => {
    clearHoverTimer();
  };

  const handleOverlayMouseLeave = () => {
    clearHoverTimer();
    setHoveredRowId(null);
  };

  useEffect(() => {
    if (!isEmbedded && elections.length === 0) {
      dispatch(fetchAllElections());
    }
  }, [dispatch, isEmbedded, elections.length]);

  useEffect(() => {
    if (!isEmbedded && elections.length > 0 && !selectedElection) {
      const sortedElections = [...elections].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      if (sortedElections[0]) {
        setSelectedElection(sortedElections[0]._id);
      }
    }
  }, [elections, isEmbedded, selectedElection]);

  useEffect(() => {
    if (electionId && electionId !== selectedElection) {
      setSelectedElection(electionId);
    }
  }, [electionId, selectedElection]);

  useEffect(() => {
    if (error) {
      closeAllModals();
      setErrorModal({ isOpen: true, message: error });
    }
  }, [error]);

  const loadCandidates = useCallback(async () => {
    if (!selectedElection) return;
    
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: 20
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (positionFilter) params.positionId = positionFilter;
      if (searchTerm) params.search = searchTerm;
      
      const res = await nominationService.getNominationsByElection(selectedElection, params);
      
      const processedCandidates = (res.nominations || []).map(candidate => ({
        ...candidate,
        campaignPhotoUrl: getImageUrl(candidate.campaignPhoto)
      }));
      
      setCandidates(processedCandidates);
      setPositionOptions(res.filters?.positionOptions || []);
      setTotalPages(res.totalPages || 1);
      setTotalResults(res.total || 0);
      
      try {
        const electionData = await nominationService.getElectionById?.(selectedElection);
        setElection(electionData);
      } catch (err) {
        console.error('Error loading election:', err);
      }
      
      try {
        const statsRes = await nominationService.getCandidateStats?.(selectedElection);
        setStats(statsRes);
      } catch (err) {
        console.error('Error loading stats:', err);
      }
      
    } catch (error) {
      console.error('Error loading candidates:', error);
      const errorMsg = error.response?.data?.message || 'Failed to load candidates';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedElection, statusFilter, positionFilter, searchTerm, currentPage]);

  useEffect(() => {
    if (selectedElection) {
      loadCandidates();
    }
  }, [loadCandidates, selectedElection]);

  const handleElectionChange = (e) => {
    const newId = e.target.value;
    setSelectedElection(newId);
    setPositionFilter('');
    setStatusFilter('all');
    setSearchTerm('');
    setCurrentPage(1);
    setError(null);
    
    if (isEmbedded && newId) {
      navigate(`/electionAdmin/elections/${newId}/candidates`);
    }
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await nominationService.approveNomination(selectedCandidate._id, {
        adminComments,
        ballotPosition: Math.floor(Math.random() * 100) + 1
      });
      showToast('Candidate approved successfully');
      setShowApproveModal(false);
      setAdminComments('');
      loadCandidates();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to approve candidate';
      showToast(errorMsg, 'error');
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      showToast('Rejection reason is required', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await nominationService.rejectNomination(selectedCandidate._id, {
        rejectionReason,
        adminComments
      });
      showToast('Candidate rejected successfully');
      setShowRejectModal(false);
      setRejectionReason('');
      setAdminComments('');
      loadCandidates();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to reject candidate';
      showToast(errorMsg, 'error');
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      await nominationService.updateCandidate?.(selectedCandidate._id, {
        adminComments
      });
      showToast('Candidate updated successfully');
      setShowEditModal(false);
      loadCandidates();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update candidate';
      showToast(errorMsg, 'error');
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      if (nominationService.deleteCandidate) {
        await nominationService.deleteCandidate(selectedCandidate._id);
      } else {
        await axiosPrivate.delete(`/candidate/admin/candidate/${selectedCandidate._id}`);
      }
      showToast('Candidate deleted successfully');
      setShowDeleteModal(false);
      setSelectedCandidate(null);
      loadCandidates();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete candidate';
      showToast(errorMsg, 'error');
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: '#fef3c7', color: '#92400e', icon: <FiLoader size={12} />, text: 'PENDING' },
      approved: { bg: '#dcfce7', color: '#166534', icon: <FiCheck size={12} />, text: 'APPROVED' },
      rejected: { bg: '#fee2e2', color: '#991b1b', icon: <FiX size={12} />, text: 'REJECTED' },
      withdrawn: { bg: '#f1f5f9', color: '#475569', icon: <FiAlertCircle size={12} />, text: 'WITHDRAWN' }
    };
    const c = config[status] || config.pending;
    return (
      <span style={{ ...styles.statusBadge, backgroundColor: c.bg, color: c.color }}>
        {c.icon} {c.text}
      </span>
    );
  };

  const renderCandidateAvatar = (candidate) => {
    const imageUrl = candidate.campaignPhotoUrl;
    const initials = `${candidate.userId?.firstName?.[0] || ''}${candidate.userId?.lastName?.[0] || ''}`;
    
    if (imageUrl) {
      return (
        <img 
          src={imageUrl}
          alt={initials}
          style={styles.candidateAvatarImage}
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    }
    
    return (
      <div style={styles.candidateAvatarFallback}>
        {initials || '?'}
      </div>
    );
  };

  if (electionsLoading && !isEmbedded && elections.length === 0) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p>Loading elections...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {toast && (
        <div style={{ ...styles.toast, backgroundColor: toast.type === 'error' ? '#dc2626' : '#D23A01' }}>
          <span>{toast.message}</span>
        </div>
      )}

      <ErrorModal 
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={() => {
          setErrorModal({ isOpen: false, message: '' });
          setError(null);
        }}
        title="Error"
        icon="error"
      />

      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Manage Candidates</h1>
          {election && <p style={styles.subtitle}>{election.title}</p>}
        </div>
        <div style={styles.headerActions}>
          <button onClick={loadCandidates} style={styles.refreshBtn} disabled={loading}>
            <FiRefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh
          </button>
          {isEmbedded && (
            <button onClick={() => navigate('/electionAdmin/dashboard')} style={styles.dashboardBtn}>
              <FiHome size={16} /> Dashboard
            </button>
          )}
        </div>
      </div>

      {!isEmbedded && (
        <div style={styles.electionSelector}>
          <div style={styles.electionSelectorContent}>
            <FiAward size={18} color="#D23A01" />
            <span style={styles.electionLabel}>Select Election:</span>
            <select 
              value={selectedElection} 
              onChange={handleElectionChange} 
              style={styles.electionSelect}
              disabled={loading}
            >
              <option value="">-- Select an Election --</option>
              {[...elections]
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .map(e => (
                  <option key={e._id} value={e._id}>
                    {e.title}
                  </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {error && selectedElection && !errorModal.isOpen && (
        <div style={styles.errorBanner}>
          <FiAlertCircle size={18} />
          <span>{error}</span>
          <button onClick={() => setError(null)} style={styles.errorBannerClose}>×</button>
        </div>
      )}

      {stats && selectedElection && !error && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <FiUser size={24} color="#D23A01" />
            <div style={styles.statValue}>{stats.total || 0}</div>
            <div style={styles.statLabel}>Total Nominations</div>
          </div>
          <div style={{...styles.statCard, backgroundColor: '#fef3c7'}}>
            <FiLoader size={24} color="#92400e" />
            <div style={styles.statValue}>{stats.pending || 0}</div>
            <div style={styles.statLabel}>Pending Review</div>
          </div>
          <div style={{...styles.statCard, backgroundColor: '#dcfce7'}}>
            <FiCheckCircle size={24} color="#166534" />
            <div style={styles.statValue}>{stats.approved || 0}</div>
            <div style={styles.statLabel}>Approved</div>
          </div>
          <div style={{...styles.statCard, backgroundColor: '#fee2e2'}}>
            <FiXCircle size={24} color="#991b1b" />
            <div style={styles.statValue}>{stats.rejected || 0}</div>
            <div style={styles.statLabel}>Rejected</div>
          </div>
        </div>
      )}

      {loading && selectedElection && (
        <div style={styles.loaderContainer}>
          <div style={styles.spinner}></div>
          <p>Loading candidates...</p>
        </div>
      )}

      {!loading && selectedElection && !error && (
        <>
          <div style={styles.filterBar}>
            <div style={styles.searchWrapper}>
              <FiSearch size={16} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by candidate name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadCandidates()}
                style={styles.searchInput}
              />
            </div>
            
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterSelect}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>

            {positionOptions.length > 0 && (
              <select value={positionFilter} onChange={(e) => setPositionFilter(e.target.value)} style={styles.filterSelect}>
                <option value="">All Positions</option>
                {positionOptions.map(pos => (
                  <option key={pos.positionId} value={pos.positionId}>{pos.positionName}</option>
                ))}
              </select>
            )}

            <button onClick={loadCandidates} style={styles.searchBtn}>
              <FiSearch size={16} /> Search
            </button>
          </div>

          <div style={styles.resultsInfo}>
            <span>Showing {candidates.length} of {totalResults} candidates</span>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.tableHeader}>Candidate</th>
                  <th style={styles.tableHeader}>Position</th>
                  <th style={styles.tableHeader}>Contact</th>
                  <th style={styles.tableHeader}>Submitted</th>
                  <th style={styles.tableHeader}>Status</th>
                </tr>
              </thead>
              <tbody>
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={styles.noData}>
                      <FiAlertCircle size={32} />
                      <p>No candidates found</p>
                    </td>
                  </tr>
                ) : (
                  candidates.map(candidate => {
                    const disableEditDelete = shouldDisableEditDelete(candidate.status);
                    return (
                      <tr 
                        key={candidate._id} 
                        ref={(el) => rowRefs.current[candidate._id] = el}
                        style={styles.tableRow}
                        onMouseEnter={(e) => handleRowMouseEnter(candidate._id, e)}
                        onMouseLeave={handleRowMouseLeave}
                      >
                        <td style={styles.tableCell}>
                          <div style={styles.candidateCell}>
                            <div style={styles.candidateAvatar}>
                              {renderCandidateAvatar(candidate)}
                            </div>
                            <div style={styles.candidateName}>
                              {candidate.userId?.firstName} {candidate.userId?.lastName}
                            </div>
                          </div>
                        </td>
                        <td style={styles.tableCell}>
                          <span style={styles.positionBadge}>{candidate.positionName}</span>
                        </td>
                        <td style={styles.tableCell}>
                          <div style={styles.contactInfo}>
                            <div><FiMail size={12} /> {candidate.userId?.email}</div>
                            <div><FiPhone size={12} /> {candidate.userId?.phone || '-'}</div>
                          </div>
                        </td>
                        <td style={styles.tableCell}>{formatLocalDate(candidate.submittedAt, true)}</td>
                        <td style={styles.tableCell}>{getStatusBadge(candidate.status)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1}}>
                <FiChevronLeft size={16} /> Previous
              </button>
              <span style={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1}}>
                Next <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Floating Action Overlay */}
      {hoveredRowId && (
        <div 
          style={{
            ...styles.floatingActions,
            top: hoveredRowPosition.top,
            left: hoveredRowPosition.left,
          }}
          onMouseEnter={handleOverlayMouseEnter}
          onMouseLeave={handleOverlayMouseLeave}
        >
          {(() => {
            const candidate = candidates.find(c => c._id === hoveredRowId);
            if (!candidate) return null;
            const disableEditDelete = shouldDisableEditDelete(candidate.status);
            
            return (
              <>
                <button
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setShowDetailModal(true);
                    setHoveredRowId(null);
                    clearHoverTimer();
                  }}
                  style={styles.floatingActionBtn}
                  title="View Details"
                >
                  <FiEye size={16} />
                </button>
                
                {candidate.status === 'pending' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setShowApproveModal(true);
                        setHoveredRowId(null);
                        clearHoverTimer();
                      }}
                      style={{...styles.floatingActionBtn, color: '#10b981'}}
                      title="Approve"
                    >
                      <FiCheck size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setShowRejectModal(true);
                        setHoveredRowId(null);
                        clearHoverTimer();
                      }}
                      style={{...styles.floatingActionBtn, color: '#dc2626'}}
                      title="Reject"
                    >
                      <FiX size={16} />
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => {
                    if (!disableEditDelete) {
                      setSelectedCandidate(candidate);
                      setAdminComments(candidate.adminComments || '');
                      setShowEditModal(true);
                      setHoveredRowId(null);
                      clearHoverTimer();
                    }
                  }}
                  style={{
                    ...styles.floatingActionBtn,
                    opacity: disableEditDelete ? 0.4 : 1,
                    cursor: disableEditDelete ? 'not-allowed' : 'pointer'
                  }}
                  disabled={disableEditDelete}
                  title={disableEditDelete ? "Edit disabled - Election is locked" : "Edit"}
                >
                  <FiEdit2 size={16} />
                </button>
                
                <button
                  onClick={() => {
                    if (!disableEditDelete) {
                      setSelectedCandidate(candidate);
                      setShowDeleteModal(true);
                      setHoveredRowId(null);
                      clearHoverTimer();
                    }
                  }}
                  style={{
                    ...styles.floatingActionBtn,
                    color: '#dc2626',
                    opacity: disableEditDelete ? 0.4 : 1,
                    cursor: disableEditDelete ? 'not-allowed' : 'pointer'
                  }}
                  disabled={disableEditDelete}
                  title={disableEditDelete ? "Delete disabled - Election is locked" : "Delete"}
                >
                  <FiTrash2 size={16} />
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Modals */}
      <CandidateModal candidate={selectedCandidate} isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedCandidate(null); }} />
      
      {showEditModal && selectedCandidate && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Edit Candidate</h3>
              <button onClick={() => setShowEditModal(false)} style={styles.modalClose}>×</button>
            </div>
            <div style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label>Admin Comments (Internal)</label>
                <textarea 
                  value={adminComments} 
                  onChange={(e) => setAdminComments(e.target.value)} 
                  placeholder="Add internal notes..." 
                  rows={3} 
                  style={styles.textarea} 
                />
              </div>
              <div style={styles.modalActions}>
                <button onClick={() => setShowEditModal(false)} style={styles.cancelBtn}>Cancel</button>
                <button onClick={handleUpdate} disabled={submitting} style={styles.submitBtn}>
                  {submitting ? <FiLoader size={16} className="spin" /> : <FiCheck size={16} />} Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showApproveModal && selectedCandidate && (
        <div style={styles.modalOverlay} onClick={() => setShowApproveModal(false)}>
          <div style={{...styles.modal, maxWidth: '500px'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Approve Candidate</h3>
              <button onClick={() => setShowApproveModal(false)} style={styles.modalClose}>×</button>
            </div>
            <div style={styles.modalBody}>
              <FiCheckCircle size={48} color="#10b981" />
              <p>Approve <strong>{selectedCandidate.userId?.firstName} {selectedCandidate.userId?.lastName}</strong> for <strong>{selectedCandidate.positionName}</strong>?</p>
              <div style={styles.formGroup}>
                <label>Admin Comments (Optional)</label>
                <textarea 
                  value={adminComments} 
                  onChange={(e) => setAdminComments(e.target.value)} 
                  placeholder="Add any comments..." 
                  rows={2} 
                  style={styles.textarea} 
                />
              </div>
              <p style={styles.warningText}>Candidate will receive an email notification.</p>
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setShowApproveModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleApprove} disabled={submitting} style={{...styles.submitBtn, backgroundColor: '#10b981'}}>
                {submitting ? <FiLoader size={16} className="spin" /> : <FiCheck size={16} />} Approve Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && selectedCandidate && (
        <div style={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div style={{...styles.modal, maxWidth: '500px'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Reject Candidate</h3>
              <button onClick={() => setShowRejectModal(false)} style={styles.modalClose}>×</button>
            </div>
            <div style={styles.modalBody}>
              <FiXCircle size={48} color="#dc2626" />
              <p>Reject <strong>{selectedCandidate.userId?.firstName} {selectedCandidate.userId?.lastName}</strong> for <strong>{selectedCandidate.positionName}</strong>?</p>
              <div style={styles.formGroup}>
                <label>Rejection Reason <span style={styles.required}>*</span></label>
                <textarea 
                  value={rejectionReason} 
                  onChange={(e) => setRejectionReason(e.target.value)} 
                  placeholder="Explain why this nomination is being rejected..." 
                  rows={3} 
                  style={styles.textarea} 
                  required 
                />
                <p style={styles.helperText}>This reason will be shared with the candidate.</p>
              </div>
              <div style={styles.formGroup}>
                <label>Admin Comments (Internal)</label>
                <textarea 
                  value={adminComments} 
                  onChange={(e) => setAdminComments(e.target.value)} 
                  placeholder="Internal notes..." 
                  rows={2} 
                  style={styles.textarea} 
                />
              </div>
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setShowRejectModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleReject} disabled={submitting} style={{...styles.submitBtn, backgroundColor: '#dc2626'}}>
                {submitting ? <FiLoader size={16} className="spin" /> : <FiX size={16} />} Reject Candidate
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && selectedCandidate && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={{...styles.modal, maxWidth: '400px'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Delete Candidate</h3>
              <button onClick={() => setShowDeleteModal(false)} style={styles.modalClose}>×</button>
            </div>
            <div style={styles.modalBody}>
              <FiAlertCircle size={48} color="#dc2626" />
              <p>Delete <strong>{selectedCandidate.userId?.firstName} {selectedCandidate.userId?.lastName}</strong>?</p>
              <p style={styles.warningText}>This action cannot be undone.</p>
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setShowDeleteModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleDelete} disabled={submitting} style={{...styles.submitBtn, backgroundColor: '#dc2626'}}>
                {submitting ? <FiLoader size={16} className="spin" /> : <FiTrash2 size={16} />} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } 
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

const styles = {
  container: { padding: '32px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f8fafc' },
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' },
  spinner: { width: '48px', height: '48px', border: '3px solid #e5e7eb', borderTop: '3px solid #D23A01', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  toast: { position: 'fixed', top: '80px', right: '20px', padding: '12px 20px', borderRadius: '10px', color: 'white', fontSize: '14px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' },
  headerActions: { display: 'flex', gap: '12px' },
  title: { fontSize: '28px', fontWeight: '700', margin: 0, color: '#1a1a1a' },
  subtitle: { fontSize: '14px', color: '#6b7280', marginTop: '4px' },
  refreshBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '500' },
  dashboardBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#D23A01', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '500' },
  electionSelector: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  electionSelectorContent: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
  electionLabel: { fontWeight: '600', fontSize: '14px', color: '#1a1a1a' },
  electionSelect: { flex: 1, maxWidth: '400px', padding: '12px 16px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: 'white' },
  errorBanner: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' },
  errorBannerClose: { marginLeft: 'auto', background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#dc2626' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' },
  statCard: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  statValue: { fontSize: '32px', fontWeight: '700', margin: '8px 0', color: '#1a1a1a' },
  statLabel: { fontSize: '13px', color: '#6b7280' },
  filterBar: { display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' },
  searchWrapper: { flex: 1, position: 'relative', maxWidth: '350px' },
  searchIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' },
  searchInput: { width: '100%', padding: '12px 16px 12px 40px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none' },
  filterSelect: { padding: '12px 20px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px' },
  searchBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#D23A01', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '500' },
  resultsInfo: { marginBottom: '16px', fontSize: '13px', color: '#6b7280' },
  tableWrapper: { backgroundColor: 'white', borderRadius: '16px', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  tableHeaderRow: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' },
  tableHeader: { textAlign: 'left', padding: '16px', fontWeight: '700', fontSize: '14px', color: '#1a1a1a' },
  tableRow: { borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' },
  tableCell: { padding: '16px', fontSize: '14px', color: '#1a1a1a', verticalAlign: 'middle' },
  candidateCell: { display: 'flex', alignItems: 'center', gap: '12px' },
  candidateAvatar: { width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#D23A01', flexShrink: 0 },
  candidateAvatarImage: { width: '100%', height: '100%', objectFit: 'cover' },
  candidateAvatarFallback: { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#D23A01', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700' },
  candidateName: { fontWeight: '600', fontSize: '14px' },
  positionBadge: { padding: '4px 12px', backgroundColor: '#f1f5f9', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
  contactInfo: { fontSize: '12px', color: '#6b7280', lineHeight: '1.6' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' },
  noData: { textAlign: 'center', padding: '60px', color: '#9ca3af' },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px', padding: '16px' },
  pageBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' },
  pageInfo: { fontSize: '14px', color: '#6b7280' },
  floatingActions: {
    position: 'absolute',
    display: 'flex',
    gap: '8px',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '6px 12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid #e5e7eb',
    zIndex: 100,
    backdropFilter: 'blur(8px)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  floatingActionBtn: {
    padding: '8px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal: { backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '550px', maxHeight: '90vh', overflow: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e5e7eb' },
  modalClose: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' },
  modalBody: { textAlign: 'center', padding: '24px' },
  modalForm: { padding: '20px' },
  formGroup: { marginBottom: '20px' },
  input: { width: '100%', padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none' },
  textarea: { width: '100%', padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  helperText: { fontSize: '11px', color: '#9ca3af', marginTop: '4px' },
  required: { color: '#D23A01' },
  modalActions: { display: 'flex', gap: '12px', marginTop: '20px', padding: '16px 20px', borderTop: '1px solid #e5e7eb' },
  cancelBtn: { flex: 1, padding: '12px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },
  submitBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#D23A01', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },
  warningText: { fontSize: '13px', color: '#dc2626', marginTop: '8px' }
};

export default ManageCandidates;