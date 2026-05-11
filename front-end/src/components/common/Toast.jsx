// components/common/Toast.jsx
import React, { useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const Toast = ({ isOpen, message, type = 'success', onClose, autoClose = true, duration = 3000 }) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch(type) {
      case 'success':
        return {
          icon: <FiCheckCircle size={20} />,
          background: '#10b981',
          border: '#dcfce7'
        };
      case 'error':
        return {
          icon: <FiAlertCircle size={20} />,
          background: '#ef4444',
          border: '#fee2e2'
        };
      default:
        return {
          icon: <FiInfo size={20} />,
          background: '#3b82f6',
          border: '#dbeafe'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div style={styles.toast}>
      <div style={{ ...styles.content, background: typeStyles.background }}>
        <p style={styles.icon}>{typeStyles.icon}</p>
        <p style={styles.message}>{message}</p>
        <button style={styles.closeBtn} onClick={onClose}>
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
};

const styles = {
  toast: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 1100,
    animation: 'slideIn 0.3s ease-out'
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    borderRadius: '10px',
    color: 'white',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    minWidth: '280px'
  },
  icon: {
    display: 'flex',
    alignItems: 'center'
  },
  message: {
    flex: 1,
    fontSize: '14px',
    fontWeight: '500'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    padding: '0'
  }
};

// Add animation styles
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;
document.head.appendChild(styleSheet);

export default Toast;