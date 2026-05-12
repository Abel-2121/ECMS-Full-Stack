// frontend/src/pages/CandidateHistoryDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiAward, FiCalendar, FiEye, FiFileText, FiClock,
  FiCheckCircle, FiXCircle, FiUser, FiTrendingUp,
  FiChevronLeft, FiChevronRight,
  FiSearch, FiFilter, FiLogOut, FiPhoneCall,
  FiAlertCircle, FiImage
} from 'react-icons/fi';
import { fetchCandidateHistory } from '../../Js/nomination-slice';
import { useNavigate } from 'react-router-dom';

const CandidateHistoryDashboard = () => {
  const dispatch = useDispatch();
 const navigate= useNavigate()
  const { historyData, loading, error } = useSelector((state) => state.nomination);
  const [selectedNomination, setSelectedNomination] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    dispatch(fetchCandidateHistory());
  }, [dispatch]);

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

  const formatRelativeTime = (date) => {
    const now = new Date();
    const voteDate = new Date(date);
    const diffMs = now - voteDate;
    const diffDays = Math.floor(diffMs / 86400000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return formatLocalDate(date);
  };

  const getNominationStatus = (nomination) => {
    const status = nomination.status;
    const result = nomination.result;
    
    if (status === 'elected' || result === 'won') {
      return { label: 'Won', color: '#D23A01', bg: '#FEF3F0', icon: <FiAward size={12} /> };
    }
    if (status === 'approved' && result === 'participated') {
      return { label: 'Participated', color: '#6b7280', bg: '#f3f4f6', icon: <FiCheckCircle size={12} /> };
    }
    if (status === 'approved') {
      return { label: 'Approved', color: '#3b82f6', bg: '#dbeafe', icon: <FiCheckCircle size={12} /> };
    }
    if (status === 'pending') {
      return { label: 'Pending', color: '#f59e0b', bg: '#fef3c7', icon: <FiClock size={12} /> };
    }
    if (status === 'rejected') {
      return { label: 'Rejected', color: '#ef4444', bg: '#fee2e2', icon: <FiXCircle size={12} /> };
    }
    if (status === 'withdrawn') {
      return { label: 'Withdrawn', color: '#94a3b8', bg: '#f1f5f9', icon: <FiXCircle size={12} /> };
    }
    return { label: status || 'Unknown', color: '#94a3b8', bg: '#f1f5f9', icon: <FiClock size={12} /> };
  };

  // Get user photo URL
  const getUserPhoto = () => {
    if (user?.photo) {
      return user.photo;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="history-loader-container" style={styles.loaderContainer}>
        <div className="history-spinner" style={styles.spinner}></div>
        <p>Loading your election history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-error-container" style={styles.errorContainer}>
        <FiAlertCircle size={48} style={{ color: '#ef4444' }} />
        <p>Error loading history: {error}</p>
        <button className="history-retry-btn" style={styles.retryBtn} onClick={() => dispatch(fetchCandidateHistory())}>
          Retry
        </button>
      </div>
    );
  }

  if (!historyData) return null;

  const { user, summary, nominations } = historyData;

  const filteredNominations = nominations?.filter(nom => {
    const matchesSearch = searchTerm === '' || 
      nom.election?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nom.positionName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'won' && (nom.result === 'won' || nom.status === 'elected')) ||
      (filterStatus === 'approved' && nom.status === 'approved' && nom.result !== 'won') ||
      (filterStatus === 'pending' && nom.status === 'pending') ||
      (filterStatus === 'rejected' && nom.status === 'rejected') ||
      (filterStatus === 'participated' && nom.result === 'participated');
    
    return matchesSearch && matchesFilter;
  }) || [];

  const totalPages = Math.ceil(filteredNominations.length / itemsPerPage);
  const paginatedNominations = filteredNominations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="history-dashboard-container" style={styles.container}>
      {/* Header */}
      <div className="history-header" style={styles.header}>
        <div>
          <h1 className="history-title" style={styles.title}>
            <FiAward size={32} style={{ color: '#D23A01' }} /> My Election History
          </h1>
          <p className="history-subtitle" style={styles.subtitle}>Track all your election participation and performance</p>
        </div>
        <div className="history-stats-cards" style={styles.statsCards}>
          <div className="history-stat-card" style={styles.statCard}>
            <div className="history-stat-value" style={styles.statValue}>{summary?.totalElections}</div>
            <div className="history-stat-label" style={styles.statLabel}>Elections Participated</div>
          </div>
          <div className="history-stat-card" style={styles.statCard}>
            <div className="history-stat-value" style={styles.statValue}>{summary?.totalVotes}</div>
            <div className="history-stat-label" style={styles.statLabel}>Total Votes Received</div>
          </div>
          <div className="history-stat-card" style={styles.statCard}>
            <div className="history-stat-value" style={styles.statValue}>{summary?.electionsWon}</div>
            <div className="history-stat-label" style={styles.statLabel}>Elections Won</div>
          </div>
          <div className="history-stat-card" style={styles.statCard}>
            <div className="history-stat-value" style={styles.statValue}>{summary?.winRate}%</div>
            <div className="history-stat-label" style={styles.statLabel}>Win Rate</div>
          </div>
        </div>
      </div>

      {/* Welcome Card with Photo */}
      <div className="history-welcome-card" style={styles.welcomeCard}>
        <div className="history-welcome-avatar" style={styles.welcomeAvatar}>
          {getUserPhoto() ? (
            <img 
              src={getUserPhoto()} 
              alt={user?.name} 
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <FiUser size={28} />
          )}
        </div>
        <div className="history-welcome-info" style={styles.welcomeInfo}>
          <h2 className="history-welcome-name" style={styles.welcomeName}>Welcome back, {user?.name || 'Candidate'}!</h2>
          <p className="history-welcome-email" style={styles.welcomeEmail}>{user?.email}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="history-search-section" style={styles.searchSection}>
        <div className="history-search-box" style={styles.searchBox}>
          <FiSearch size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search by election name or position..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="history-search-input"
            style={styles.searchInput} 
          />
        </div>
        <div className="history-filter-box" style={styles.filterBox}>
          <FiFilter size={18} color="#94a3b8" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="history-filter-select" style={styles.filterSelect}>
            <option value="all">All Elections</option>
            <option value="won">Won</option>
            <option value="approved">Approved</option>
            <option value="participated">Participated</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Active Election Alert */}
      {summary?.activeElection && (
        <div className="history-active-alert" style={styles.activeAlert}>
          <div className="history-alert-icon" style={styles.alertIcon}><FiClock size={20} /></div>
          <div className="history-alert-content" style={styles.alertContent}>
            <h3 className="history-alert-title" style={styles.alertTitle}>Active Election: {summary.activeElection.title}</h3>
            <p className="history-alert-text" style={styles.alertText}>
              Running for {summary.activeElection.position} • Voting ends in {summary.activeElection.daysRemaining} days
            </p>
          </div>
          <button className="history-alert-btn" style={styles.alertBtn}>View Election</button>
        </div>
      )}

      {/* Nominations List */}
      {filteredNominations.length === 0 ? (
        <div className="history-empty-state" style={styles.emptyState}>
          <div className="history-empty-icon" style={styles.emptyIcon}><FiFileText size={48} /></div>
          <h3>No Nominations Found</h3>
          <p>{(searchTerm || filterStatus !== 'all') ? "No nominations match your search criteria." : "You haven't submitted any nominations yet."}</p>
        </div>
      ) : (
        <>
          <div className="history-nominations-list" style={styles.nominationsList}>
            {paginatedNominations.map((nom, index) => {
              const status = getNominationStatus(nom);
              return (
                <div key={nom._id || index} className="history-nomination-card" style={styles.nominationCard}>
                  <div className="history-card-header" style={styles.cardHeader}>
                    <div className="history-election-info" style={styles.electionInfo}>
                      <div className="history-election-icon" style={styles.electionIcon}><FiAward size={24} /></div>
                      <div>
                        <h3 className="history-election-title" style={styles.electionTitle}>{nom.election?.title || 'Election'}</h3>
                        <div className="history-nomination-meta" style={styles.nominationMeta}>
                          <span className="history-meta-item" style={styles.metaItem}>
                            <FiCalendar size={12} /> {formatRelativeTime(nom.submittedAt)}
                          </span>
                          <span className="history-meta-item" style={styles.metaItem}>
                            <FiUser size={12} /> {nom.positionName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="history-status-badge" style={{ ...styles.statusBadge, background: status.bg, color: status.color }}>
                      {status.icon} {status.label}
                    </span>
                  </div>

                  <div className="history-card-body" style={styles.cardBody}>
                    <div className="history-stats-row" style={styles.statsRow}>
                      <div className="history-stat-item" style={styles.statItem}>
                        <span className="history-stat-item-label" style={styles.statItemLabel}>Votes Received</span>
                        <span className="history-stat-item-value" style={styles.statItemValue}>{nom.votesReceived || 0}</span>
                      </div>
                      <div className="history-stat-item" style={styles.statItem}>
                        <span className="history-stat-item-label" style={styles.statItemLabel}>Vote Percentage</span>
                        <span className="history-stat-item-value" style={styles.statItemValue}>{nom.votePercentage || 0}%</span>
                      </div>
                      <div className="history-stat-item" style={styles.statItem}>
                        <span className="history-stat-item-label" style={styles.statItemLabel}>Ranking</span>
                        <span className="history-stat-item-value" style={styles.statItemValue}>
                          {nom.ranking ? `#${nom.ranking}` : nom.electedRank ? `Elected #${nom.electedRank}` : '-'}
                        </span>
                      </div>
                    </div>

                    {nom.rejectionReason && (
                      <div className="history-rejection-note" style={styles.rejectionNote}>
                        <FiXCircle size={14} />
                        <span>Rejection Reason: {nom.rejectionReason}</span>
                      </div>
                    )}

                    {nom.adminComments && (
                      <div className="history-admin-note" style={styles.adminNote}>
                        <FiCheckCircle size={14} />
                        <span>Admin Comments: {nom.adminComments}</span>
                      </div>
                    )}
                  </div>

                  <div className="history-card-footer" style={styles.cardFooter}>
                    <button className="history-view-btn" style={styles.viewBtn} onClick={() => setSelectedNomination(nom)}>
                      <FiEye size={14} /> View Details
                    </button>
                    {nom.status === 'pending' && (
                      <button className="history-withdraw-btn" style={styles.withdrawBtn}>
                        <FiLogOut size={14} /> Withdraw
                      </button>
                    )}
                    {nom.status === 'rejected' && (
                      <button className="history-appeal-btn" style={styles.appealBtn}>
                        <FiPhoneCall size={14} /> Appeal
                      </button>
                    )}
                    {nom.election?.status === 'results_published' && (
                      <button className="history-results-btn" style={styles.resultsBtn}
                      onClick={()=>navigate(`/candidate/results`)}>
                      
                        <FiAward size={14} /> View Results
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="history-pagination" style={styles.pagination}>
              <button 
                className="history-page-btn"
                style={{ ...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1 }} 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <FiChevronLeft size={16} /> Previous
              </button>
              <span className="history-page-info" style={styles.pageInfo}>Page {currentPage} of {totalPages}</span>
              <button 
                className="history-page-btn"
                style={{ ...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1 }}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Next <FiChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal for Details */}
      {selectedNomination && (
        <div className="history-modal-overlay" style={styles.modalOverlay} onClick={() => setSelectedNomination(null)}>
          <div className="history-modal" style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className="history-modal-close" style={styles.modalClose} onClick={() => setSelectedNomination(null)}>×</button>
            <div className="history-modal-header" style={styles.modalHeader}>
              <h3 style={{color:"#fff"}}>Your Nomination Details</h3>
            </div>
            <div className="history-modal-body" style={styles.modalBody}>
              <div className="history-detail-row" style={styles.detailRow}>
                <span className="history-detail-label" style={styles.detailLabel}>Election:</span>
                <span>{selectedNomination.election?.title || 'Unknown'}</span>
              </div>
              <div className="history-detail-row" style={styles.detailRow}>
                <span className="history-detail-label" style={styles.detailLabel}>Position:</span>
                <span>{selectedNomination.positionName}</span>
              </div>
              <div className="history-detail-row" style={styles.detailRow}>
                <span className="history-detail-label" style={styles.detailLabel}>Status:</span>
                <span style={{ color: '#D23A01', fontWeight: 'bold' }}>{selectedNomination.status}</span>
              </div>
              <div className="history-detail-row" style={styles.detailRow}>
                <span className="history-detail-label" style={styles.detailLabel}>Submitted:</span>
                <span>{formatLocalDate(selectedNomination.submittedAt, true)}</span>
              </div>
              <div className="history-detail-row" style={styles.detailRow}>
                <span className="history-detail-label" style={styles.detailLabel}>Votes Received:</span>
                <span><strong>{selectedNomination.votesReceived || 0}</strong></span>
              </div>
              {selectedNomination.votePercentage > 0 && (
                <div className="history-detail-row" style={styles.detailRow}>
                  <span className="history-detail-label" style={styles.detailLabel}>Vote Percentage:</span>
                  <span>{selectedNomination.votePercentage}%</span>
                </div>
              )}
              {selectedNomination.ranking && (
                <div className="history-detail-row" style={styles.detailRow}>
                  <span className="history-detail-label" style={styles.detailLabel}>Ranking:</span>
                  <span>#{selectedNomination.ranking}</span>
                </div>
              )}
              {selectedNomination.reviewedAt && (
                <div className="history-detail-row" style={styles.detailRow}>
                  <span className="history-detail-label" style={styles.detailLabel}>Reviewed:</span>
                  <span>{formatLocalDate(selectedNomination.reviewedAt, true)}</span>
                </div>
              )}
              {selectedNomination.adminComments && (
                <div className="history-detail-row" style={styles.detailRow}>
                  <span className="history-detail-label" style={styles.detailLabel}>Comments:</span>
                  <span>{selectedNomination.adminComments}</span>
                </div>
              )}
              {selectedNomination.rejectionReason && (
                <div className="history-detail-row" style={styles.detailRow}>
                  <span className="history-detail-label" style={styles.detailLabel}>Rejection:</span>
                  <span style={{ color: '#ef4444' }}>{selectedNomination.rejectionReason}</span>
                </div>
              )}
              
              <div className="history-detail-divider" style={styles.detailDivider}></div>
              
              <h4 className="history-detail-subtitle" style={styles.detailSubtitle}>Manifesto</h4>
              <p className="history-detail-text" style={styles.detailText}>{selectedNomination.manifesto || 'No manifesto provided'}</p>
              
              {selectedNomination.biography && (
                <>
                  <h4 className="history-detail-subtitle" style={styles.detailSubtitle}>Biography</h4>
                  <p className="history-detail-text" style={styles.detailText}>{selectedNomination.biography}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULLY RESPONSIVE CSS - WITH CLASS NAMES FOR MOBILE */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* MOBILE RESPONSIVE STYLES - 768px AND BELOW */
        @media (max-width: 768px) {
          /* Container */
          .history-dashboard-container {
            padding: 12px !important;
            margin-top: 60px !important;
          }
          
          /* Header */
          .history-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
            margin-bottom: 20px !important;
          }
          
          .history-title {
            font-size: 20px !important;
          }
          
          .history-title svg {
            width: 24px !important;
            height: 24px !important;
          }
          
          .history-subtitle {
            font-size: 13px !important;
          }
          
          /* Stats Cards - 2 columns on mobile */
          .history-stats-cards {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            width: 100% !important;
            gap: 12px !important;
          }
          
          .history-stat-card {
            padding: 10px 16px !important;
            min-width: auto !important;
          }
          
          .history-stat-value {
            font-size: 22px !important;
          }
          
          .history-stat-label {
            font-size: 13px !important;
            font-weight:"700";
            color:"#000";
          }
          
          /* Welcome Card */
          .history-welcome-card {
            padding: 14px 18px !important;
            gap: 12px !important;
          }
          
          .history-welcome-avatar {
            width: 48px !important;
            height: 48px !important;
          }
          
          .history-welcome-name {
            font-size: 16px !important;
          }
          
          .history-welcome-email {
            font-size: 12px !important;
          }
          
          /* Search Section - Stack vertically */
          .history-search-section {
            flex-direction: column !important;
            gap: 12px !important;
          }
          
          .history-search-box, .history-filter-box {
            width: 100% !important;
            flex: auto !important;
            padding: 10px 14px !important;
          }
          
          .history-search-input, .history-filter-select {
            font-size: 13px !important;
          }
          
          /* Active Alert */
          .history-active-alert {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 14px !important;
          }
          
          .history-alert-btn {
            width: 100% !important;
            text-align: center !important;
          }
          
          /* Nomination Card */
          .history-card-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            padding: 14px !important;
          }
          
          .history-election-info {
            flex-wrap: wrap !important;
          }
          
          .history-election-title {
            font-size: 15px !important;
          }
          
          .history-nomination-meta {
            flex-wrap: wrap !important;
            gap: 10px !important;
          }
          
          .history-status-badge {
            align-self: flex-start !important;
          }
          
          /* Stats Row - 2 columns on mobile */
          .history-stats-row {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          
          .history-stat-item-value {
            font-size: 16px !important;
          }
          
          .history-card-body {
            padding: 14px !important;
          }
          
          /* Card Footer - Wrap buttons */
          .history-card-footer {
            flex-wrap: wrap !important;
            gap: 10px !important;
            padding: 12px 14px !important;
          }
          
          .history-view-btn, .history-withdraw-btn, .history-appeal-btn, .history-results-btn {
            flex: 1 !important;
            justify-content: center !important;
            font-size: 12px !important;
            padding: 8px 12px !important;
          }
          
          /* Pagination */
          .history-pagination {
            gap: 12px !important;
            padding: 14px !important;
          }
          
          .history-page-btn {
            padding: 8px 14px !important;
            font-size: 12px !important;
          }
          
          .history-page-info {
            font-size: 12px !important;
          }
          
          /* Modal */
          .history-modal {
            max-width: 95% !important;
            margin: 16px !important;
          }
          
          .history-modal-header {
            padding: 16px !important;
          }
          
          .history-modal-body {
            padding: 16px !important;
          }
          
          .history-detail-row {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 4px !important;
            margin-bottom: 12px !important;
          }
          
          .history-detail-label {
            min-width: auto !important;
          }
          
          .history-detail-text {
            font-size: 13px !important;
          }
        }
        
        /* SMALL MOBILE - 480px AND BELOW */
        @media (max-width: 480px) {
          .history-stats-cards {
            gap: 8px !important;
          }
          
          .history-stat-card {
            padding: 8px 12px !important;
          }
          
          .history-stat-value {
            font-size: 18px !important;
          }
          
          .history-stat-label {
            font-size: 9px !important;
          }
          
          .history-stats-row {
            gap: 8px !important;
          }
          
          .history-stat-item-label {
            font-size: 9px !important;
          }
          
          .history-card-footer {
            flex-direction: column !important;
          }
          
          .history-view-btn, .history-withdraw-btn, .history-appeal-btn, .history-results-btn {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: 'clamp(20px, 4vw, 32px)',
    marginTop: 'clamp(60px, 10vh, 80px)',
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
    width: '50px',
    height: '50px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #D23A01',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  retryBtn: {
    padding: '12px 28px',
    background: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '20px'
  },
  title: {
    fontSize: 'clamp(24px, 5vw, 28px)',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  subtitle: {
    fontSize: '17px',
    color: '#000000'
  },
  statsCards: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  statCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '14px 24px',
    textAlign: 'center',
    border: '1px solid #e5e7eb',
    minWidth: '100px'
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#D23A01'
  },
  statLabel: {
    fontSize: '15px',
    color: '#000000',
    marginTop: '4px'
  },
  welcomeCard: {
    background: '#023430',
    borderRadius: '20px',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    color: 'white'
  },
  welcomeAvatar: {
    width: '56px',
    height: '56px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  welcomeInfo: {
    flex: 1
  },
  welcomeName: {
    margin: '0 0 4px 0',
    fontSize: '18px',
    fontWeight: '900',
    color: '#fff'
  },
  welcomeEmail: {
    margin: 0,
    opacity: 0.9,
    fontSize: '13px'
  },
  searchSection: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  searchBox: {
    flex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 18px',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '14px'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px'
  },
  filterBox: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 18px',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '14px'
  },
  filterSelect: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: '14px',
    cursor: 'pointer'
  },
  activeAlert: {
    background: '#fef3c7',
    borderLeft: '4px solid #f59e0b',
    borderRadius: '16px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  alertIcon: {
    color: '#f59e0b'
  },
  alertContent: {
    flex: 1
  },
  alertTitle: {
    margin: '0 0 4px 0',
    fontSize: '15px',
    color: '#92400e'
  },
  alertText: {
    margin: 0,
    fontSize: '13px',
    color: '#b45309'
  },
  alertBtn: {
    background: '#f59e0b',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '10px',
    color: 'white',
    cursor: 'pointer',
    fontWeight: '500'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '20px',
    border: '1px solid #e5e7eb'
  },
  emptyIcon: {
    marginBottom: '16px',
    color: '#08090a'
  },
  nominationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  nominationCard: {
    background: 'white',
    borderRadius: '20px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '18px 22px',
    background: '#f8fafc',
    borderBottom: '1px solid #e5e7eb',
    flexWrap: 'wrap',
    gap: '12px'
  },
  electionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  electionIcon: {
    color: '#D23A01'
  },
  electionTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '6px'
  },
  nominationMeta: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '12px',
    color: '#000000'
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  cardBody: {
    padding: '18px 22px',
    background: 'white'
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '16px',
    marginBottom: '16px'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  statItemLabel: {
    fontSize: '13px',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  statItemValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  rejectionNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: '#fee2e2',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#991b1b',
    marginTop: '12px'
  },
  adminNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: '#dbeafe',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#1e40af',
    marginTop: '12px'
  },
  cardFooter: {
    display: 'flex',
    gap: '12px',
    padding: '16px 22px',
    borderTop: '1px solid #e5e7eb',
    background: '#fafafa'
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    color: '#1a1a1a'
  },
  withdrawBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#fee2e2',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: '#dc2626'
  },
  appealBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#fef3c7',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    color: '#d97706'
  },
  resultsBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#FEF3F0',
    color: '#D23A01',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '32px',
    padding: '20px',
    background: 'white',
    borderRadius: '16px',
    border: '1px solid #e5e7eb'
  },
  pageBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  pageInfo: {
    fontSize: '14px',
    color: '#1a1a1a',
    fontWeight: '500'
  },
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
    maxWidth: '550px',
    maxHeight: '80vh',
    overflowY: 'auto',
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
    color: '#000000',
    zIndex: 1
  },
  modalHeader: {
    padding: '20px 24px',
    background: '#023430',
    color: 'white',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px'
  },
  modalBody: {
    padding: '24px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14px',
    fontSize: '14px',
    flexWrap: 'wrap',
    gap: '8px'
  },
  detailLabel: {
    fontWeight: '600',
    color: '#000000',
    minWidth: '100px'
  },
  detailDivider: {
    height: '1px',
    background: '#e5e7eb',
    margin: '20px 0'
  },
  detailSubtitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#023430',
    margin: '0 0 10px 0'
  },
  detailText: {
    margin: '0 0 20px 0',
    fontSize: '14px',
    color: '#000000',
    lineHeight: '1.5'
  }
};

// Add keyframe animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin { 
    from { transform: rotate(0deg); } 
    to { transform: rotate(360deg); } 
  }
`;
if (!document.head.querySelector('#candidate-history-styles')) {
  styleSheet.id = 'candidate-history-styles';
  document.head.appendChild(styleSheet);
}

export default CandidateHistoryDashboard;