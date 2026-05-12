// pages/superAdmin/ManageInstitutions.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  fetchInstitutions,
  fetchPendingRequests,
  deleteInstitution,
  toggleInstitutionStatus,
  clearError
} from '../../Js/institution-slice';
import InstitutionTable from '../../components/superadmin/InstitutionTable';
import PendingRequestpel from '../../components/superadmin/PendingRequestsPanel';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { FiArrowLeft, FiRefreshCw, FiPlus, FiSearch, FiAlertCircle } from 'react-icons/fi';

const ManageInstitutions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { institutions, pendingRequests, loading, error } = useSelector(state => state.institution);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPending, setShowPending] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger',
    loading: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadingToast = toast.loading('Loading institutions...');
    try {
      await Promise.all([
        dispatch(fetchInstitutions()),
        dispatch(fetchPendingRequests())
      ]);
      toast.success('Data loaded successfully', { id: loadingToast });
    } catch (err) {
      toast.error('Failed to load data', { id: loadingToast });
    }
  };

  const filteredInstitutions = institutions.filter(inst => {
    const matchesSearch = 
      inst.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inst.status === statusFilter;
    const isNotPending = inst.status !== 'pending';
    
    return matchesSearch && matchesStatus && isNotPending;
  });

  const sortedInstitutions = [...filteredInstitutions].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'code') return a.code.localeCompare(b.code);
    return 0;
  });

  const canDeleteInstitution = (institution) => {
    if (institution.status === 'active') {
      return { allowed: false, reason: 'Cannot delete an active institution. Deactivate it first.' };
    }
    return { allowed: true, reason: '' };
  };

  const showConfirmation = (title, message, onConfirm, type = 'danger') => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        setConfirmationModal(prev => ({ ...prev, loading: true }));
        await onConfirm();
        setConfirmationModal(prev => ({ ...prev, isOpen: false, loading: false }));
      },
      type,
      loading: false
    });
  };

  const handleViewDetails = (institution) => {
    navigate(`/superAdmin/institutions/${institution._id}`);
  };

  const handleDelete = async (institution) => {
    const { allowed, reason } = canDeleteInstitution(institution);
    if (!allowed) {
      toast.error(reason);
      return;
    }
    
    showConfirmation(
      'Delete Institution',
      `Are you sure you want to delete "${institution.name}"? This action cannot be undone.`,
      async () => {
        const loadingToast = toast.loading('Deleting institution...');
        try {
          await dispatch(deleteInstitution(institution._id)).unwrap();
          toast.success('Institution deleted successfully', { id: loadingToast });
          await loadData();
        } catch (err) {
          toast.error(err || 'Failed to delete institution', { id: loadingToast });
        }
      },
      'danger'
    );
  };

  const handleToggleStatus = async (institution) => {
    const newStatus = institution.status === 'active' ? 'inactive' : 'active';
    const actionText = newStatus === 'active' ? 'activate' : 'deactivate';
    
    showConfirmation(
      `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} Institution`,
      `Are you sure you want to ${actionText} "${institution.name}"?`,
      async () => {
        const loadingToast = toast.loading(`${actionText}ing institution...`);
        try {
          await dispatch(toggleInstitutionStatus({ id: institution._id, currentStatus: institution.status })).unwrap();
          toast.success(`Institution ${actionText}d successfully`, { id: loadingToast });
          await loadData();
        } catch (err) {
          toast.error(err || `Failed to ${actionText} institution`, { id: loadingToast });
        }
      },
      actionText === 'deactivate' ? 'warning' : 'info'
    );
  };

  const handleRefresh = () => {
    loadData();
  };

  return (
    <div style={styles.container}>
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        message={confirmationModal.message}
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        type={confirmationModal.type}
        loading={confirmationModal.loading}
      />

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Manage Institutions</h1>
          <p style={styles.description}>Manage all registered institutions, approve pending requests, and control access</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            <FiArrowLeft size={16} /> Back
          </button>
          <button style={styles.refreshBtn} onClick={handleRefresh}>
            <FiRefreshCw size={14} /> Refresh
          </button>
          <button style={styles.pendingBtn} onClick={() => setShowPending(!showPending)}>
            {showPending ? 'Hide Pending' : `Pending (${pendingRequests.length})`}
          </button>
          <button style={styles.primaryBtn} onClick={() => navigate('/superAdmin/create-institution')}>
            <FiPlus size={14} /> Create
          </button>
        </div>
      </div>

      {/* Pending Requests Panel */}
      {showPending && (
        <PendingRequestpel 
          pendingRequests={pendingRequests} 
          loading={loading} 
          onRefresh={loadData} 
        />
      )}

      {/* Error Banner */}
      {error && (
        <div style={styles.errorBanner}>
          <FiAlertCircle size={16} />
          <span>{error}</span>
          <button style={styles.closeBtn} onClick={() => dispatch(clearError())}>×</button>
        </div>
      )}

      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <FiSearch size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, code, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.filterGroup}>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterSelect}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.filterSelect}>
            <option value="recent">Most Recent</option>
            <option value="name">Sort by Name</option>
            <option value="code">Sort by Code</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={styles.statsBar}>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{institutions.filter(i => i.status !== 'pending').length}</span>
          <span style={styles.statLabel}>Total</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{institutions.filter(i => i.status === 'active').length}</span>
          <span style={styles.statLabel}>Active</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{pendingRequests.length}</span>
          <span style={styles.statLabel}>Pending</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statValue}>{institutions.filter(i => i.status === 'inactive').length}</span>
          <span style={styles.statLabel}>Inactive</span>
        </div>
      </div>

      {/* Institution Table */}
      <InstitutionTable
        institutions={sortedInstitutions}
        loading={loading}
        onView={handleViewDetails}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        canDeleteInstitution={canDeleteInstitution}
      />

      <style>{`
        @media (max-width: 768px) {
          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .search-wrapper {
            max-width: 100% !important;
          }
          .filter-group {
            flex-direction: column;
            width: 100%;
          }
          .filter-select {
            width: 100%;
          }
          .stats-bar {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .header-actions {
            width: 100%;
            justify-content: flex-start;
          }
        }
        
        @media (max-width: 480px) {
          .stats-bar {
            grid-template-columns: 1fr !important;
          }
          .header-actions {
            flex-wrap: wrap;
          }
          .header-actions button {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { 
    padding: 'clamp(16px, 4vw, 24px)', 
    maxWidth: '1200px', 
    margin: '0 auto', 
    minHeight: '100vh', 
    background: '#f8fafc' 
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 'clamp(20px, 5vw, 24px)', 
    flexWrap: 'wrap', 
    gap: '16px' 
  },
  title: { 
    fontSize: 'clamp(24px, 5vw, 28px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    marginBottom: '8px',
    
    letterSpacing: '-0.3px'
  },
  description: { 
    color: '#0a0c0e', 
    fontSize: 'clamp(13px, 3vw, 14px)',
    
    lineHeight: '1.5'
  },
  headerActions: { 
    display: 'flex', 
    gap: '12px', 
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a',
    
    transition: 'all 0.2s'
  },
  primaryBtn: { 
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    padding: '8px 18px', 
    borderRadius: '10px', 
    fontWeight: '700', 
    fontSize: '13px',
    cursor: 'pointer',
    
    transition: 'all 0.2s'
  },
  pendingBtn: { 
    background: '#023430', 
    color: 'white', 
    border: 'none', 
    padding: '8px 18px', 
    borderRadius: '10px', 
    fontWeight: '700', 
    fontSize: '13px',
    cursor: 'pointer',
    
    transition: 'all 0.2s'
  },
  refreshBtn: { 
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#f1f5f9', 
    color: '#000000', 
    border: 'none', 
    padding: '8px 16px', 
    borderRadius: '10px', 
    fontWeight: '600', 
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.2s'
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
    fontSize: '13px',
    fontWeight: '500',
    
  },
  closeBtn: { 
    background: 'none', 
    border: 'none', 
    fontSize: '20px', 
    cursor: 'pointer', 
    color: '#dc2626' 
  },
  filterBar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '24px', 
    flexWrap: 'wrap', 
    gap: '16px' 
  },
  searchWrapper: { 
    position: 'relative', 
    flex: 1, 
    maxWidth: '360px' 
  },
  searchIcon: { 
    position: 'absolute', 
    left: '12px', 
    top: '50%', 
    transform: 'translateY(-50%)', 
    color: '#000000'
  },
  searchInput: { 
    width: '100%', 
    padding: '10px 14px 10px 40px', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s'
  },
  filterGroup: { 
    display: 'flex', 
    gap: '12px',
    flexWrap: 'wrap'
  },
  filterSelect: { 
    padding: '10px 16px', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    fontSize: '14px', 
    background: 'white',
    color: '#1a1a1a',
    cursor: 'pointer',
    outline: 'none'
  },
  statsBar: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
    gap: '16px', 
    marginBottom: '24px' 
  },
  statCard: { 
    background: 'white', 
    borderRadius: '14px', 
    padding: '16px 20px', 
    textAlign: 'center', 
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  statValue: { 
    display: 'block', 
    fontSize: 'clamp(24px, 5vw, 28px)', 
    fontWeight: '800', 
    color: '#D23A01',
    marginBottom: '4px'
  },
  statLabel: { 
    fontSize: '13px', 
    color: '#08090a',
    fontWeight: '600'
  }
};

export default ManageInstitutions;