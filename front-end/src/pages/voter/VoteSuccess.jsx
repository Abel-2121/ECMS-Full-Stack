// pages/voter/VoteSuccess.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { resetVotingSession } from '../../Js/voting-slice';
import VoteReceipt from '../../components/voting/VoteReceipt';
import { FiCheckCircle, FiHome, FiPrinter, FiCopy, FiShield, FiMail, FiAward } from 'react-icons/fi';

const VoteSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);
  const receiptRef = useRef();

  const { voteId, electionTitle, voteDetails } = location.state || {};

  useEffect(() => {
    if (!voteId) {
      navigate('/voter/elections');
    }
  }, [voteId, navigate]);

  const handleCopy = () => {
    navigator.clipboard.writeText(voteId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printContent = receiptRef.current.outerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vote Receipt - ${voteId}</title>
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: monospace;
              background: white;
            }
            @media print {
              body { padding: 0; margin: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent}
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleGoHome = () => {
    dispatch(resetVotingSession());
    navigate('/voter/my-votes');
  };

  const displayDate = voteDetails?.timestamp 
    ? new Date(voteDetails.timestamp).toLocaleString() 
    : new Date().toLocaleString();

  if (!voteId) return null;

  return (
    <div style={styles.container}>
      <div style={styles.successCard}>
        <div style={styles.checkmarkWrapper}>
          <div style={styles.checkmarkCircle}>
            <FiCheckCircle size={64} color="#10b981" />
          </div>
        </div>
        
        <h1 style={styles.title}>Vote Successfully Recorded!</h1>
        <p style={styles.subtitle}>Your ballot has been securely cast and verified for</p>
        <p style={styles.electionName}>{electionTitle}</p>
        
        <div style={styles.confirmationBox}>
          <div style={styles.confirmationLabel}>CONFIRMATION CODE</div>
          <div style={styles.confirmationCode}>
            <span style={styles.codeText}>{voteId}</span>
            <button style={styles.copyBtn} onClick={handleCopy}>
              {copied ? 'Copied!' : <FiCopy size={16} />}
            </button>
          </div>
          <p style={styles.confirmationNote}>Save this code for your records. You can use it to verify your vote.</p>
        </div>
        
        <div style={styles.summaryBox}>
          <h3 style={styles.summaryTitle}>Vote Summary</h3>
          <div style={styles.summaryRow}>
            <span>Election:</span>
            <strong>{electionTitle}</strong>
          </div>
          {voteDetails?.positionTitle && (
            <div style={styles.summaryRow}>
              <span>Position:</span>
              <strong>{voteDetails.positionTitle}</strong>
            </div>
          )}
          {voteDetails?.candidateName && (
            <div style={styles.summaryRow}>
              <span>Voted For:</span>
              <strong style={{ color: '#D23A01' }}>{voteDetails.candidateName}</strong>
            </div>
          )}
          <div style={styles.summaryRow}>
            <span>Timestamp:</span>
            <span>{displayDate}</span>
          </div>
        </div>
        
        <div style={styles.actionButtons}>
          <button style={styles.printBtn} onClick={handlePrint}>
            <FiPrinter size={16} /> Print Receipt
          </button>
          <button style={styles.homeBtn} onClick={handleGoHome}>
            <FiHome size={16} /> My Votes
          </button>
        </div>
        
        <div style={styles.securityNotice}>
          <FiShield size={24} style={styles.securityIcon} />
          <div>
            <strong>Secure & Verified</strong>
            <p>Your vote has been encrypted and recorded on the secure ledger. A receipt has been sent to your email.</p>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'none' }}>
        <VoteReceipt
          ref={receiptRef}
          voteId={voteId}
          electionName={electionTitle}
          candidateName={voteDetails?.candidateName}
          positionTitle={voteDetails?.positionTitle}
          timestamp={displayDate}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: 'clamp(20px, 5vw, 32px)',
    marginTop: 'clamp(50px, 7vh, 80px)'
  },
  successCard: {
    background: 'white',
    borderRadius: '28px',
    padding: 'clamp(32px, 6vw, 48px)',
    textAlign: 'center',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  checkmarkWrapper: { marginBottom: '24px' },
  checkmarkCircle: {
    width: '88px',
    height: '88px',
    background: '#dcfce7',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto'
  },
  title: {
    fontSize: 'clamp(24px, 5vw, 28px)',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '12px',
    
  },
  subtitle: {
    fontSize: '15px',
    color: '#4b5563',
    marginBottom: '8px',
    
  },
  electionName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#D23A01',
    marginBottom: '32px',
    
  },
  confirmationBox: {
    background: '#f8fafc',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '24px'
  },
  confirmationLabel: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    color: '#4b5563',
    marginBottom: '12px'
  },
  confirmationCode: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '12px'
  },
  codeText: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a1a1a',
    background: 'white',
    padding: '10px 18px',
    borderRadius: '10px',
    border: '1px solid #e5e7eb'
  },
  copyBtn: {
    padding: '10px 18px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a'
  },
  confirmationNote: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0
  },
  summaryBox: {
    textAlign: 'left',
    background: '#f8fafc',
    borderRadius: '20px',
    padding: '20px',
    marginBottom: '24px'
  },
  summaryTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '16px'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px'
  },
  actionButtons: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  printBtn: {
    flex: 1,
    padding: '14px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: '#1a1a1a'
  },
  homeBtn: {
    flex: 1,
    padding: '14px',
    background: '#D23A01',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: 'white'
  },
  securityNotice: {
    display: 'flex',
    gap: '14px',
    padding: '18px',
    background: '#FEF3F0',
    borderRadius: '16px',
    textAlign: 'left',
    alignItems: 'center'
  },
  securityIcon: {
    color: '#D23A01',
    flexShrink: 0
  }
};

export default VoteSuccess;