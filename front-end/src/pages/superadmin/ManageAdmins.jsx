// pages/superAdmin/ManageAdmins.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff, 
  FiMail, FiPhone, FiShield, FiUser, FiClock, 
  FiCheck, FiX, FiLoader, FiRefreshCw, FiSearch, 
  FiAlertCircle, FiSend, FiCheckCircle, FiHome
} from 'react-icons/fi';
import axiosPrivate from '../../utils/axiosPrivate';
import { securityValidators } from '../../utils/validators';
import { formatLocalDate } from '../../utils/formatLocalDate';
import ErrorModal from '../../components/ErrorModal';

const ManageAdmins = () => {
  const navigate = useNavigate();

  const [admins, setAdmins] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  // Hover state for floating actions
  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [hoveredRowPosition, setHoveredRowPosition] = useState({ top: 0, left: 0 });
  const rowRefs = useRef({});
  const hoverTimerRef = useRef(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'electionAdmin',
    institutionId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const adminsResponse = await axiosPrivate.get('/admin');
      setAdmins(adminsResponse.data.data?.admins || []);
      
      const institutionsResponse = await axiosPrivate.get('/institution');
      setInstitutions(institutionsResponse.data.data?.institutions || []);
    } catch (error) {
      setErrorModal({ isOpen: true, message: error.response?.data?.message || 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const getInstitutionName = (admin) => {
    if (admin.institutionName) return admin.institutionName;
    if (admin.institutionId) {
      const institution = institutions.find(i => i._id === admin.institutionId);
      return institution ? institution.name : 'N/A';
    }
    return 'N/A';
  };

  const getAdminPhoto = (admin) => {
    if (admin.photo) return admin.photo;
    return null;
  };

  const validateFirstName = (value) => securityValidators.isValidName(value, 'First name');
  const validateLastName = (value) => securityValidators.isValidName(value, 'Last name');
  const validateEmail = (value) => securityValidators.isValidEmail(value);
  const validatePhone = (value) => {
    if (!value) return null;
    return securityValidators.isValidPhone(value);
  };
  const validatePassword = (value) => securityValidators.isStrongPassword(value);
  const validateInstitution = (value) => {
    if (!value) return 'Institution is required';
    return null;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let error = null;
    switch (field) {
      case 'firstName': error = validateFirstName(formData.firstName); break;
      case 'lastName': error = validateLastName(formData.lastName); break;
      case 'email': error = validateEmail(formData.email); break;
      case 'phone': error = validatePhone(formData.phone); break;
      case 'password': error = validatePassword(formData.password); break;
      case 'institutionId': error = validateInstitution(formData.institutionId); break;
      default: break;
    }
    setFormErrors(prev => ({ ...prev, [field]: error }));
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
    const institutionError = validateInstitution(formData.institutionId);
    if (institutionError) errors.institutionId = institutionError;
    if (!showEditModal) {
      const passwordError = validatePassword(formData.password);
      if (passwordError) errors.password = passwordError;
    }
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const clearHoverTimer = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  };

  const handleRowMouseEnter = (adminId, event) => {
    clearHoverTimer();
    const rowElement = rowRefs.current[adminId];
    if (rowElement) {
      const rect = rowElement.getBoundingClientRect();
      setHoveredRowPosition({
        top: rect.top + window.scrollY + 8,
        left: rect.right - 260
      });
    }
    setHoveredRowId(adminId);
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

  const handleOpenConfirmModal = (e) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, phone: true, password: true, institutionId: true });
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setShowConfirmModal(true);
  };

  const handleConfirmAddAdmin = async () => {
    setSubmitting(true);
    try {
      const response = await axiosPrivate.post('/admin', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'electionAdmin',
        institutionId: formData.institutionId
      });
      setAdmins([response.data.data.admin, ...admins]);
      setShowAddModal(false);
      setShowConfirmModal(false);
      resetForm();
      showToast('Admin created successfully');
    } catch (error) {
      setFormErrors({ general: error.response?.data?.message || 'Failed to create admin' });
      setShowConfirmModal(false);
      setErrorModal({ isOpen: true, message: error.response?.data?.message || 'Failed to create admin' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    setTouched({ firstName: true, lastName: true, email: true, phone: true });
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await axiosPrivate.patch(`/admin/${selectedAdmin._id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      });
      setAdmins(admins.map(a => a._id === selectedAdmin._id ? response.data.data.admin : a));
      setShowEditModal(false);
      resetForm();
      showToast('Admin updated successfully');
    } catch (error) {
      setFormErrors({ general: error.response?.data?.message || 'Failed to update admin' });
      setErrorModal({ isOpen: true, message: error.response?.data?.message || 'Failed to update admin' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    try {
      const response = await axiosPrivate.patch(`/admin/${admin._id}/toggle-status`);
      setAdmins(admins.map(a => a._id === admin._id ? { ...a, status: response.data.data.status } : a));
      showToast(`Admin ${response.data.data.status === 'Active' ? 'activated' : 'deactivated'}`);
    } catch (error) {
      setErrorModal({ isOpen: true, message: error.response?.data?.message || 'Failed to change status' });
    }
  };

  const handleResetPassword = async () => {
    setSubmitting(true);
    try {
      await axiosPrivate.post(`/admin/${selectedAdmin._id}/resend-invitation`);
      setShowResetModal(false);
      showToast(`Password reset email sent to ${selectedAdmin.email}`);
    } catch (error) {
      setErrorModal({ isOpen: true, message: error.response?.data?.message || 'Failed to reset password' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = async () => {
    setSubmitting(true);
    try {
      await axiosPrivate.delete(`/admin/${selectedAdmin._id}`);
      setAdmins(admins.filter(a => a._id !== selectedAdmin._id));
      setShowDeleteModal(false);
      showToast('Admin deleted successfully');
    } catch (error) {
      setErrorModal({ isOpen: true, message: error.response?.data?.message || 'Failed to delete admin' });
      setShowDeleteModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setFormData({
      firstName: admin.firstName || '',
      lastName: admin.lastName || '',
      email: admin.email || '',
      phone: admin.phone || '',
      role: admin.role || 'electionAdmin',
      institutionId: admin.institutionId || admin.institutionId?._id || ''
    });
    setFormErrors({});
    setTouched({});
    setShowEditModal(true);
  };

  const openDetailModal = (admin) => {
    setSelectedAdmin(admin);
    setShowDetailModal(true);
  };

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  const openResetModal = (admin) => {
    setSelectedAdmin(admin);
    setShowResetModal(true);
  };

  const resetForm = () => {
    setFormData({ 
      firstName: '', 
      lastName: '', 
      email: '', 
      phone: '', 
      password: '', 
      role: 'electionAdmin',
      institutionId: ''
    });
    setFormErrors({});
    setTouched({});
    setSelectedAdmin(null);
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      admin.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getInstitutionName(admin)?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && admin.status === 'Active') ||
      (statusFilter === 'inactive' && admin.status === 'Inactive');
    return matchesSearch && matchesStatus;
  });

  const showFieldError = (field) => touched[field] && formErrors[field];

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p>Loading administrators...</p>
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

      {toastMessage && (
        <div style={{ ...styles.toast, backgroundColor: toastMessage.type === 'error' ? '#dc2626' : '#D23A01' }}>
          <span>{toastMessage.message}</span>
        </div>
      )}

      <div style={styles.header}>
        <h1 style={styles.title}>Manage Administrators</h1>
        <button style={styles.addButton} onClick={() => setShowAddModal(true)}>
          <FiPlus size={16} /> Add Admin
        </button>
      </div>

      <div style={styles.searchBar}>
        <div style={styles.searchWrapper}>
          <FiSearch size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name, email or institution..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.filterSelect}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button onClick={loadData} style={styles.refreshBtn}>
          <FiRefreshCw size={16} />
        </button>
      </div>

      {/* Table - NO ACTION BUTTONS COLUMN */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>Admin</th>
              <th style={styles.tableHeader}>Email</th>
              <th style={styles.tableHeader}>Phone</th>
              <th style={styles.tableHeader}>Institution</th>
              <th style={styles.tableHeader}>Role</th>
              <th style={styles.tableHeader}>Status</th>
              <th style={styles.tableHeader}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan="7" style={styles.noData}>
                  <FiAlertCircle size={32} />
                  <p>No administrators found</p>
                </td>
              </tr>
            ) : (
              filteredAdmins.map(admin => (
                <tr 
                  key={admin._id} 
                  ref={(el) => rowRefs.current[admin._id] = el}
                  style={styles.tableRow}
                  onMouseEnter={(e) => handleRowMouseEnter(admin._id, e)}
                  onMouseLeave={handleRowMouseLeave}
                >
                  <td style={styles.tableCell}>
                    <div style={styles.adminCell}>
                      <div style={styles.adminAvatar}>
                        {getAdminPhoto(admin) ? (
                          <img 
                            src={getAdminPhoto(admin)} 
                            alt={`${admin.firstName} ${admin.lastName}`}
                            style={styles.adminAvatarImage}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={styles.adminAvatarFallback}>
                            {admin.firstName?.[0]}{admin.lastName?.[0]}
                          </div>
                        )}
                      </div>
                      <div style={styles.adminName}>{admin.firstName} {admin.lastName}</div>
                    </div>
                  </td>
                  <td style={styles.tableCell}>{admin.email}</td>
                  <td style={styles.tableCell}>{admin.phone || '-'}</td>
                  <td style={styles.tableCell}>
                    <div style={styles.institutionCell}>
                      <FiHome size={14} color="#D23A01" />
                      <span>{getInstitutionName(admin)}</span>
                    </div>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={styles.roleBadge}>
                      {admin.role === 'electionAdmin' ? 'Election Admin' : admin.role}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: admin.status === 'Active' ? '#dcfce7' : '#fee2e2',
                      color: admin.status === 'Active' ? '#023430' : '#991b1b'
                    }}>
                      {admin.status}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{formatLocalDate(admin.createdAt, false)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Action Overlay - Only appears on hover */}
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
            const admin = admins.find(a => a._id === hoveredRowId);
            if (!admin) return null;
            
            return (
              <>
                <button
                  onClick={() => {
                    openDetailModal(admin);
                    setHoveredRowId(null);
                    clearHoverTimer();
                  }}
                  style={styles.floatingActionBtn}
                  title="View Details"
                >
                  <FiEye size={16} />
                </button>
                <button
                  onClick={() => {
                    openEditModal(admin);
                    setHoveredRowId(null);
                    clearHoverTimer();
                  }}
                  style={styles.floatingActionBtn}
                  title="Edit"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  onClick={() => {
                    handleToggleStatus(admin);
                    setHoveredRowId(null);
                    clearHoverTimer();
                  }}
                  style={styles.floatingActionBtn}
                  title={admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                >
                  {admin.status === 'Active' ? <FiX size={16} color="#dc2626" /> : <FiCheck size={16} color="#10b981" />}
                </button>
                <button
                  onClick={() => {
                    openResetModal(admin);
                    setHoveredRowId(null);
                    clearHoverTimer();
                  }}
                  style={styles.floatingActionBtn}
                  title="Reset Password"
                >
                  <FiRefreshCw size={16} />
                </button>
                <button
                  onClick={() => {
                    openDeleteModal(admin);
                    setHoveredRowId(null);
                    clearHoverTimer();
                  }}
                  style={{...styles.floatingActionBtn, color: '#dc2626'}}
                  title="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* ==================== ADD ADMIN MODAL ==================== */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => { setShowAddModal(false); resetForm(); }}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Add New Administrator</h3>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} style={styles.modalClose}>×</button>
            </div>
            <form onSubmit={handleOpenConfirmModal} style={styles.modalForm}>
              {formErrors.general && <div style={styles.errorMessage}>{formErrors.general}</div>}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label>First Name <span style={styles.required}>*</span></label>
                  <input name="firstName" value={formData.firstName} onChange={handleInputChange} onBlur={() => handleBlur('firstName')} style={{...styles.input, ...(showFieldError('firstName') && styles.inputError)}} />
                  {showFieldError('firstName') && <span style={styles.fieldError}>{formErrors.firstName}</span>}
                </div>
                <div style={styles.formGroup}>
                  <label>Last Name <span style={styles.required}>*</span></label>
                  <input name="lastName" value={formData.lastName} onChange={handleInputChange} onBlur={() => handleBlur('lastName')} style={{...styles.input, ...(showFieldError('lastName') && styles.inputError)}} />
                  {showFieldError('lastName') && <span style={styles.fieldError}>{formErrors.lastName}</span>}
                </div>
              </div>
              <div style={styles.formGroup}>
                <label>Email <span style={styles.required}>*</span></label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} onBlur={() => handleBlur('email')} style={{...styles.input, ...(showFieldError('email') && styles.inputError)}} />
                {showFieldError('email') && <span style={styles.fieldError}>{formErrors.email}</span>}
              </div>
              <div style={styles.formGroup}>
                <label>Phone <span style={styles.optional}>(Optional)</span></label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} onBlur={() => handleBlur('phone')} style={{...styles.input, ...(showFieldError('phone') && styles.inputError)}} />
                {showFieldError('phone') && <span style={styles.fieldError}>{formErrors.phone}</span>}
              </div>
              <div style={styles.formGroup}>
                <label>Institution <span style={styles.required}>*</span></label>
                <select name="institutionId" value={formData.institutionId} onChange={handleInputChange} onBlur={() => handleBlur('institutionId')} style={{...styles.select, ...(showFieldError('institutionId') && styles.inputError)}}>
                  <option value="">Select Institution</option>
                  {institutions.map(inst => (
                    <option key={inst._id} value={inst._id}>{inst.name}</option>
                  ))}
                </select>
                {showFieldError('institutionId') && <span style={styles.fieldError}>{formErrors.institutionId}</span>}
              </div>
              <div style={styles.formGroup}>
                <label>Password <span style={styles.required}>*</span></label>
                <div style={styles.passwordWrapper}>
                  <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} onBlur={() => handleBlur('password')} style={{...styles.input, ...(showFieldError('password') && styles.inputError)}} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
                {showFieldError('password') && <span style={styles.fieldError}>{formErrors.password}</span>}
                <p style={styles.helperText}>Minimum 8 characters with uppercase, lowercase, number, and special character</p>
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => { setShowAddModal(false); resetForm(); }} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" style={styles.submitBtn}>
                  <FiCheckCircle size={16} /> Review & Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== CONFIRMATION MODAL ==================== */}
      {showConfirmModal && (
        <div style={styles.modalOverlay} onClick={() => setShowConfirmModal(false)}>
          <div style={{...styles.modal, maxWidth: '500px'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Confirm Admin Creation</h3>
              <button onClick={() => setShowConfirmModal(false)} style={styles.modalClose}>×</button>
            </div>
            <div style={styles.confirmContent}>
              <FiCheckCircle size={48} color="#D23A01" />
              <p>Please review the administrator details below:</p>
              <div style={styles.confirmInfo}>
                <div style={styles.confirmRow}><span style={styles.confirmLabel}>Full Name:</span><span>{formData.firstName} {formData.lastName}</span></div>
                <div style={styles.confirmRow}><span style={styles.confirmLabel}>Email:</span><span>{formData.email}</span></div>
                <div style={styles.confirmRow}><span style={styles.confirmLabel}>Phone:</span><span>{formData.phone || 'Not provided'}</span></div>
                <div style={styles.confirmRow}><span style={styles.confirmLabel}>Institution:</span><span>{institutions.find(i => i._id === formData.institutionId)?.name || 'N/A'}</span></div>
                <div style={styles.confirmRow}><span style={styles.confirmLabel}>Role:</span><span>Election Administrator</span></div>
                <div style={styles.confirmRow}><span style={styles.confirmLabel}>Temporary Password:</span><span style={styles.confirmPassword}>••••••••</span></div>
              </div>
              <p style={styles.confirmNote}>An email with login credentials will be sent to the admin.</p>
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setShowConfirmModal(false)} style={styles.cancelBtn}>Edit Details</button>
              <button onClick={handleConfirmAddAdmin} disabled={submitting} style={styles.submitBtn}>
                {submitting ? <FiLoader size={16} style={styles.spinnerIcon} /> : <FiSend size={16} />}
                {submitting ? 'Creating...' : 'Confirm & Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== EDIT ADMIN MODAL ==================== */}
      {showEditModal && selectedAdmin && (
        <div style={styles.modalOverlay} onClick={() => { setShowEditModal(false); resetForm(); }}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Edit Administrator</h3>
              <button onClick={() => { setShowEditModal(false); resetForm(); }} style={styles.modalClose}>×</button>
            </div>
            <form onSubmit={handleUpdateAdmin} style={styles.modalForm}>
              {formErrors.general && <div style={styles.errorMessage}>{formErrors.general}</div>}
              <div style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label>First Name <span style={styles.required}>*</span></label>
                  <input name="firstName" value={formData.firstName} onChange={handleInputChange} onBlur={() => handleBlur('firstName')} style={{...styles.input, ...(showFieldError('firstName') && styles.inputError)}} />
                  {showFieldError('firstName') && <span style={styles.fieldError}>{formErrors.firstName}</span>}
                </div>
                <div style={styles.formGroup}>
                  <label>Last Name <span style={styles.required}>*</span></label>
                  <input name="lastName" value={formData.lastName} onChange={handleInputChange} onBlur={() => handleBlur('lastName')} style={{...styles.input, ...(showFieldError('lastName') && styles.inputError)}} />
                  {showFieldError('lastName') && <span style={styles.fieldError}>{formErrors.lastName}</span>}
                </div>
              </div>
              <div style={styles.formGroup}>
                <label>Email <span style={styles.required}>*</span></label>
                <input name="email" type="email" value={formData.email} onChange={handleInputChange} onBlur={() => handleBlur('email')} style={{...styles.input, ...(showFieldError('email') && styles.inputError)}} />
                {showFieldError('email') && <span style={styles.fieldError}>{formErrors.email}</span>}
              </div>
              <div style={styles.formGroup}>
                <label>Phone <span style={styles.optional}>(Optional)</span></label>
                <input name="phone" value={formData.phone} onChange={handleInputChange} onBlur={() => handleBlur('phone')} style={{...styles.input, ...(showFieldError('phone') && styles.inputError)}} />
                {showFieldError('phone') && <span style={styles.fieldError}>{formErrors.phone}</span>}
              </div>
              <div style={styles.modalActions}>
                <button type="button" onClick={() => { setShowEditModal(false); resetForm(); }} style={styles.cancelBtn}>Cancel</button>
                <button type="submit" disabled={submitting} style={styles.submitBtn}>
                  {submitting ? <FiLoader size={16} style={styles.spinnerIcon} /> : <FiCheck size={16} />}
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DETAIL MODAL ==================== */}
      {showDetailModal && selectedAdmin && (
        <div style={styles.modalOverlay} onClick={() => setShowDetailModal(false)}>
          <div style={{...styles.modal, maxWidth: '450px'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Admin Details</h3>
              <button onClick={() => setShowDetailModal(false)} style={styles.modalClose}>×</button>
            </div>
            <div style={styles.detailContent}>
              <div style={styles.detailAvatar}>
                {getAdminPhoto(selectedAdmin) ? (
                  <img 
                    src={getAdminPhoto(selectedAdmin)} 
                    alt={`${selectedAdmin.firstName} ${selectedAdmin.lastName}`}
                    style={styles.detailAvatarImage}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div style={styles.detailAvatarPlaceholder}>
                    {selectedAdmin.firstName?.[0]}{selectedAdmin.lastName?.[0]}
                  </div>
                )}
              </div>
              <h2>{selectedAdmin.firstName} {selectedAdmin.lastName}</h2>
              <div style={styles.detailInfo}>
                <div style={styles.detailRow}><FiMail size={18} /><div><div>Email</div><div>{selectedAdmin.email}</div></div></div>
                {selectedAdmin.phone && <div style={styles.detailRow}><FiPhone size={18} /><div><div>Phone</div><div>{selectedAdmin.phone}</div></div></div>}
                <div style={styles.detailRow}><FiHome size={18} /><div><div>Institution</div><div>{getInstitutionName(selectedAdmin)}</div></div></div>
                <div style={styles.detailRow}><FiShield size={18} /><div><div>Role</div><div>{selectedAdmin.role === 'electionAdmin' ? 'Election Administrator' : selectedAdmin.role}</div></div></div>
                <div style={styles.detailRow}><FiClock size={18} /><div><div>Joined</div><div>{formatLocalDate(selectedAdmin.createdAt, false)}</div></div></div>
                <div style={styles.detailRow}><FiUser size={18} /><div><div>Status</div><div><span style={{...styles.statusBadge, backgroundColor: selectedAdmin.status === 'Active' ? '#dcfce7' : '#fee2e2', color: selectedAdmin.status === 'Active' ? '#023430' : '#991b1b'}}>{selectedAdmin.status}</span></div></div></div>
              </div>
              <button onClick={() => setShowDetailModal(false)} style={styles.closeDetailBtn}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== RESET PASSWORD MODAL ==================== */}
      {showResetModal && selectedAdmin && (
        <div style={styles.modalOverlay} onClick={() => setShowResetModal(false)}>
          <div style={{...styles.modal, maxWidth: '400px'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Reset Password</h3>
              <button onClick={() => setShowResetModal(false)} style={styles.modalClose}>×</button>
            </div>
            <div style={styles.modalBody}>
              <FiAlertCircle size={48} color="#f59e0b" />
              <p>Are you sure you want to reset password for <strong>{selectedAdmin.firstName} {selectedAdmin.lastName}</strong>?</p>
              <p style={styles.warningText}>A new temporary password will be sent to their email.</p>
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setShowResetModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleResetPassword} disabled={submitting} style={{...styles.submitBtn, backgroundColor: '#f59e0b'}}>
                {submitting ? <FiLoader size={16} style={styles.spinnerIcon} /> : <FiRefreshCw size={16} />}
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE ADMIN MODAL ==================== */}
      {showDeleteModal && selectedAdmin && (
        <div style={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div style={{...styles.modal, maxWidth: '400px'}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>Delete Administrator</h3>
              <button onClick={() => setShowDeleteModal(false)} style={styles.modalClose}>×</button>
            </div>
            <div style={styles.modalBody}>
              <FiAlertCircle size={48} color="#dc2626" />
              <p>Are you sure you want to delete <strong>{selectedAdmin.firstName} {selectedAdmin.lastName}</strong>?</p>
              <p style={styles.warningText}>This action cannot be undone.</p>
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setShowDeleteModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleDeleteAdmin} disabled={submitting} style={{...styles.submitBtn, backgroundColor: '#dc2626'}}>
                {submitting ? <FiLoader size={16} style={styles.spinnerIcon} /> : <FiTrash2 size={16} />}
                Delete
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
        .spinner { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

const styles = {
  container: { padding: '32px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh', backgroundColor: '#f8fafc' },
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' },
  spinner: { width: '48px', height: '48px', border: '3px solid #e5e7eb', borderTop: '3px solid #D23A01', borderRadius: '50%' },
  toast: { position: 'fixed', top: '80px', right: '20px', padding: '12px 20px', borderRadius: '10px', color: 'white', fontSize: '14px', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '28px', fontWeight: '700', margin: 0, color: '#1a1a1a' },
  addButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 28px', backgroundColor: '#D23A01', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  searchBar: { display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' },
  searchWrapper: { flex: 1, position: 'relative', maxWidth: '400px' },
  searchIcon: { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' },
  searchInput: { width: '100%', padding: '12px 16px 12px 42px', border: '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none' },
  filterSelect: { padding: '12px 20px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: 'white', cursor: 'pointer', fontSize: '14px' },
  refreshBtn: { padding: '12px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  tableWrapper: { backgroundColor: 'white', borderRadius: '16px', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '900px' },
  tableHeaderRow: { backgroundColor: '#f8fafc', borderBottom: '1px solid #e5e7eb' },
  tableHeader: { textAlign: 'left', padding: '16px', fontWeight: '700', fontSize: '14px', color: '#1a1a1a', borderBottom: '1px solid #e5e7eb' },
  tableRow: { borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' },
  tableCell: { padding: '16px', fontSize: '14px', color: '#1a1a1a', verticalAlign: 'middle' },
  adminCell: { display: 'flex', alignItems: 'center', gap: '14px' },
  adminAvatar: { width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 },
  adminAvatarImage: { width: '100%', height: '100%', objectFit: 'cover' },
  adminAvatarFallback: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#D23A01', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '700' },
  adminName: { fontWeight: '600', fontSize: '14px' },
  institutionCell: { display: 'flex', alignItems: 'center', gap: '8px' },
  roleBadge: { padding: '4px 12px', backgroundColor: '#f1f5f9', borderRadius: '12px', fontSize: '12px', fontWeight: '500' },
  statusBadge: { padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', display: 'inline-block' },
  noData: { textAlign: 'center', padding: '60px', color: '#9ca3af' },
  
  // Floating Actions - appears only on hover
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
  modalForm: { padding: '20px' },
  formRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  formGroup: { marginBottom: '16px' },
  input: { width: '100%', padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none' },
  select: { width: '100%', padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', outline: 'none', backgroundColor: 'white' },
  inputError: { borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  fieldError: { display: 'block', fontSize: '11px', color: '#dc2626', marginTop: '4px' },
  passwordWrapper: { position: 'relative' },
  passwordToggle: { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' },
  helperText: { fontSize: '11px', color: '#9ca3af', marginTop: '4px' },
  required: { color: '#D23A01' },
  optional: { color: '#9ca3af', fontSize: '12px', fontWeight: 'normal' },
  errorMessage: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' },
  modalActions: { display: 'flex', gap: '12px', marginTop: '20px' },
  cancelBtn: { flex: 1, padding: '12px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  submitBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', backgroundColor: '#D23A01', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  spinnerIcon: { animation: 'spin 1s linear infinite' },
  confirmContent: { padding: '24px', textAlign: 'center' },
  confirmInfo: { backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', margin: '16px 0', textAlign: 'left' },
  confirmRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' },
  confirmLabel: { fontWeight: '600', color: '#1a1a1a' },
  confirmPassword: { fontFamily: 'monospace', fontSize: '14px' },
  confirmNote: { fontSize: '12px', color: '#6b7280', marginTop: '12px' },
  detailContent: { padding: '24px', textAlign: 'center' },
  detailAvatar: { display: 'flex', justifyContent: 'center', marginBottom: '16px' },
  detailAvatarImage: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' },
  detailAvatarPlaceholder: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#D23A01', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '700' },
  detailInfo: { textAlign: 'left', marginTop: '20px' },
  detailRow: { display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '12px 0', borderBottom: '1px solid #e5e7eb' },
  closeDetailBtn: { marginTop: '20px', padding: '10px 24px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' },
  modalBody: { textAlign: 'center', padding: '24px' },
  warningText: { fontSize: '13px', color: '#dc2626', marginTop: '8px' }
};

export default ManageAdmins;