// components/voting/VoteReceipt.jsx
import React, { forwardRef } from 'react';
import { FiShield, FiLock, FiDatabase, FiCheckCircle, FiAward, FiClock, FiHash, FiUser, FiBriefcase } from 'react-icons/fi';

const VoteReceipt = forwardRef(({ voteId, electionName, candidateName, positionTitle, timestamp }, ref) => {
  const formatDate = (date) => {
    if (!date) return 'Not available';
    const d = new Date(date);
    return d.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formattedTimestamp = formatDate(timestamp);
  const receiptId = voteId || 'N/A';

  return (
    <div ref={ref} style={styles.receipt}>
      {/* Header */}
      <div style={styles.header}>
        <FiCheckCircle size={32} style={styles.headerIcon} />
        <h1 style={styles.title}>OFFICIAL VOTE RECEIPT</h1>
        <p style={styles.subtitle}>Election Control & Management System (ECMS)</p>
      </div>

      {/* Receipt Body */}
      <div style={styles.body}>
        <div style={styles.receiptIdSection}>
          <div style={styles.receiptIdLabel}>
            <FiHash size={14} /> CONFIRMATION CODE
          </div>
          <div style={styles.receiptIdValue}>{receiptId}</div>
        </div>

        <div style={styles.detailsGrid}>
          <div style={styles.detailRow}>
            <FiAward size={16} style={styles.detailIcon} />
            <span style={styles.detailLabel}>Election:</span>
            <span style={styles.detailValue}>{electionName || 'N/A'}</span>
          </div>

          <div style={styles.detailRow}>
            <FiBriefcase size={16} style={styles.detailIcon} />
            <span style={styles.detailLabel}>Position:</span>
            <span style={styles.detailValue}>{positionTitle || 'N/A'}</span>
          </div>

          <div style={styles.detailRow}>
            <FiUser size={16} style={styles.detailIcon} />
            <span style={styles.detailLabel}>Voted For:</span>
            <span style={styles.detailValue}>{candidateName || 'N/A'}</span>
          </div>

          <div style={styles.detailRow}>
            <FiClock size={16} style={styles.detailIcon} />
            <span style={styles.detailLabel}>Cast at:</span>
            <span style={styles.detailValue}>{formattedTimestamp}</span>
          </div>
        </div>
      </div>

      {/* Security Info - SIMPLIFIED */}
      <div style={styles.securitySection}>
        <div style={styles.securityHeader}>
          <FiShield size={18} /> Vote Verification
        </div>
        <div style={styles.securityGrid}>
          <div style={styles.securityItem}>
            <FiLock size={14} />
            <span>Encrypted & Anonymous</span>
          </div>
          <div style={styles.securityItem}>
            <FiDatabase size={14} />
            <span>Stored Securely</span>
          </div>
          <div style={styles.securityItem}>
            <FiCheckCircle size={14} />
            <span>Verified by ECMS</span>
          </div>
        </div>
        <p style={styles.securityNote}>
          This receipt confirms your vote has been recorded. Your vote is secret and cannot be changed.
        </p>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p>OFFICIAL RECEIPT - ECMS VERIFIED VOTING SYSTEM</p>
        <p>System ID: ECMS-V2-{new Date().getFullYear()} | For your records only</p>
      </div>
    </div>
  );
});

const styles = {
  receipt: {
    background: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    maxWidth: '700px',
    margin: '0 auto',
    overflow: 'hidden',
  },
  header: {
    textAlign: 'center',
    padding: 'clamp(20px, 5vw, 32px)',
    background: ' #D23A01 ',
    color: 'white'
  },
  headerIcon: {
    marginBottom: '12px'
  },
  title: {
    fontSize: 'clamp(20px, 5vw, 24px)',
    fontWeight: '700',
    margin: '0 0 8px 0',
    letterSpacing: '1px'
  },
  subtitle: {
    fontSize: '12px',
    opacity: 0.9,
    margin: 0
  },
  body: {
    padding: 'clamp(20px, 5vw, 32px)'
  },
  receiptIdSection: {
    background: '#f8f9fa',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    marginBottom: '24px',
    border: '1px solid #e9ecef'
  },
  receiptIdLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#000000',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  },
  receiptIdValue: {
    fontSize: 'clamp(14px, 4vw, 16px)',
    fontWeight: '700',
    fontFamily: 'monospace',
    color: '#D23A01',
    wordBreak: 'break-all'
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
  },
  detailIcon: {
    color: '#D23A01',
    minWidth: '20px'
  },
  detailLabel: {
    fontWeight: '600',
    color: '#000000',
    minWidth: '90px',
    fontSize: '14px'
  },
  detailValue: {
    color: '#000000',
    fontWeight: '500',
    fontSize: '14px',
    wordBreak: 'break-word',
    flex: 1
  },
  securitySection: {
    background: '#f8f9fa',
    margin: '0 20px 20px 20px',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e9ecef'
  },
  securityHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#D23A01',
    marginBottom: '12px'
  },
  securityGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '12px'
  },
  securityItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#000000',
    background: 'white',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid #e9ecef'
  },
  securityNote: {
    fontSize: '12px',
    color: '#000000',
    margin: '12px 0 0 0',
    lineHeight: '1.5',
    textAlign: 'center'
  },
  footer: {
    textAlign: 'center',
    padding: '16px 20px',
    background: '#f8f9fa',
    borderTop: '1px solid #e9ecef',
    fontSize: '12px',
    color: '#000000'
  }
};

VoteReceipt.displayName = 'VoteReceipt';

export default VoteReceipt;