// pages/candidate/components/LoaderScreen.jsx
import React from 'react';

export const LoaderScreen = () => {
  return (
    <div style={styles.loaderContainer}>
      <div style={styles.spinner}></div>
      <p>Loading elections...</p>
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
  loaderContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' },
  spinner: { width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTop: '3px solid #2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};