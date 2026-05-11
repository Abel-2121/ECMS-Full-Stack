// components/common/ConfirmationModal.jsx
import React from 'react';
import { FiAlertTriangle, FiInfo, FiAlertCircle, FiX, FiCheckCircle } from 'react-icons/fi';

const ConfirmationModal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  type = 'danger', 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  loading = false
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch(type) {
      case 'danger':
        return {
          icon: <FiAlertCircle size={28} color="#dc2626" />,
          confirmBg: '#dc2626',
          confirmHover: '#b91c1c',
          iconBg: '#fee2e2'
        };
      case 'warning':
        return {
          icon: <FiAlertTriangle size={28} color="#f59e0b" />,
          confirmBg: '#f59e0b',
          confirmHover: '#d97706',
          iconBg: '#fef3c7'
        };
      case 'success':
        return {
          icon: <FiCheckCircle size={28} color="#10b981" />,
          confirmBg: '#10b981',
          confirmHover: '#059669',
          iconBg: '#dcfce7'
        };
      case 'info':
      default:
        return {
          icon: <FiInfo size={28} color="#3b82f6" />,
          confirmBg: '#3b82f6',
          confirmHover: '#2563eb',
          iconBg: '#eff6ff'
        };
    }
  };

  const typeStyles = getTypeStyles();

  // Prevent click on modal content from closing
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div style={styles.overlay} onClick={onCancel}>
      <div style={styles.modal} onClick={handleModalClick}>
        {/* Close button */}
        <button style={styles.closeBtn} onClick={onCancel}>
          <FiX size={20} />
        </button>
        
        {/* Icon */}
        <div style={{ ...styles.iconWrapper, background: typeStyles.iconBg }}>
          {typeStyles.icon}
        </div>
        
        {/* Title */}
        <h3 style={styles.title}>{title}</h3>
        
        {/* Message */}
        <p style={styles.message}>{message}</p>
        
        {/* Action Buttons */}
        <div style={styles.actions}>
          <button 
            style={styles.cancelBtn} 
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            style={{ 
              ...styles.confirmBtn, 
              background: typeStyles.confirmBg,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
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
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'fadeIn 0.2s ease-out'
  },
  modal: {
    position: 'relative',
    background: 'white',
    borderRadius: '20px',
    padding: '28px 24px 24px 24px',
    maxWidth: '450px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    animation: 'slideUp 0.3s ease-out'
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94a3b8',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'all 0.2s',
    ':hover': {
      background: '#f1f5f9',
      color: '#475569'
    }
  },
  iconWrapper: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto'
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '12px',
    lineHeight: 1.3
  },
  message: {
    fontSize: '14px',
    color: '#475569',
    marginBottom: '28px',
    lineHeight: '1.6'
  },
  actions: {
    display: 'flex',
    gap: '12px'
  },
  cancelBtn: {
    flex: 1,
    padding: '12px 16px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#475569',
    transition: 'all 0.2s',
    ':hover': {
      background: '#e2e8f0'
    }
  },
  confirmBtn: {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: 'white',
    transition: 'all 0.2s'
  }
};

// Add animation styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default ConfirmationModal;