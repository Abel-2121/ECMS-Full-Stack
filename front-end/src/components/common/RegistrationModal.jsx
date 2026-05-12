import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerForElection, resetRegistrationState, clearError } from '../../Js/voterRegistration-slice';
import { FiX, FiMail, FiCheckCircle, FiAlertCircle, FiLoader, FiSend, FiInbox,FiAward,FiUserCheck,FiFileText } from 'react-icons/fi';

const RegistrationModal = ({ election, isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { isLoading, error, registrationSuccess, registrationData } = useSelector(state => state.voterRegistration);
  const [email, setEmail] = useState('');

  if (!isOpen || !election) return null;

  const handleRegister = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }
    await dispatch(registerForElection({ electionId: election._id, email }));
  };

  const handleClose = () => {
    dispatch(resetRegistrationState());
    setEmail('');
    onClose();
  };

  if (registrationSuccess) {
    return (
      <div style={styles.overlay} onClick={handleClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <button style={styles.closeBtn} onClick={handleClose}>
            <FiX size={22} />
          </button>
          
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>
              <FiCheckCircle size={56} />
            </div>
            <h2 style={styles.successTitle}>Registration Successful!</h2>
            <p style={styles.successMessage}>
              You have successfully registered for <strong>{election.title}</strong>
            </p>
            <div style={styles.emailInfo}>
              <FiMail size={16} />
              <span>Credentials sent to: <strong>{email}</strong></span>
            </div>
            <div style={styles.instructionBox}>
              <h4><FiInbox size={16} /> Check Your Email</h4>
              <p>We have sent your voting credentials to your email address. Please check your inbox (and spam folder) for:</p>
              <ul>
                <li><FiAward size={12} /> Election ID</li>
                <li><FiUserCheck size={12} /> Voter ID</li>
                <li><FiFileText size={12} /> Voting Instructions</li>
              </ul>
            </div>
            <button style={styles.doneBtn} onClick={handleClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={handleClose}>
          <FiX size={22} />
        </button>

        <div style={styles.header}>
          <div style={styles.headerIcon}>
            <FiSend size={40} />
          </div>
          <h2 style={styles.title}>Register for Election</h2>
          <p style={styles.subtitle}>
            Enter your email address to register for <strong>{election.title}</strong>
          </p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <FiAlertCircle size={16} />
            <span>{error}</span>
            <button onClick={() => dispatch(clearError())}>×</button>
          </div>
        )}

        <div style={styles.formGroup}>
          <label style={styles.label}>Email Address</label>
          <div style={styles.inputWrapper}>
            <FiMail size={18} style={styles.inputIcon} />
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>
          <p style={styles.hint}>
            Make sure to use the email address that was provided to the election administrator.
          </p>
        </div>

        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={handleClose}>
            Cancel
          </button>
          <button 
            style={styles.registerBtn} 
            onClick={handleRegister}
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <>
                <FiLoader size={18} className="spin" /> Registering...
              </>
            ) : (
              'Register Now'
            )}
          </button>
        </div>

        <style>{`
          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  modal: {
    background: 'white',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '500px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    position: 'relative'
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9ca3af',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    zIndex: 10
  },
  header: {
    textAlign: 'center',
    padding: '32px 24px 24px',
    borderBottom: '1px solid #e5e7eb'
  },
  headerIcon: {
    color: '#D23A01',
    marginBottom: '16px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '8px',
    
  },
  subtitle: {
    fontSize: '14px',
    color: '#4b5563',
    
  },
  formGroup: {
    padding: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '8px',
    
  },
  inputWrapper: {
    position: 'relative'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af'
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 44px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
    
  },
  hint: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '8px',
    
  },
  errorBox: {
    margin: '0 24px 20px 24px',
    padding: '12px 16px',
    background: '#fee2e2',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#dc2626',
    fontSize: '13px',
    
  },
  actions: {
    display: 'flex',
    gap: '12px',
    padding: '20px 24px 32px',
    borderTop: '1px solid #e5e7eb',
    background: '#fafafa'
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4b5563',
    
  },
  registerBtn: {
    flex: 1,
    padding: '12px',
    background: '#D23A01',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    
  },
  successContainer: {
    padding: '32px 24px',
    textAlign: 'center'
  },
  successIcon: {
    width: '88px',
    height: '88px',
    background: '#D23A0110',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    color: '#D23A01'
  },
  successTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '10px',
    
  },
  successMessage: {
    fontSize: '14px',
    color: '#4b5563',
    marginBottom: '20px',
    
  },
  emailInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '10px',
    marginBottom: '20px',
    fontSize: '13px',
    
  },
  instructionBox: {
    textAlign: 'left',
    padding: '16px 20px',
    background: '#D23A0110',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  instructionBox: {
    textAlign: 'left',
    padding: '18px',
    background: '#f8fafc',
    borderRadius: '12px',
    marginBottom: '24px'
  },
  doneBtn: {
    width: '100%',
    padding: '14px',
    background: '#023430',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    color: 'white',
    
  }
};

export default RegistrationModal;