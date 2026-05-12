// pages/electionAdmin/VoterListManager.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw,
  FiUpload, FiDownload, FiX, FiCheck, FiAlertCircle, FiUsers,
  FiChevronDown, FiAlertTriangle, FiLoader
} from 'react-icons/fi';
import { fetchAllElections } from '../../Js/election-slice';
import { 
  fetchVoterDetails, 
  addVoter, 
  updateVoter, 
  deleteVoter,
  deleteVoterList,
  setSearchTerm,
  setPage,
  clearVoters,
  clearError
} from '../../Js/voterList-slice';
import VoterTable from './VoterTable';
import { securityValidators } from '../../utils/validators';
import ErrorModal from '../../components/ErrorModal';

const VoterListManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { elections } = useSelector(state => state.election);
  const { 
    voters, 
    loading, 
    totalRecords, 
    currentPage, 
    totalPages, 
    searchTerm, 
    error,
    limit
  } = useSelector(state => state.voterList);
  
  const [selectedElection, setSelectedElection] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVoter, setEditingVoter] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete confirmation modals
  const [showDeleteVoterModal, setShowDeleteVoterModal] = useState(false);
  const [voterToDelete, setVoterToDelete] = useState(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
 
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: ''
  });

  useEffect(() => {
    dispatch(fetchAllElections());
  }, [dispatch]);

  // Sort elections by createdAt (most recent first) and set first as default
  const sortedElections = useMemo(() => {
    if (!elections) return [];
    return [...elections].sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return dateB - dateA;
    });
  }, [elections]);

  useEffect(() => {
    if (sortedElections.length > 0 && !selectedElection) {
      setSelectedElection(sortedElections[0]._id);
    }
  }, [sortedElections, selectedElection]);

  useEffect(() => {
    if (selectedElection) {
      loadVoters();
    }
  }, [selectedElection, currentPage, searchTerm]);

  // Show error modal when error from Redux changes
  useEffect(() => {
    if (error) {
      setErrorModal({ isOpen: true, message: error });
    }
  }, [error]);

  const loadVoters = async () => {
    try {
      await dispatch(fetchVoterDetails({ 
        electionId: selectedElection, 
        page: currentPage, 
        limit: limit,
        search: searchTerm 
      })).unwrap();
    } catch (err) {
      setErrorModal({ isOpen: true, message: err || 'Failed to load voters' });
    }
  };

  const handleElectionChange = (electionId) => {
    setSelectedElection(electionId);
    dispatch(clearVoters());
    dispatch(setPage(1));
    dispatch(setSearchTerm(''));
  };

  const handleSearch = (e) => {
    dispatch(setSearchTerm(e.target.value));
    dispatch(setPage(1));
  };

  // Validation functions using securityValidators
  const validateFirstName = (value) => {
    const error = securityValidators.isValidName(value, 'First name');
    return error;
  };

  const validateLastName = (value) => {
    const error = securityValidators.isValidName(value, 'Last name');
    return error;
  };

  const validateEmail = (value) => {
    const error = securityValidators.isValidEmail(value);
    return error;
  };

  const validatePhone = (value) => {
    if (!value) return null;
    const error = securityValidators.isValidPhone(value);
    return error;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let error = null;
    
    switch (field) {
      case 'firstName':
        error = validateFirstName(formData.firstName);
        break;
      case 'lastName':
        error = validateLastName(formData.lastName);
        break;
      case 'email':
        error = validateEmail(formData.email);
        break;
      case 'phone':
        error = validatePhone(formData.phone);
        break;
      default:
        break;
    }
    
    setFieldErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = () => {
    const errors = {};
    
    const firstNameError = validateFirstName(formData.firstName);
    if (firstNameError) errors.firstName = firstNameError;
    
    const lastNameError = validateLastName(formData.lastName);
    if (lastNameError) errors.lastName = lastNameError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;
    
    return errors;
  };

  const handleAddClick = () => {
    setEditingVoter(null);
    setFormData({ firstName: '', lastName: '', email: '', phone: '' });
    setFieldErrors({});
    setTouched({});
    setFormError('');
    setShowModal(true);
  };

  const handleEditClick = (voter) => {
    setEditingVoter(voter);
    setFormData({
      firstName: voter.firstName || '',
      lastName: voter.lastName || '',
      email: voter.email || '',
      phone: voter.phone || ''
    });
    setFieldErrors({});
    setTouched({});
    setFormError('');
    setShowModal(true);
  };

  const handleDeleteClick = (voterId, voterName) => {
    setVoterToDelete({ id: voterId, name: voterName });
    setShowDeleteVoterModal(true);
  };

  const confirmDeleteVoter = async () => {
    if (voterToDelete) {
      try {
        await dispatch(deleteVoter({ electionId: selectedElection, voterId: voterToDelete.id })).unwrap();
        loadVoters();
        setShowDeleteVoterModal(false);
        setVoterToDelete(null);
      } catch (err) {
        setErrorModal({ isOpen: true, message: err || 'Failed to delete voter' });
        setShowDeleteVoterModal(false);
      }
    }
  };

  const handleDeleteAllClick = () => {
    setShowDeleteAllModal(true);
  };

  const confirmDeleteAll = async () => {
    try {
      await dispatch(deleteVoterList(selectedElection)).unwrap();
      loadVoters();
      setShowDeleteAllModal(false);
    } catch (err) {
      setErrorModal({ isOpen: true, message: err || 'Failed to delete all voters' });
      setShowDeleteAllModal(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true
    });
    
    const errors = validateForm();
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setFormError('Please fix the errors above');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingVoter) {
        await dispatch(updateVoter({ 
          electionId: selectedElection, 
          voterId: editingVoter._id, 
          voterData: formData 
        })).unwrap();
      } else {
        await dispatch(addVoter({ electionId: selectedElection, voterData: formData })).unwrap();
      }
      
      setShowModal(false);
      loadVoters();
    } catch (err) {
      setErrorModal({ isOpen: true, message: err || 'Operation failed' });
      setFormError('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefresh = () => {
    loadVoters();
  };

  const closeErrorModal = () => {
    setErrorModal({ isOpen: false, message: '' });
    dispatch(clearError());
  };

  const getSelectedElectionTitle = () => {
    const election = sortedElections.find(e => e._id === selectedElection);
    return election?.title || 'Select Election';
  };

  const startRecord = voters.length > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endRecord = Math.min(currentPage * limit, totalRecords);
  const showPagination = !loading && voters.length > 0 && totalPages > 1;

  const showFieldError = (field) => {
    return touched[field] && fieldErrors[field];
  };

  return (
    <div style={styles.container}>
      
      <ErrorModal 
        isOpen={errorModal.isOpen}
        message={errorModal.message}
        onClose={closeErrorModal}
        title="Error"
        icon="error"
      />

      <div style={styles.header}>
        <div style={styles.headerIcon}>
          <FiUsers size={28} color="#D23A01" />
        </div>
        <div>
          <h1 style={styles.title}>Voter List Management</h1>
          <p style={styles.subtitle}>Manage eligible voters for elections</p>
        </div>
      </div>

      {/* Election Dropdown Selector */}
      {sortedElections.length > 0 && (
        <div style={styles.electionSelectorContainer}>
          <div style={styles.selectorWrapper}>
            <FiUsers size={18} color="#D23A01" />
            <select 
              value={selectedElection} 
              onChange={(e) => handleElectionChange(e.target.value)}
              style={styles.electionSelect}
            >
              {sortedElections.map(election => (
                <option key={election._id} value={election._id}>
                  {election.title}
                </option>
              ))}
            </select>
            <FiChevronDown size={16} style={styles.selectArrow} />
          </div>
          
          {selectedElection && (
            <div style={styles.selectedElectionInfo}>
              <span style={styles.selectedElectionLabel}>Current Election:</span>
              <span style={styles.selectedElectionValue}>{getSelectedElectionTitle()}</span>
            </div>
          )}
        </div>
      )}

      {sortedElections.length === 0 && (
        <div style={styles.noElections}>
          <FiAlertCircle size={48} color="#cbd5e1" />
          <p>No elections found. Please create an election first.</p>
        </div>
      )}

      {selectedElection && (
        <>
          <div style={styles.actionsBar}>
            <div style={styles.searchWrapper}>
              <FiSearch style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={handleSearch}
                style={styles.searchInput}
              />
            </div>
            <div style={styles.buttonGroup}>
              <button style={styles.refreshBtn} onClick={handleRefresh}>
                <FiRefreshCw size={16} /> Refresh
              </button>
              <button style={styles.addBtn} onClick={handleAddClick}>
                <FiPlus size={16} /> Add Voter
              </button>
              <button 
                style={styles.uploadBtn} 
                onClick={() => navigate('/electionAdmin/upload-voters', { 
                  state: { 
                    preselectedElectionId: selectedElection,
                    electionTitle: getSelectedElectionTitle()
                  } 
                })}
              >
                <FiUpload size={16} /> Upload Voter
              </button>
              <button style={styles.deleteAllBtn} onClick={handleDeleteAllClick}>
                <FiTrash2 size={16} /> Delete All
              </button>
            </div>
          </div>

          <VoterTable 
            voters={voters}
            loading={loading}
            currentPage={currentPage}
            itemsPerPage={limit}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            showActions={true}
          />
          
          {showPagination && (
            <div style={styles.pagination}>
              <button
                disabled={currentPage === 1}
                onClick={() => dispatch(setPage(currentPage - 1))}
                style={{ 
                  ...styles.pageBtn, 
                  opacity: currentPage === 1 ? 0.5 : 1, 
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer' 
                }}
              >
                Previous
              </button>
              <span style={styles.pageInfo}>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => dispatch(setPage(currentPage + 1))}
                style={{ 
                  ...styles.pageBtn, 
                  opacity: currentPage === totalPages ? 0.5 : 1, 
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' 
                }}
              >
                Next
              </button>
            </div>
          )}
          
          {!loading && voters.length > 0 && totalRecords > 0 && (
            <div style={styles.recordInfo}>
              Showing {startRecord} to {endRecord} of {totalRecords} records
            </div>
          )}
        </>
      )}

      {/* Add/Edit Voter Modal */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{editingVoter ? 'Edit Voter' : 'Add New Voter'}</h3>
              <button style={styles.modalClose} onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={styles.modalBody}>
                {formError && (
                  <div style={styles.modalError}>{formError}</div>
                )}
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>First Name <span style={styles.required}>*</span></label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      onBlur={() => handleBlur('firstName')}
                      style={{
                        ...styles.input,
                        ...(showFieldError('firstName') ? styles.inputError : {})
                      }}
                      placeholder="Enter first name"
                    />
                    {showFieldError('firstName') && (
                      <span style={styles.fieldError}>{fieldErrors.firstName}</span>
                    )}
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Last Name <span style={styles.required}>*</span></label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      onBlur={() => handleBlur('lastName')}
                      style={{
                        ...styles.input,
                        ...(showFieldError('lastName') ? styles.inputError : {})
                      }}
                      placeholder="Enter last name"
                    />
                    {showFieldError('lastName') && (
                      <span style={styles.fieldError}>{fieldErrors.lastName}</span>
                    )}
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Email <span style={styles.required}>*</span></label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    onBlur={() => handleBlur('email')}
                    style={{
                      ...styles.input,
                      ...(showFieldError('email') ? styles.inputError : {})
                    }}
                    placeholder="voter@example.com"
                  />
                  {showFieldError('email') && (
                    <span style={styles.fieldError}>{fieldErrors.email}</span>
                  )}
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Phone <span style={styles.optional}>(Optional)</span></label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    onBlur={() => handleBlur('phone')}
                    style={{
                      ...styles.input,
                      ...(showFieldError('phone') ? styles.inputError : {})
                    }}
                    placeholder="+251XXXXXXXXX"
                  />
                  {showFieldError('phone') && (
                    <span style={styles.fieldError}>{fieldErrors.phone}</span>
                  )}
                </div>
              </div>
              <div style={styles.modalFooter}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.saveBtn} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <FiLoader size={16} style={styles.spinner} />
                      {editingVoter ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    editingVoter ? 'Update Voter' : 'Add Voter'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Single Voter Confirmation Modal */}
      {showDeleteVoterModal && voterToDelete && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteVoterModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ ...styles.modalTitle, color: '#dc2626' }}>
                <FiAlertTriangle size={20} style={{ marginRight: '8px' }} /> Delete Voter
              </h3>
              <button style={styles.modalClose} onClick={() => setShowDeleteVoterModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.deleteIconWrapper}>
                <FiTrash2 size={48} color="#dc2626" />
              </div>
              <p style={styles.deleteMessage}>
                Are you sure you want to delete <strong>{voterToDelete.name}</strong>?
              </p>
              <p style={styles.deleteWarning}>
                This action cannot be undone. The voter will be permanently removed from the list.
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowDeleteVoterModal(false)}>
                Cancel
              </button>
              <button style={styles.confirmDeleteBtn} onClick={confirmDeleteVoter}>
                <FiTrash2 size={16} /> Delete Voter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Voters Confirmation Modal */}
      {showDeleteAllModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteAllModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={{ ...styles.modalTitle, color: '#dc2626' }}>
                <FiAlertTriangle size={20} style={{ marginRight: '8px' }} /> Delete All Voters
              </h3>
              <button style={styles.modalClose} onClick={() => setShowDeleteAllModal(false)}>×</button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.deleteIconWrapper}>
                <FiTrash2 size={48} color="#dc2626" />
              </div>
              <p style={styles.deleteMessage}>
                Are you sure you want to delete <strong>ALL voters</strong> from this election?
              </p>
              <p style={styles.deleteWarning}>
                This action cannot be undone. <strong>{totalRecords}</strong> voters will be permanently removed.
              </p>
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowDeleteAllModal(false)}>
                Cancel
              </button>
              <button style={styles.confirmDeleteBtn} onClick={confirmDeleteAll}>
                <FiTrash2 size={16} /> Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        @media (max-width: 768px) {
          .actions-bar {
            flex-direction: column;
          }
          .search-wrapper {
            max-width: 100% !important;
            width: 100%;
          }
          .button-group {
            width: 100%;
            justify-content: stretch;
          }
          .button-group button {
            flex: 1;
            justify-content: center;
          }
          .form-row {
            grid-template-columns: 1fr !important;
          }
          .election-selector-container {
            flex-direction: column;
            align-items: stretch;
          }
          .selector-wrapper {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { 
    padding: 'clamp(20px, 4vw, 32px)', 
    background: "#fff", 
    maxWidth: '1200px', 
    margin: '0 auto',
    marginTop: 'clamp(60px, 8vh, 80px)',
    minHeight: '100vh'
  },
  header: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '16px', 
    marginBottom: 'clamp(24px, 5vw, 32px)' 
  },
  headerIcon: {
    width: '56px',
    height: '56px',
    background: '#FEF3F0',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  title: { 
    fontSize: 'clamp(24px, 5vw, 28px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    marginBottom: '4px',
    fontFamily: "'Poppins', sans-serif"
  },
  subtitle: { 
    fontSize: '14px', 
    color: '#4b5563',
    fontFamily: "'Poppins', sans-serif"
  },
  
  electionSelectorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
    padding: '16px 20px',
    background: '#f8fafc',
    borderRadius: '16px',
    border: '1px solid #e5e7eb'
  },
  selectorWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'white',
    padding: '10px 16px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    minWidth: '250px'
  },
  electionSelect: {
    flex: 1,
    border: 'none',
    background: 'transparent',
    padding: '8px 0',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
    cursor: 'pointer',
    color: '#1a1a1a',
    appearance: 'none',
    fontFamily: "'Poppins', sans-serif"
  },
  selectArrow: {
    position: 'absolute',
    right: '16px',
    pointerEvents: 'none',
    color: '#9ca3af'
  },
  selectedElectionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontFamily: "'Poppins', sans-serif"
  },
  selectedElectionLabel: {
    color: '#6b7280'
  },
  selectedElectionValue: {
    fontWeight: '700',
    color: '#D23A01'
  },
  
  noElections: {
    textAlign: 'center',
    padding: 'clamp(40px, 8vw, 60px)',
    background: '#f8fafc',
    borderRadius: '16px',
    color: '#4b5563',
    fontSize: '15px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px'
  },
  
  actionsBar: { 
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
    maxWidth: '350px' 
  },
  searchIcon: { 
    position: 'absolute', 
    left: '14px', 
    top: '50%', 
    transform: 'translateY(-50%)', 
    color: '#94a3b8' 
  },
  searchInput: { 
    width: '100%', 
    padding: '12px 16px 12px 42px', 
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    outline: 'none',
    transition: 'all 0.2s'
  },
  buttonGroup: { 
    display: 'flex', 
    gap: '12px', 
    flexWrap: 'wrap' 
  },
  refreshBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '10px 20px', 
    background: '#f1f5f9', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif"
  },
  addBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '10px 20px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif"
  },
  uploadBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '10px 20px', 
    background: '#023430',
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif"
  },
  deleteAllBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '10px 20px', 
    background: '#fee2e2', 
    color: '#dc2626', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif"
  },
  
  pagination: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: '16px', 
    padding: '24px', 
    borderTop: '1px solid #e5e7eb',
    marginTop: '24px'
  },
  pageBtn: { 
    padding: '8px 20px', 
    background: '#f1f5f9', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif"
  },
  pageInfo: { 
    fontSize: '14px', 
    color: '#1a1a1a',
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif"
  },
  recordInfo: {
    textAlign: 'center',
    padding: '16px',
    fontSize: '13px',
    color: '#6b7280',
    borderTop: '1px solid #e5e7eb',
    marginTop: '16px',
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
    background: 'white', 
    borderRadius: '24px', 
    width: '90%', 
    maxWidth: '500px', 
    maxHeight: '90vh', 
    overflow: 'auto' 
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
    color: '#1a1a1a',
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
    padding: '24px',
    textAlign: 'center'
  },
  modalError: { 
    background: '#fef2f2', 
    color: '#dc2626', 
    padding: '12px 16px', 
    borderRadius: '10px', 
    marginBottom: '20px', 
    fontSize: '13px',
    fontFamily: "'Poppins', sans-serif"
  },
  modalFooter: { 
    display: 'flex', 
    justifyContent: 'flex-end', 
    gap: '12px', 
    padding: '16px 24px', 
    borderTop: '1px solid #e5e7eb' 
  },
  formRow: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '16px', 
    marginBottom: '16px' 
  },
  formGroup: { 
    marginBottom: '20px',
    textAlign: 'left'
  },
  formLabel: { 
    display: 'block', 
    fontSize: '13px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    marginBottom: '8px',
    fontFamily: "'Poppins', sans-serif"
  },
  required: {
    color: '#D23A01',
    fontSize: '12px'
  },
  optional: {
    color: '#9ca3af',
    fontSize: '12px',
    fontWeight: '400'
  },
  input: { 
    width: '100%', 
    padding: '12px 14px', 
    border: '2px solid #e5e7eb', 
    borderRadius: '10px', 
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    outline: 'none',
    transition: 'all 0.2s'
  },
  inputError: {
    borderColor: '#dc2626',
    background: '#fef2f2'
  },
  fieldError: {
    display: 'block',
    fontSize: '11px',
    color: '#dc2626',
    marginTop: '4px',
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif"
  },
  cancelBtn: { 
    padding: '10px 20px', 
    background: '#f1f5f9', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4b5563',
    fontFamily: "'Poppins', sans-serif"
  },
  saveBtn: { 
    padding: '10px 24px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  confirmDeleteBtn: { 
    padding: '10px 24px', 
    background: '#dc2626', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
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
    color: '#6b7280',
    marginBottom: 0,
    fontFamily: "'Poppins', sans-serif"
  },
  spinner: {
    animation: 'spin 1s linear infinite'
  }
};

export default VoterListManager;