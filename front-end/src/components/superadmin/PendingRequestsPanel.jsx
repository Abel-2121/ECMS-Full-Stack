// components/superadmin/PendingRequestsPanel.jsx - KEEP AS LIST VIEW ONLY
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FiInbox, FiMail, FiPhone, FiUser, FiCalendar, 
  FiArrowRight, FiHome, FiCode, FiAlertCircle, FiFileText
} from 'react-icons/fi';

const PendingRequestsPanel = ({ pendingRequests, loading, onRefresh }) => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  if (loading) {
    return <div style={styles.loader}>Loading pending requests...</div>;
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIcon}>
          <FiInbox size={48} />
        </div>
        <p>No pending requests</p>
        <p style={styles.emptySubtext}>All caught up!</p>
      </div>
    );
  }

  const handleReview = (requestId) => {
    navigate(`/${user?.role}/pending-requests/${requestId}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <FiAlertCircle size={22} color="#f59e0b" />
          <h3 style={styles.title}>Pending Approval Requests</h3>
        </div>
        <span style={styles.badge}>{pendingRequests.length} waiting</span>
      </div>

      <div style={styles.cardsContainer}>
        {pendingRequests.map((request) => (
          <div key={request._id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <FiHome size={32} color="#f59e0b" />
              </div>
              <div style={styles.cardTitle}>
                <h4 style={styles.instName}>{request.name}</h4>
                <span style={styles.cardCode}>
                  <FiCode size={14} /> Code: {request.code}
                </span>
              </div>
            </div>
            
            <div style={styles.cardDetails}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>
                  <FiMail size={16} /> Email:
                </span>
                <span style={styles.detailValue}>{request.email}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>
                  <FiPhone size={16} /> Phone:
                </span>
                <span style={styles.detailValue}>{request.phone}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>
                  <FiUser size={16} /> Requested by:
                </span>
                <span style={styles.detailValue}>
                  {request.requestedBy?.firstName} {request.requestedBy?.lastName}
                </span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>
                  <FiCalendar size={16} /> Date:
                </span>
                <span style={styles.detailValue}>
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button 
              style={styles.viewButton}
              onClick={() => handleReview(request._id)}
            >
              Review Request <FiArrowRight size={16} />
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .cards-container {
            grid-template-columns: 1fr !important;
          }
          .header {
            flex-direction: column;
            align-items: flex-start;
          }
          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
          .detail-label {
            width: auto !important;
          }
          .card {
            padding: 16px !important;
          }
        }
        
        @media (max-width: 480px) {
          .title {
            font-size: 20px !important;
          }
          .inst-name {
            font-size: 18px !important;
          }
          .detail-value {
            font-size: 14px !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    background: '#fffbeb',
    border: '1px solid #fcd34d',
    borderRadius: '24px',
    padding: 'clamp(24px, 5vw, 32px)',
    marginBottom: '28px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  title: {
    fontSize: 'clamp(20px, 4vw, 24px)',
    fontWeight: '800',
    color: '#000000',
    margin: 0
  },
  badge: {
    background: '#fef3c7',
    color: '#d97706',
    padding: '6px 16px',
    borderRadius: '24px',
    fontSize: '14px',
    fontWeight: '700'
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '24px'
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '24px',
    border: '1px solid #fef3c7',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    transition: 'box-shadow 0.2s'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px'
  },
  cardIcon: {
    flexShrink: 0
  },
  cardTitle: {
    flex: 1
  },
  instName: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#000000',
    marginBottom: '6px'
  },
  cardCode: {
    fontSize: '13px',
    color: '#4b5563',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  cardDetails: {
    marginBottom: '24px'
  },
  detailRow: {
    fontSize: '14px',
    padding: '10px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    borderBottom: '1px solid #fef3c7',
    flexWrap: 'wrap'
  },
  detailLabel: {
    width: '120px',
    color: '#000000',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  detailValue: {
    color: '#1a1a1a',
    fontWeight: '600',
    flex: 1
  },
  viewButton: {
    width: '100%',
    padding: '14px',
    background: '#f59e0b',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s'
  },
  loader: {
    textAlign: 'center',
    padding: '50px',
    color: '#000000',
    fontSize: '16px',
    fontWeight: '500'
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '50px',
    background: '#fffbeb',
    borderRadius: '20px',
    marginBottom: '28px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  emptyIcon: {
    color: '#f59e0b',
    marginBottom: '8px'
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#6b7280'
  }
};

export default PendingRequestsPanel;