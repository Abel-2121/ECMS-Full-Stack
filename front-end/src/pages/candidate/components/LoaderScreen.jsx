// pages/candidate/components/LoaderScreen.jsx
import React from 'react';
import { FiLoader } from 'react-icons/fi';

export const LoaderScreen = () => {
  return (
    <div style={styles.loaderContainer}>
      <div style={styles.spinner}>
        <FiLoader size={32} color="#D23A01" />
      </div>
      <p style={styles.loaderText}>Loading available elections...</p>
      <p style={styles.loaderSubtext}>Please wait while we fetch the latest data</p>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  loaderContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '60vh', 
    gap: '16px' 
  },
  spinner: { 
    animation: 'spin 1s linear infinite'
  },
  loaderText: { 
    fontSize: '16px', 
    fontWeight: '600', 
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif",
    marginTop: '8px'
  },
  loaderSubtext: {
    fontSize: '13px',
    color: '#6b7280',
    fontFamily: "'Poppins', sans-serif"
  }
};