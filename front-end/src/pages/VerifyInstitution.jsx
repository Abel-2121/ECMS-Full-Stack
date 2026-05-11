// pages/VerifyInstitution.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiLoader,FiCode, FiShield, FiAlertTriangle, FiUser, FiMail, FiHome, FiCalendar } from 'react-icons/fi';
import axiosPublic from '../utils/axiosPublic';

const VerifyInstitution = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [requestDetails, setRequestDetails] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await axiosPublic.get(`/institution/verify/${token}`);
        setRequestDetails(response.data.data);
        setStatus('confirm');
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Invalid or expired verification link');
      }
    };
    fetchDetails();
  }, [token]);

  const handleConfirm = async () => {
    setStatus('loading');
    try {
      const response = await axiosPublic.post(`/institution/verify/${token}/confirm`);
      setStatus('success');
      setMessage(response.data.message);
      setTimeout(() => navigate('/'), 5000);
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleDeny = () => {
    navigate('/');
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loadingIcon}>
            <FiLoader size={56} className="spin" color="#D23A01" />
          </div>
          <h2 style={styles.title}>Verifying Request</h2>
          <p style={styles.message}>Please wait while we fetch your request details.</p>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin { animation: spin 1s linear infinite; }
        `}</style>
      </div>
    );
  }

  // Confirmation page with warning details
  if (status === 'confirm' && requestDetails) {
    return (
      <div style={styles.container}>
        <div style={styles.confirmCard}>
          <div style={styles.warningIconWrapper}>
            <FiAlertTriangle size={56} color="#f59e0b" />
          </div>
          <h2 style={styles.confirmTitle}>Confirm Institution Verification</h2>
          
          <div style={styles.warningBox}>
            <p style={styles.warningHeader}>
              <FiAlertTriangle size={14} /> Before you confirm, understand:
            </p>
            <ul style={styles.warningList}>
              <li>You are verifying <strong>{requestDetails.institutionName}</strong> as a legitimate institution</li>
              <li>The requester <strong>{requestDetails.requesterName}</strong> ({requestDetails.requesterEmail}) will become ElectionAdmin</li>
              <li>This person will have full control over your institution's elections</li>
              <li>They can create elections, manage voters, and publish results</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>

          <div style={styles.detailsBox}>
            <h3 style={styles.detailsTitle}>Request Details</h3>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}><FiHome size={14} /> Institution</span>
              <span style={styles.detailValue}>{requestDetails.institutionName}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}><FiCode size={14} /> Code</span>
              <span style={styles.detailValue}>{requestDetails.institutionCode}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}><FiMail size={14} /> Email</span>
              <span style={styles.detailValue}>{requestDetails.institutionEmail}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}><FiUser size={14} /> Requester</span>
              <span style={styles.detailValue}>{requestDetails.requesterName}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}><FiMail size={14} /> Requester Email</span>
              <span style={styles.detailValue}>{requestDetails.requesterEmail}</span>
            </div>
            <div style={styles.detailRow}>
              <span style={styles.detailLabel}><FiCalendar size={14} /> Request Date</span>
              <span style={styles.detailValue}>{new Date(requestDetails.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div style={styles.buttonGroup}>
            <button onClick={handleConfirm} style={styles.confirmButton}>
              <FiCheckCircle size={18} /> Confirm & Verify
            </button>
            <button onClick={handleDeny} style={styles.denyButton}>
              <FiAlertCircle size={18} /> Deny Request
            </button>
          </div>

          <p style={styles.footerNote}>
            If you did not expect this request, you can safely deny it.
            No changes will be made to your institution.
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <FiCheckCircle size={64} />
          </div>
          <h2 style={styles.successTitle}>Verified Successfully!</h2>
          <p style={styles.successMessage}>{message}</p>
          <p style={styles.note}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div style={styles.container}>
      <div style={styles.errorCard}>
        <div style={styles.errorIcon}>
          <FiAlertCircle size={64} />
        </div>
        <h2 style={styles.errorTitle}>Verification Failed</h2>
        <p style={styles.errorMessage}>{message}</p>
        <button onClick={() => navigate('/request-institution')} style={styles.button}>
          Go Back
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(20px, 5vw, 32px)',
    fontFamily: "'Poppins', sans-serif"
  },
  // Loading Card
  card: {
    background: 'white',
    borderRadius: '28px',
    padding: 'clamp(32px, 6vw, 48px)',
    textAlign: 'center',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  loadingIcon: {
    marginBottom: '20px'
  },
  title: {
    fontSize: 'clamp(24px, 5vw, 28px)',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif"
  },
  message: {
    fontSize: '15px',
    color: '#6b7280',
    lineHeight: '1.5',
    fontFamily: "'Poppins', sans-serif"
  },
  // Confirmation Card
  confirmCard: {
    background: 'white',
    borderRadius: '28px',
    padding: 'clamp(28px, 5vw, 40px)',
    maxWidth: '580px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  warningIconWrapper: {
    textAlign: 'center',
    marginBottom: '20px'
  },
  confirmTitle: {
    fontSize: 'clamp(22px, 5vw, 26px)',
    fontWeight: '800',
    color: '#f59e0b',
    textAlign: 'center',
    marginBottom: '24px',
    fontFamily: "'Poppins', sans-serif"
  },
  warningBox: {
    background: '#fffbeb',
    border: '1px solid #fcd34d',
    borderRadius: '16px',
    padding: 'clamp(16px, 3vw, 20px)',
    marginBottom: '24px'
  },
  warningHeader: {
    color: '#92400e',
    fontSize: '14px',
    fontWeight: '700',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'Poppins', sans-serif"
  },
  warningList: {
    color: '#78350f',
    fontSize: '13px',
    paddingLeft: '20px',
    margin: 0,
    lineHeight: '1.7',
    fontFamily: "'Poppins', sans-serif"
  },
  detailsBox: {
    background: '#f8fafc',
    borderRadius: '16px',
    padding: 'clamp(16px, 3vw, 20px)',
    marginBottom: '24px',
    border: '1px solid #e5e7eb'
  },
  detailsTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '16px',
    fontFamily: "'Poppins', sans-serif"
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
    flexWrap: 'wrap',
    gap: '8px'
  },
  detailLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '600',
    color: '#6b7280',
    fontFamily: "'Poppins', sans-serif"
  },
  detailValue: {
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif"
  },
  buttonGroup: {
    display: 'flex',
    gap: '14px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  confirmButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 20px',
    background: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s'
  },
  denyButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 20px',
    background: '#023430',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s'
  },
  footerNote: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: '1.5',
    fontFamily: "'Poppins', sans-serif"
  },
  // Success Card
  successCard: {
    background: 'white',
    borderRadius: '28px',
    padding: 'clamp(32px, 6vw, 48px)',
    textAlign: 'center',
    maxWidth: '480px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  successIcon: {
    width: '88px',
    height: '88px',
    background: '#10b981',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    color: 'white'
  },
  successTitle: {
    fontSize: 'clamp(24px, 5vw, 28px)',
    fontWeight: '800',
    color: '#10b981',
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif"
  },
  successMessage: {
    fontSize: '15px',
    color: '#4b5563',
    marginBottom: '16px',
    lineHeight: '1.5',
    fontFamily: "'Poppins', sans-serif"
  },
  note: {
    fontSize: '13px',
    color: '#9ca3af',
    fontFamily: "'Poppins', sans-serif"
  },
  // Error Card
  errorCard: {
    background: 'white',
    borderRadius: '28px',
    padding: 'clamp(32px, 6vw, 48px)',
    textAlign: 'center',
    maxWidth: '450px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  errorIcon: {
    width: '88px',
    height: '88px',
    background: '#fee2e2',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    color: '#dc2626'
  },
  errorTitle: {
    fontSize: 'clamp(24px, 5vw, 28px)',
    fontWeight: '800',
    color: '#dc2626',
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif"
  },
  errorMessage: {
    fontSize: '15px',
    color: '#4b5563',
    marginBottom: '24px',
    fontFamily: "'Poppins', sans-serif"
  },
  button: {
    padding: '12px 28px',
    background: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s'
  }
};

export default VerifyInstitution;