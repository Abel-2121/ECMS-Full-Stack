// pages/candidate/components/SuccessScreen.jsx
import React from 'react';
import { FiCheckCircle, FiArrowRight, FiMail, FiClock } from 'react-icons/fi';
import { useSelector } from 'react-redux';

export const SuccessScreen = ({ navigate }) => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  return (
    <div style={styles.successContainer}>
      <div style={styles.successCard}>
        <div style={styles.successIcon}>
          <FiCheckCircle size={64} color="#ffffff" />
        </div>
        <h2 style={styles.successTitle}>Nomination Submitted!</h2>
        <p style={styles.successMessage}>
          Your nomination has been submitted successfully and is pending review by the election committee.
        </p>
        
        <div style={styles.infoBox}>
          <div style={styles.infoItem}>
            <FiMail size={18} color="#D23A01" />
            <div>
              <strong>Email Notification</strong>
              <p>You will receive an email once a decision is made</p>
            </div>
          </div>
          <div style={styles.infoItem}>
            <FiClock size={18} color="#D23A01" />
          </div>
        </div>
       
        <button 
          style={styles.primaryBtn} 
          onClick={() => navigate(`/${user.role}/my-nominations`)}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#b02e00';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#D23A01';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          View My Nominations <FiArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

const styles = {
  successContainer: { 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '70vh' ,
    marginTop:"10vh"
  },
  successCard: { 
    background: 'white', 
    borderRadius: '28px', 
    padding: 'clamp(32px, 6vw, 48px)', 
    textAlign: 'center', 
    maxWidth: '550px', 
    margin: '20px', 
    boxShadow: '0 20px 40px -12px rgba(0,0,0,0.15)',
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
    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
  },
  successTitle: { 
    fontSize: 'clamp(24px, 5vw, 28px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    marginBottom: '12px',
    
  },
  successMessage: { 
    fontSize: '15px', 
    color: '#4b5563', 
    marginBottom: '28px', 
    lineHeight: '1.6',
    
  },
  infoBox: {
    background: '#f8fafc',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '32px',
    textAlign: 'left'
  },
  infoItem: {
    display: 'flex',
    gap: '14px',
    marginBottom: '16px',
    alignItems: 'flex-start'
  },
  primaryBtn: { 
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 32px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '40px', 
    cursor: 'pointer', 
    fontWeight: '700',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    margin: '0 auto'
  }
};