// components/ErrorModal.jsx
import React from 'react';
import { FiAlertCircle, FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';

const ErrorModal = ({ isOpen, message, onClose, title = 'Error', icon = 'error' }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (icon) {
      case 'error':
        return <FiAlertTriangle size={48} color="#dc2626" />;
      case 'success':
        return <FiCheck size={48} color="#10b981" />;
      case 'warning':
        return <FiAlertCircle size={48} color="#f59e0b" />;
      default:
        return <FiAlertTriangle size={48} color="#dc2626" />;
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={{ ...styles.title, color: icon === 'error' ? '#dc2626' : icon === 'success' ? '#10b981' : '#f59e0b' }}>
            {icon === 'error' && <FiAlertCircle size={20} style={{ marginRight: '8px' }} />}
            {icon === 'success' && <FiCheck size={20} style={{ marginRight: '8px' }} />}
            {icon === 'warning' && <FiAlertTriangle size={20} style={{ marginRight: '8px' }} />}
            {title}
          </h3>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div style={styles.body}>
          <div style={styles.iconWrapper}>
            {getIcon()}
          </div>
          <p style={styles.message}>{message}</p>
        </div>
        <div style={styles.footer}>
          <button style={styles.okBtn} onClick={onClose}>
            <FiCheck size={16} /> OK
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
    maxWidth: '450px',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb'
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    fontFamily: "'Poppins', sans-serif"
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#94a3b8'
  },
  body: {
    padding: '32px 24px',
    textAlign: 'center'
  },
  iconWrapper: {
    marginBottom: '20px'
  },
  message: {
    fontSize: '16px',
    color: '#1a1a1a',
    marginBottom: 0,
    fontFamily: "'Poppins', sans-serif",
    lineHeight: '1.5'
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px 24px',
    borderTop: '1px solid #e5e7eb'
  },
  okBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif"
  }
};

export default ErrorModal;