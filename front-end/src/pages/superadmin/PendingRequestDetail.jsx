// components/superadmin/PendingRequestDetail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiArrowLeft, FiCheck, FiX, FiMail, FiPhone, FiUser, 
  FiCalendar, FiHome, FiCode, FiAlertCircle, FiLoader,
  FiCheckCircle, FiXCircle, FiFileText, FiMapPin
} from 'react-icons/fi';
import { getInstitutionById, approveInstitution, rejectInstitution, clearError, clearSuccess } from '../../Js/institution-slice';

const PendingRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedInstitution, loading, error, success } = useSelector(state => state.institution);
  
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(getInstitutionById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (success) {
      showToast('Institution processed successfully!', 'success');
      setTimeout(() => navigate('/superAdmin/manage-institutions'), 1500);
    }
    if (error) {
      showToast(error, 'error');
      dispatch(clearError());
    }
  }, [success, error, navigate, dispatch]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await dispatch(approveInstitution({ id, adminNotes })).unwrap();
      showToast('Institution approved successfully!', 'success');
      setTimeout(() => navigate('/superAdmin/manage-institutions'), 1500);
    } catch (err) {
      showToast(err || 'Failed to approve institution', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showToast('Please provide a rejection reason', 'error');
      return;
    }
    
    setSubmitting(true);
    try {
      await dispatch(rejectInstitution({ id, rejectionReason })).unwrap();
      showToast('Institution rejected successfully', 'success');
      setTimeout(() => navigate('/superAdmin/manage-institutions'), 1500);
    } catch (err) {
      showToast(err || 'Failed to reject institution', 'error');
    } finally {
      setSubmitting(false);
      setShowRejectModal(false);
      setRejectionReason('');
    }
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p>Loading request details...</p>
      </div>
    );
  }

  if (!selectedInstitution) {
    return (
      <div style={styles.errorContainer}>
        <FiAlertCircle size={48} color="#dc2626" />
        <h2>Request not found</h2>
        <button onClick={() => navigate('/superAdmin/manage-institutions')} style={styles.backBtn}>
          <FiArrowLeft size={16} /> Back to Institutions
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Toast */}
      {toast && (
        <div style={{ ...styles.toast, backgroundColor: toast.type === 'error' ? '#dc2626' : '#10b981' }}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <FiArrowLeft size={18} /> Back
        </button>
        <h1 style={styles.title}>Review Institution Request</h1>
        <div style={styles.headerActions}>
          <button 
            style={styles.approveBtn} 
            onClick={handleApprove}
            disabled={submitting}
          >
            {submitting ? <FiLoader size={18} className="spin" /> : <FiCheck size={18} />}
            Approve
          </button>
          <button 
            style={styles.rejectBtn} 
            onClick={() => setShowRejectModal(true)}
            disabled={submitting}
          >
            <FiX size={18} /> Reject
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.contentCard}>
        <div style={styles.cardHeader}>
          <div style={styles.cardIcon}>
            <FiHome size={40} color="#D23A01" />
          </div>
          <div>
            <h2 style={styles.instName}>{selectedInstitution.name}</h2>
            <span style={styles.instCode}>
              <FiCode size={14} /> Code: {selectedInstitution.code}
            </span>
          </div>
        </div>

        <div style={styles.infoSection}>
          <h3 style={styles.sectionTitle}>Institution Information</h3>
          <div style={styles.infoGrid}>
            <div style={styles.infoRow}>
              <FiMail size={16} style={styles.infoIcon} />
              <span style={styles.infoLabel}>Email:</span>
              <span style={styles.infoValue}>{selectedInstitution.email}</span>
            </div>
            <div style={styles.infoRow}>
              <FiPhone size={16} style={styles.infoIcon} />
              <span style={styles.infoLabel}>Phone:</span>
              <span style={styles.infoValue}>{selectedInstitution.phone}</span>
            </div>
            {selectedInstitution.address && (
              <div style={styles.infoRow}>
                <FiMapPin size={16} style={styles.infoIcon} />
                <span style={styles.infoLabel}>Address:</span>
                <span style={styles.infoValue}>{selectedInstitution.address}</span>
              </div>
            )}
            <div style={styles.infoRow}>
              <FiUser size={16} style={styles.infoIcon} />
              <span style={styles.infoLabel}>Requested by:</span>
              <span style={styles.infoValue}>
                {selectedInstitution.requestedBy?.firstName} {selectedInstitution.requestedBy?.lastName}
              </span>
            </div>
            <div style={styles.infoRow}>
              <FiCalendar size={16} style={styles.infoIcon} />
              <span style={styles.infoLabel}>Submitted on:</span>
              <span style={styles.infoValue}>
                {new Date(selectedInstitution.createdAt).toLocaleDateString()} at{' '}
                {new Date(selectedInstitution.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>

        {selectedInstitution.about && (
          <div style={styles.aboutSection}>
            <h3 style={styles.sectionTitle}>About Institution</h3>
            <p style={styles.aboutText}>{selectedInstitution.about}</p>
          </div>
        )}

        <div style={styles.adminSection}>
          <h3 style={styles.sectionTitle}>Admin Notes (Optional)</h3>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add any internal notes about this institution..."
            rows={3}
            style={styles.textarea}
          />
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div style={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Reject Institution Request</h3>
              <button onClick={() => setShowRejectModal(false)} style={styles.modalClose}>×</button>
            </div>
            <div style={styles.modalBody}>
              <FiXCircle size={48} color="#dc2626" />
              <p>Are you sure you want to reject <strong>{selectedInstitution.name}</strong>?</p>
              <div style={styles.formGroup}>
                <label style={styles.label}>Rejection Reason <span style={styles.required}>*</span></label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this institution request is being rejected..."
                  rows={4}
                  style={styles.textarea}
                  required
                />
                <p style={styles.helperText}>This reason will be shared with the requester.</p>
              </div>
            </div>
            <div style={styles.modalActions}>
              <button onClick={() => setShowRejectModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleReject} disabled={submitting} style={styles.confirmRejectBtn}>
                {submitting ? <FiLoader size={16} className="spin" /> : <FiX size={16} />}
                Confirm Rejection
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
        .spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    padding: 'clamp(24px, 5vw, 40px)',
    maxWidth: '900px',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  toast: {
    position: 'fixed',
    top: '80px',
    right: '20px',
    padding: '12px 20px',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  title: {
    fontSize: 'clamp(24px, 5vw, 28px)',
    fontWeight: '800',
    color: '#1a1a1a',
    margin: 0
  },
  headerActions: {
    display: 'flex',
    gap: '12px'
  },
  approveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  rejectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  },
  contentCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: 'clamp(24px, 5vw, 32px)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '32px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e5e7eb',
    flexWrap: 'wrap'
  },
  cardIcon: {
    width: '64px',
    height: '64px',
    backgroundColor: '#FEF3F0',
    borderRadius: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  instName: {
    fontSize: 'clamp(22px, 5vw, 26px)',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '6px'
  },
  instCode: {
    fontSize: '13px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  infoSection: {
    marginBottom: '28px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '16px'
  },
  infoGrid: {
    display: 'grid',
    gap: '14px'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    padding: '8px 0',
    borderBottom: '1px solid #f1f5f9'
  },
  infoIcon: {
    color: '#9ca3af',
    width: '20px'
  },
  infoLabel: {
    width: '110px',
    fontWeight: '600',
    color: '#4b5563'
  },
  infoValue: {
    flex: 1,
    color: '#1a1a1a',
    fontWeight: '500'
  },
  aboutSection: {
    marginBottom: '28px'
  },
  aboutText: {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#4b5563'
  },
  adminSection: {
    marginTop: '8px'
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none',
    transition: 'all 0.2s'
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
    width: '48px',
    height: '48px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #D23A01',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px',
    color: '#4b5563'
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    marginTop: '16px'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '700',
    margin: 0,
    color: '#1a1a1a'
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#9ca3af'
  },
  modalBody: {
    textAlign: 'center',
    padding: '24px'
  },
  formGroup: {
    textAlign: 'left',
    marginTop: '20px'
  },
  label: {
    display: 'block',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#1a1a1a',
    fontSize: '13px'
  },
  required: {
    color: '#D23A01'
  },
  helperText: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '4px'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    padding: '16px 20px',
    borderTop: '1px solid #e5e7eb'
  },
  cancelBtn: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  confirmRejectBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600'
  }
};

export default PendingRequestDetail;