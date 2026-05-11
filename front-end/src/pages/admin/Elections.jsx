// pages/admin/Elections.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiEye, 
  FiCheckCircle, FiClock, FiBarChart2, FiUsers,
  FiRefreshCw
} from 'react-icons/fi';
import { 
  fetchAllElections, 
  deleteElection, 
  clearError
} from '../../Js/election-slice';
import ErrorModal from '../../components/ErrorModal';

const Elections = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { elections, loading, error, totalCount } = useSelector(state => state.election);
  const { user } = useSelector(state => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    loadElections();
  }, []);

  useEffect(() => {
    if (error) {
      setErrorModal({ isOpen: true, message: error });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadElections = () => {
    dispatch(fetchAllElections());
  };

  const filteredElections = elections.filter(election => {
    const matchesSearch = 
      election.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      election.electionId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || election.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return { bg: '#f1f5f9', color: '#475569', text: 'DRAFT' };
      case 'registration_open': return { bg: '#FEF3F0', color: '#D23A01', text: 'REGISTRATION OPEN' };
      case 'registration_closed': return { bg: '#f1f5f9', color: '#6b7280', text: 'REGISTRATION CLOSED' };
      case 'nomination_open': return { bg: '#E8F5E9', color: '#023430', text: 'NOMINATION OPEN' };
      case 'nomination_closed': return { bg: '#f1f5f9', color: '#6b7280', text: 'NOMINATION CLOSED' };
      case 'voting_open': return { bg: '#FEF3F0', color: '#D23A01', text: 'VOTING OPEN' };
      case 'voting_closed': return { bg: '#f1f5f9', color: '#6b7280', text: 'VOTING CLOSED' };
      case 'results_published': return { bg: '#E8F5E9', color: '#023430', text: 'RESULTS PUBLISHED' };
      case 'completed': return { bg: '#e5e7eb', color: '#4b5563', text: 'COMPLETED' };
      default: return { bg: '#f1f5f9', color: '#6b7280', text: status?.toUpperCase() || 'UNKNOWN' };
    }
  };

  const handleView = (election) => {
    navigate(`/electionAdmin/elections/${election._id}`);
  };

  const handleEdit = (election) => {
    navigate(`/electionAdmin/elections/${election._id}/edit`);
  };

  const handlePublish = (election) => {
    navigate(`/electionAdmin/publish-results/${election._id}`);
  };
  
  const handleResult = (election) => {
    navigate(`/electionAdmin/results/${election._id}`);
  }
  
  const handleDelete = async () => {
    if (selectedElection) {
      await dispatch(deleteElection(selectedElection._id));
      setShowDeleteModal(false);
      setSelectedElection(null);
      loadElections();
    }
  };

  const handleCreateElection = () => {
    navigate('/electionAdmin/create-election');
  };

  const canPublish = (election) => {
    const now = new Date();
    const votingEnd = new Date(election.timeline?.votingEnd);
    const hasVotingEnded = now > votingEnd;
    return (hasVotingEnded || election.status === 'voting_closed' || election.status === 'completed') && election.status !== 'results_published';
  };

  const canEdit = (election) => {
    const nonEditableStatuses = ['voting_open', 'voting_closed', 'results_published', 'completed'];
    return !nonEditableStatuses.includes(election.status);
  };

  
  const canDelete = (election) => {
    return election.status === 'draft' || election.status === 'results_published';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Manage Elections</h1>
          <p style={styles.subtitle}>Create, monitor, and manage all elections</p>
        </div>
        <button style={styles.createBtn} onClick={handleCreateElection}>
          <FiPlus size={18} /> Create New Election
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filtersBar}>
        <div style={styles.searchWrapper}>
          <FiSearch size={18} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by title or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.filterGroup}>
          <FiFilter size={18} style={styles.filterIcon} />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="registration_open">Registration Open</option>
            <option value="registration_closed">Registration Closed</option>
            <option value="nomination_open">Nomination Open</option>
            <option value="nomination_closed">Nomination Closed</option>
            <option value="voting_open">Voting Open</option>
            <option value="voting_closed">Voting Closed</option>
            <option value="results_published">Results Published</option>
            <option value="completed">Completed</option>
          </select>
          
          <button style={styles.refreshBtn} onClick={loadElections}>
            <FiRefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{totalCount}</div>
          <div style={styles.statLabel}>Total Elections</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{elections.filter(e => e.status === 'voting_open').length}</div>
          <div style={styles.statLabel}>Active Voting</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{elections.filter(e => e.status === 'nomination_open').length}</div>
          <div style={styles.statLabel}>Nominations Open</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{elections.filter(e => e.status === 'registration_open').length}</div>
          <div style={styles.statLabel}>Registration Open</div>
        </div>
      </div>

      {/* Elections Table */}
      <div style={styles.tableContainer}>
        {loading ? (
          <div style={styles.loader}>Loading elections...</div>
        ) : filteredElections.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <p>No elections found</p>
            <button style={styles.emptyBtn} onClick={handleCreateElection}>
              Create your first election
            </button>
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>Election Title</th>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Voting Period</th>
                <th style={styles.th}>Votes</th>
                <th style={styles.th}>Created</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredElections.map((election) => {
                const statusStyle = getStatusColor(election.status);
                const publishable = canPublish(election);

                return (
                  <tr key={election._id} style={styles.tableRow}>
                    <td style={styles.td}>
                      <div style={styles.electionTitle}>{election.title}</div>
                      <div style={styles.electionDesc}>
                        {election.description?.slice(0, 60)}...
                      </div>
                     </td>
                    <td style={styles.td}>
                      <span style={styles.electionId}>
                        {election.electionId || election._id?.slice(-8)}
                      </span>
                     </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: statusStyle.bg,
                        color: statusStyle.color,
                      }}>
                        {statusStyle.text}
                      </span>
                     </td>
                    <td style={styles.td}>
                      <div style={styles.dateText}>
                        {new Date(election.timeline?.votingStart).toLocaleDateString()}
                      </div>
                      <div style={styles.dateMeta}>
                        to {new Date(election.timeline?.votingEnd).toLocaleDateString()}
                      </div>
                     </td>
                    <td style={styles.td}>
                      <span style={styles.voteCount}>
                        {election.statistics?.totalVotesCast || 0}
                      </span>
                     </td>
                    <td style={styles.td}>
                      {new Date(election.createdAt).toLocaleDateString()}
                     </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        <button
                          style={styles.actionBtn}
                          onClick={() => handleView(election)}
                          title="View"
                        >
                          <FiEye size={16} />
                        </button>

                        {canEdit(election) && (
                          <button
                            style={styles.actionBtn}
                            onClick={() => handleEdit(election)}
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                        )}

                        {publishable && (
                          <button
                            style={styles.publishBtn}
                            onClick={() => handlePublish(election)}
                            title="Publish Results"
                          >
                            <FiCheckCircle size={14} /> Publish
                          </button>
                        )}
                        
                        {election.status === 'results_published' && (
                          <button
                            style={styles.resultBtn}
                            onClick={() => handleResult(election)}
                            title="View Results"
                          >
                            <FiBarChart2 size={14} /> Results
                          </button>
                        )}

                        {canDelete(election) && (
                          <button
                            style={styles.deleteBtn}
                            onClick={() => {
                              setSelectedElection(election);
                              setShowDeleteModal(true);
                            }}
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                     </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedElection && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Delete Election</h3>
            <p style={{ fontSize: '16px', marginBottom: '12px' }}>Are you sure you want to delete <strong style={{ color: '#D23A01' }}>"{selectedElection.title}"</strong>?</p>
            <p style={styles.modalWarning}>⚠️ This action cannot be undone. All election data will be permanently removed.</p>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button style={styles.confirmDeleteBtn} onClick={handleDelete}>Delete Election</button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      <ErrorModal 
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={() => setErrorModal({ isOpen: false, message: '' })}
        title="Error"
        icon="error"
      />
    </div>
  );
};

const styles = {
  container: { 
    padding: 'clamp(20px, 4vw, 32px)', 
    maxWidth: '1400px', 
    margin: '0 auto', 
    marginTop: 'clamp(60px, 8vh, 80px)',
    minHeight: '100vh', 
    background: '#f8fafc' 
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
    fontWeight: '700', 
    color: '#1a1a1a', 
    marginBottom: '8px',
    fontFamily: "'Poppins', sans-serif"
  },
  subtitle: { 
    color: '#4a5568', 
    fontSize: '15px',
    fontFamily: "'Poppins', sans-serif"
  },
  createBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '12px 24px', 
    background: '#D23A01', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '12px', 
    fontWeight: '600', 
    fontSize: '15px',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s'
  },
  
  filtersBar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '28px', 
    flexWrap: 'wrap', 
    gap: '16px' 
  },
  searchWrapper: { 
    position: 'relative', 
    flex: 1, 
    maxWidth: '350px' 
  },
  searchIcon: { 
    position: 'absolute', 
    left: '14px', 
    top: '50%', 
    transform: 'translateY(-50%)', 
    color: '#9ca3af' 
  },
  searchInput: { 
    width: '100%', 
    padding: '12px 16px 12px 42px', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    fontSize: '15px',
    fontFamily: "'Poppins', sans-serif",
    outline: 'none'
  },
  filterGroup: { 
    display: 'flex', 
    gap: '12px', 
    alignItems: 'center' 
  },
  filterIcon: { 
    color: '#6b7280' 
  },
  filterSelect: { 
    padding: '10px 16px', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    fontSize: '15px', 
    background: '#fff',
    fontFamily: "'Poppins', sans-serif",
    color: '#1a1a1a',
    cursor: 'pointer'
  },
  refreshBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '10px 18px', 
    background: '#f1f5f9', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s'
  },
  
  statsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
    gap: '16px', 
    marginBottom: '28px' 
  },
  statCard: { 
    background: '#fff', 
    borderRadius: '16px', 
    padding: '18px 20px', 
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  statValue: { 
    fontSize: 'clamp(26px, 5vw, 32px)', 
    fontWeight: '700', 
    color: '#D23A01',
    fontFamily: "'Poppins', sans-serif"
  },
  statLabel: { 
    fontSize: '14px', 
    color: '#4a5568', 
    marginTop: '6px',
    fontFamily: "'Poppins', sans-serif",
    fontWeight: '500'
  },
  
  tableContainer: { 
    background: '#fff', 
    borderRadius: '16px', 
    overflow: 'auto', 
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse', 
    minWidth: '800px' 
  },
  tableHeader: { 
    borderBottom: '1px solid #e5e7eb', 
    background: '#f8fafc' 
  },
  th: { 
    padding: '16px', 
    textAlign: 'left', 
    fontSize: '14px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    textTransform: 'uppercase',
    fontFamily: "'Poppins', sans-serif"
  },
  tableRow: { 
    borderBottom: '1px solid #f1f5f9', 
    transition: 'background 0.2s',
    ':hover': { background: '#fafbfc' }
  },
  td: { 
    padding: '16px', 
    fontSize: '15px', 
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif",
    verticalAlign: 'middle'
  },
  
  electionTitle: { 
    fontWeight: '700', 
    color: '#1a1a1a', 
    marginBottom: '6px',
    fontSize: '16px'
  },
  electionDesc: { 
    fontSize: '13px', 
    color: '#6b7280' 
  },
  electionId: { 
    fontFamily: 'monospace', 
    fontSize: '13px', 
    background: '#f1f5f9', 
    padding: '4px 8px', 
    borderRadius: '6px' 
  },
  statusBadge: { 
    display: 'inline-block', 
    padding: '6px 14px', 
    borderRadius: '24px', 
    fontSize: '13px', 
    fontWeight: '600' 
  },
  dateText: { 
    fontSize: '14px', 
    color: '#1a1a1a' 
  },
  dateMeta: { 
    fontSize: '12px', 
    color: '#9ca3af', 
    marginTop: '4px' 
  },
  voteCount: { 
    fontWeight: '700', 
    color: '#D23A01',
    fontSize: '18px'
  },
  
  actions: { 
    display: 'flex', 
    gap: '10px', 
    flexWrap: 'wrap' 
  },
  actionBtn: { 
    padding: '8px 12px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    color: '#4b5563',
    fontSize: '16px',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.2s'
  },
  publishBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '6px 14px', 
    background: '#023430', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif"
  },
  resultBtn: {
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '6px 14px', 
    background: '#D23A01', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif"
  },
  deleteBtn: { 
    padding: '8px 12px', 
    background: '#fee2e2', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    color: '#dc2626',
    fontSize: '16px',
    display: 'inline-flex',
    alignItems: 'center'
  },
  
  loader: { 
    textAlign: 'center', 
    padding: '60px', 
    color: '#4a5568',
    fontFamily: "'Poppins', sans-serif",
    fontSize: '16px'
  },
  emptyState: { 
    textAlign: 'center', 
    padding: '60px', 
    color: '#9ca3af',
    fontFamily: "'Poppins', sans-serif"
  },
  emptyIcon: { 
    fontSize: '48px', 
    marginBottom: '16px' 
  },
  emptyBtn: { 
    marginTop: '16px', 
    padding: '12px 24px', 
    background: '#D23A01', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif"
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
    justifyContent: 'center',
    padding: '20px'
  },
  modal: { 
    background: '#fff', 
    borderRadius: '20px', 
    padding: '28px', 
    width: '90%', 
    maxWidth: '450px' 
  },
  modalTitle: { 
    fontSize: '22px', 
    fontWeight: '700', 
    marginBottom: '16px',
    fontFamily: "'Poppins', sans-serif",
    color: '#1a1a1a'
  },
  modalWarning: { 
    fontSize: '14px', 
    color: '#dc2626', 
    background: '#fef2f2', 
    padding: '12px', 
    borderRadius: '10px', 
    marginTop: '12px' 
  },
  modalActions: { 
    display: 'flex', 
    justifyContent: 'flex-end', 
    gap: '12px', 
    marginTop: '20px' 
  },
  cancelBtn: { 
    padding: '10px 20px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif"
  },
  confirmDeleteBtn: { 
    padding: '10px 20px', 
    background: '#dc2626', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif"
  }
};

export default Elections;