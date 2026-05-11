// pages/voter/VoteReceiptView.jsx
import React, { useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import VoteReceipt from '../../components/voting/VoteReceipt';
import { FiPrinter, FiArrowLeft } from 'react-icons/fi';

const VoteReceiptView = () => {
  const { confirmationCode } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const receiptRef = useRef();
  
  const { electionTitle, castAt, votes } = location.state || {};
  
  const handlePrint = () => {
    const printContent = receiptRef.current.outerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Vote Receipt - ${confirmationCode}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: monospace; }
            @media print { body { padding: 0; } button { display: none; } }
          </style>
        </head>
        <body>${printContent}<script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };</script></body>
      </html>
    `);
    printWindow.document.close();
  };
  
  const firstVote = votes?.[0] || {};
  
  return (
    <div style={styles.container}>
      <button style={styles.backBtn} onClick={() => navigate('/voter/my-votes')}>
        <FiArrowLeft size={16} /> Back to My Votes
      </button>
      
      <div style={styles.receiptWrapper}>
        <VoteReceipt
          ref={receiptRef}
          voteId={confirmationCode}
          electionName={electionTitle}
          candidateName={firstVote.candidateName}
          positionTitle={firstVote.positionName}
          timestamp={castAt}
        />
      </div>
      
      <button style={styles.printBtn} onClick={handlePrint}>
        <FiPrinter size={16} /> Print Receipt
      </button>
    </div>
  );
};

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', padding: '32px' },
  backBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginBottom: '24px' },
  receiptWrapper: { marginBottom: '24px' },
  printBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', margin: '0 auto' }
};

export default VoteReceiptView;