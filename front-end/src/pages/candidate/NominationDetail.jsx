// pages/candidate/NominationDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  FiArrowLeft, FiUser, FiBookOpen, FiFlag, FiFileText, 
  FiCheckCircle, FiXCircle, FiClock, FiAlertCircle, 
  FiDownload, FiPrinter, FiEdit2, FiTrash2, FiMessageCircle,
  FiCalendar, FiAward, FiShield, FiEye
} from 'react-icons/fi';
import { fetchNominationById } from '../../Js/nomination-slice';
import axiosPrivate from '../../utils/axiosPrivate';
import { formatLocalDate } from '../../utils/formatLocalDate';

// API base URL from environment or default
const API_BASE_URL = import.meta.env.VITE_API_URL_UPLOAD || 'http://localhost:4001';

const NominationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentNomination, loading } = useSelector(state => state.nomination);
  const { user } = useSelector(state => state.auth);
  
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [appealMessage, setAppealMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Helper function to get full image URL - Fixed for Windows paths
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Replace Windows backslashes with forward slashes
    let normalizedPath = imagePath.replace(/\\/g, '/');
    
    // Remove duplicate uploads prefixes
    if (normalizedPath.startsWith('uploads/uploads/')) {
      normalizedPath = normalizedPath.replace('uploads/uploads/', 'uploads/');
    }
    
    // Remove leading slash if present
    if (normalizedPath.startsWith('/uploads/')) {
      normalizedPath = normalizedPath.substring(1);
    }
    
    // Ensure no double slashes
    normalizedPath = normalizedPath.replace(/\/+/g, '/');
    
    // Return complete URL
    return `${API_BASE_URL}/${normalizedPath}`;
  };

  useEffect(() => {
    if (id) {
      dispatch(fetchNominationById(id));
    }
  }, [dispatch, id]);

  const getStatusConfig = (status) => {
    switch(status) {
      case 'approved':
        return {
          label: 'Approved',
          color: '#10b981',
          bg: '#dcfce7',
          icon: <FiCheckCircle size={18} />,
          message: 'Your nomination has been approved! You are now an official candidate.'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          color: '#dc2626',
          bg: '#fee2e2',
          icon: <FiXCircle size={18} />,
          message: 'Your nomination was not approved.'
        };
      case 'pending':
        return {
          label: 'Pending Review',
          color: '#f59e0b',
          bg: '#fef3c7',
          icon: <FiClock size={18} />,
          message: 'Your nomination is currently under review by the election committee.'
        };
      case 'withdrawn':
        return {
          label: 'Withdrawn',
          color: '#6b7280',
          bg: '#f3f4f6',
          icon: <FiXCircle size={18} />,
          message: 'You have withdrawn this nomination.'
        };
      case 'elected':
        return {
          label: 'Elected! 🎉',
          color: '#8b5cf6',
          bg: '#ede9fe',
          icon: <FiAward size={18} />,
          message: 'Congratulations! You have been elected to this position!'
        };
      default:
        return {
          label: status,
          color: '#6b7280',
          bg: '#f3f4f6',
          icon: <FiClock size={18} />,
          message: 'Status unknown.'
        };
    }
  };

  const handleWithdraw = async () => {
    setSubmitting(true);
    try {
      await axiosPrivate.patch(`/candidate/nomination/${id}/withdraw`);
      dispatch(fetchNominationById(id));
      setShowWithdrawModal(false);
    } catch (error) {
      console.error('Error withdrawing nomination:', error);
      alert(error.response?.data?.message || 'Failed to withdraw nomination');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAppeal = async () => {
    if (!appealMessage.trim()) {
      alert('Please provide a reason for your appeal');
      return;
    }
    
    setSubmitting(true);
    try {
      await axiosPrivate.patch(`/candidate/nomination/${id}/appeal`, { appealMessage });
      dispatch(fetchNominationById(id));
      setShowAppealModal(false);
      setAppealMessage('');
      alert('Appeal submitted successfully. The election committee will review your case.');
    } catch (error) {
      console.error('Error submitting appeal:', error);
      alert(error.response?.data?.message || 'Failed to submit appeal');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p>Loading nomination details...</p>
      </div>
    );
  }

  if (!currentNomination) {
    return (
      <div style={styles.errorContainer}>
        <FiAlertCircle size={48} color="#dc2626" />
        <h2>Nomination Not Found</h2>
        <p>The nomination you're looking for doesn't exist or you don't have access.</p>
        <button style={styles.backBtn} onClick={() => navigate('/candidate/my-nominations')}>
          <FiArrowLeft size={16} /> Back to My Nominations
        </button>
      </div>
    );
  }

  const statusConfig = getStatusConfig(currentNomination.status);
  const election = currentNomination.electionId || {};
  const canWithdraw = currentNomination.status === 'pending';
  const canAppeal = currentNomination.status === 'rejected' && !currentNomination.appealRequested;
  
  // Get campaign photo URL
  const campaignPhotoUrl = currentNomination.campaignPhoto ? getImageUrl(currentNomination.campaignPhoto) : null;
  const hasValidPhoto = campaignPhotoUrl && currentNomination.campaignPhoto !== 'default-candidate.jpg' && !imageError;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backButton} onClick={() => navigate('/candidate/my-nominations')}>
          <FiArrowLeft size={18} /> Back to My Nominations
        </button>
        
        <div style={styles.headerActions}>
          {canWithdraw && (
            <button style={styles.withdrawBtn} onClick={() => setShowWithdrawModal(true)}>
              <FiTrash2 size={16} /> Withdraw Nomination
            </button>
          )}
          {canAppeal && (
            <button style={styles.appealBtn} onClick={() => setShowAppealModal(true)}>
              <FiMessageCircle size={16} /> Request Appeal
            </button>
          )}
          <button style={styles.printBtn} onClick={() => window.print()}>
            <FiPrinter size={16} /> Print
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div style={{ ...styles.statusBanner, background: statusConfig.bg }}>
        <div style={{ ...styles.statusIcon, color: statusConfig.color }}>
          {statusConfig.icon}
        </div>
        <div>
          <div style={{ ...styles.statusLabel, color: statusConfig.color }}>
            {statusConfig.label}
          </div>
          <div style={styles.statusMessage}>{statusConfig.message}</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.contentGrid}>
        {/* Left Column - Candidate Info */}
        <div style={styles.leftColumn}>
          {/* Nomination ID Card */}
          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>Nomination Information</h3>
            <div style={styles.infoRow}>
              <p style={styles.infoLabel}>Nomination ID:</p>
              <p style={styles.infoValue}>{currentNomination.nominationId || 'N/A'}</p>
            </div>
            <div style={styles.infoRow}>
              <p style={styles.infoLabel}>Submitted On:</p>
              <p style={styles.infoValue}>{formatLocalDate(currentNomination.submittedAt)}</p>
            </div>
            {currentNomination.reviewedAt && (
              <div style={styles.infoRow}>
                <p style={styles.infoLabel}>Reviewed On:</p>
                <p style={styles.infoValue}>{formatLocalDate(currentNomination.reviewedAt)}</p>
              </div>
            )}
            <div style={styles.infoRow}>
              <p style={styles.infoLabel}>Ballot Position:</p>
              <p style={styles.infoValue}>{currentNomination.ballotPosition || 'Not assigned'}</p>
            </div>
          </div>

          {/* Position Info Card */}
          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>Position Details</h3>
            <div style={styles.infoRow}>
              <p style={styles.infoLabel}>Position:</p>
              <p style={styles.infoValue}>{currentNomination.positionName}</p>
            </div>
            <div style={styles.infoRow}>
              <p style={styles.infoLabel}>Election:</p>
              <p style={styles.infoValue}>{election.title || 'N/A'}</p>
            </div>
            <div style={styles.infoRow}>
              <p style={styles.infoLabel}>Election Status:</p>
              <p style={styles.infoValue}>
                <span style={styles.electionStatusBadge}>
                  {election.status?.replace(/_/g, ' ') || 'Unknown'}
                </span>
              </p>
            </div>
          </div>

          {/* Campaign Photo - FIXED */}
          {hasValidPhoto && (
            <div style={styles.photoCard}>
              <h3 style={styles.cardTitle}>Campaign Photo</h3>
              <img 
                src={campaignPhotoUrl} 
                alt="Campaign" 
                style={styles.campaignPhoto}
                onError={() => setImageError(true)}
              />
            </div>
          )}

          {/* Fallback if no photo or photo failed to load */}
          {!hasValidPhoto && (
            <div style={styles.noPhotoCard}>
              <h3 style={styles.cardTitle}>Campaign Photo</h3>
              <div style={styles.noPhotoPlaceholder}>
                <FiUser size={48} color="#cbd5e1" />
                <p>No campaign photo uploaded</p>
              </div>
            </div>
          )}

          {/* Vote Count (if elected) */}
          {currentNomination.status === 'elected' && currentNomination.voteCount > 0 && (
            <div style={styles.voteCard}>
              <FiAward size={24} color="#8b5cf6" />
              <div>
                <div style={styles.voteCount}>{currentNomination.voteCount} votes</div>
                <div style={styles.voteLabel}>Total votes received</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Campaign Details */}
        <div style={styles.rightColumn}>
          {/* Biography */}
          {currentNomination.biography && (
            <div style={styles.detailCard}>
              <h3 style={styles.cardTitle}>
                <FiUser size={18} /> Biography
              </h3>
              <p style={styles.biographyText}>{currentNomination.biography}</p>
            </div>
          )}

          {/* Manifesto */}
          {currentNomination.manifesto && (
            <div style={styles.detailCard}>
              <h3 style={styles.cardTitle}>
                <FiBookOpen size={18} /> Manifesto & Goals
              </h3>
              <p style={styles.manifestoText}>{currentNomination.manifesto}</p>
            </div>
          )}

          {/* Slogan */}
          {currentNomination.slogan && (
            <div style={styles.sloganCard}>
              <FiFlag size={20} color="#D23A01" />
              <p style={styles.sloganText}>"{currentNomination.slogan}"</p>
            </div>
          )}

          {/* Admin Comments */}
          {currentNomination.adminComments && (
            <div style={styles.adminCard}>
              <h3 style={styles.cardTitle}>Administrator Comments</h3>
              <p style={styles.adminText}>{currentNomination.adminComments}</p>
            </div>
          )}

          {/* Rejection Reason */}
          {currentNomination.rejectionReason && (
            <div style={styles.rejectionCard}>
              <h3 style={styles.cardTitle}>Rejection Reason</h3>
              <p style={styles.rejectionText}>{currentNomination.rejectionReason}</p>
            </div>
          )}

          {/* Appeal Status */}
          {currentNomination.appealRequested && (
            <div style={styles.appealCard}>
              <h3 style={styles.cardTitle}>Appeal Requested</h3>
              <p style={styles.appealText}>{currentNomination.appealMessage}</p>
              <div style={styles.appealStatus}>Pending review by election committee</div>
            </div>
          )}

          {/* Supporting Documents */}
          {currentNomination.supportingDocuments && currentNomination.supportingDocuments.length > 0 && (
            <div style={styles.documentCard}>
              <h3 style={styles.cardTitle}>
                <FiFileText size={18} /> Supporting Documents
              </h3>
              <div style={styles.documentList}>
                {currentNomination.supportingDocuments.map((doc, idx) => (
                  <div key={idx} style={styles.documentItem}>
                    <FiFileText size={16} />
                    <div style={styles.documentInfo}>
                      <div style={styles.documentType}>{doc.documentType?.replace(/_/g, ' ')}</div>
                      <div style={styles.documentDate}>{formatLocalDate(doc.uploadedAt)}</div>
                    </div>
                    {doc.fileUrl && (
                      <a href={getImageUrl(doc.fileUrl)} target="_blank" rel="noopener noreferrer" style={styles.downloadLink}>
                        <FiDownload size={16} /> View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Declarations */}
          <div style={styles.declarationCard}>
            <h3 style={styles.cardTitle}>Declarations</h3>
            <div style={styles.declarationList}>
              <div style={styles.declarationItem}>
                {currentNomination.declarations?.codeOfConduct ? 
                  <FiCheckCircle color="#10b981" /> : <FiXCircle color="#dc2626" />}
                <p>Code of Conduct Agreement</p>
              </div>
              <div style={styles.declarationItem}>
                {currentNomination.declarations?.spendingLimit ? 
                  <FiCheckCircle color="#10b981" /> : <FiXCircle color="#dc2626" />}
                <p>Spending Limit Agreement</p>
              </div>
              <div style={styles.declarationItem}>
                {currentNomination.declarations?.truthfulness ? 
                  <FiCheckCircle color="#10b981" /> : <FiXCircle color="#dc2626" />}
                <p>Truthfulness Declaration</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div style={styles.modalOverlay} onClick={() => setShowWithdrawModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Withdraw Nomination</h3>
            <p style={styles.modalText}>
              Are you sure you want to withdraw your nomination for <strong>{currentNomination.positionName}</strong>?
            </p>
            <p style={styles.modalWarning}>
              This action cannot be undone. You will not be able to re-submit for this position.
            </p>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowWithdrawModal(false)}>
                Cancel
              </button>
              <button style={styles.confirmWithdrawBtn} onClick={handleWithdraw} disabled={submitting}>
                {submitting ? 'Processing...' : 'Yes, Withdraw Nomination'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appeal Modal */}
      {showAppealModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAppealModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Request Appeal</h3>
            <p style={styles.modalText}>
              Please explain why you believe this nomination should be reconsidered:
            </p>
            <textarea
              style={styles.appealTextarea}
              rows={5}
              placeholder="Provide your reasons for appeal..."
              value={appealMessage}
              onChange={(e) => setAppealMessage(e.target.value)}
            />
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowAppealModal(false)}>
                Cancel
              </button>
              <button style={styles.submitAppealBtn} onClick={handleAppeal} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Appeal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: 'clamp(16px, 4vw, 32px)',
    marginTop: '8vh'
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    gap: '16px'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #D23A01',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px',
    background: 'white',
    borderRadius: '16px',
    marginTop: '15vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '14px'
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap'
  },
  withdrawBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  appealBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#fef3c7',
    color: '#d97706',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500'
  },
  printBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  statusBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  statusIcon: {
    fontSize: '24px'
  },
  statusLabel: {
    fontSize: '18px',
    fontWeight: '700'
  },
  statusMessage: {
    fontSize: '14px',
    marginTop: '4px'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px'
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  infoCard: {
    background: 'white',
    borderRadius: '16px',
    padding: 'clamp(16px, 4vw, 20px)',
    border: '1px solid #e2e8f0'
  },
  cardTitle: {
    fontSize: 'clamp(14px, 3.5vw, 16px)',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #f1f5f9',
    flexWrap: 'wrap',
    gap: '8px'
  },
  infoLabel: {
    fontSize: '13px',
    color: '#64748b'
  },
  infoValue: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1e293b'
  },
  electionStatusBadge: {
    background: '#e2e8f0',
    padding: '2px 8px',
    borderRadius: '20px',
    fontSize: '11px',
    textTransform: 'capitalize'
  },
  photoCard: {
    background: 'white',
    borderRadius: '16px',
    padding: 'clamp(16px, 4vw, 20px)',
    border: '1px solid #e2e8f0',
    textAlign: 'center'
  },
  noPhotoCard: {
    background: 'white',
    borderRadius: '16px',
    padding: 'clamp(16px, 4vw, 20px)',
    border: '1px solid #e2e8f0',
    textAlign: 'center'
  },
  noPhotoPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    background: '#f8fafc',
    borderRadius: '12px',
    gap: '12px'
  },
  campaignPhoto: {
    width: '100%',
    maxHeight: '250px',
    objectFit: 'cover',
    borderRadius: '12px'
  },
  voteCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: '#ede9fe',
    borderRadius: '16px',
    padding: 'clamp(16px, 4vw, 20px)',
    color: '#6d28d9',
    flexWrap: 'wrap'
  },
  voteCount: {
    fontSize: 'clamp(24px, 5vw, 28px)',
    fontWeight: '700'
  },
  voteLabel: {
    fontSize: '12px'
  },
  detailCard: {
    background: 'white',
    borderRadius: '16px',
    padding: 'clamp(16px, 4vw, 20px)',
    border: '1px solid #e2e8f0'
  },
  biographyText: {
    fontSize: 'clamp(13px, 3vw, 14px)',
    lineHeight: '1.6',
    color: '#475569',
    margin: 0
  },
  manifestoText: {
    fontSize: 'clamp(13px, 3vw, 14px)',
    lineHeight: '1.6',
    color: '#475569',
    margin: 0,
    whiteSpace: 'pre-wrap'
  },
  sloganCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#eff6ff',
    borderRadius: '16px',
    padding: 'clamp(16px, 4vw, 20px)',
    flexWrap: 'wrap'
  },
  sloganText: {
    fontSize: 'clamp(16px, 4vw, 18px)',
    fontStyle: 'italic',
    color: '#D23A01',
    margin: 0
  },
  adminCard: {
    background: '#f8fafc',
    borderRadius: '16px',
    padding: 'clamp(16px, 4vw, 20px)',
    borderLeft: '4px solid #D23A01'
  },
  adminText: {
    fontSize: 'clamp(13px, 3vw, 14px)',
    color: '#475569',
    margin: 0
  },
  rejectionCard: {
    background: '#fef2f2',
    borderRadius: '16px',
    padding: 'clamp(16px, 4vw, 20px)',
    borderLeft: '4px solid #dc2626'
  },
  rejectionText: {
    fontSize: 'clamp(13px, 3vw, 14px)',
    color: '#991b1b',
    margin: 0
  },
  appealCard: {
    background: '#fef3c7',
    borderRadius: '16px',
    padding: 'clamp(16px, 4vw, 20px)'
  },
  appealText: {
    fontSize: 'clamp(13px, 3vw, 14px)',
    color: '#92400e',
    marginBottom: '12px'
  },
  appealStatus: {
    fontSize: '12px',
    color: '#b45309',
    background: '#fffbeb',
    padding: '6px 12px',
    borderRadius: '20px',
    display: 'inline-block'
  },
  documentCard: {
    background: 'white',
    borderRadius: '16px',
    padding: 'clamp(16px, 4vw, 20px)',
    border: '1px solid #e2e8f0'
  },
  documentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  documentItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px',
    flexWrap: 'wrap'
  },
  documentInfo: {
    flex: 1,
    minWidth: '120px'
  },
  documentType: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1e293b',
    textTransform: 'capitalize'
  },
  documentDate: {
    fontSize: '11px',
    color: '#000000'
  },
  downloadLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#D23A01',
    textDecoration: 'none',
    fontSize: '13px'
  },
  declarationCard: {
    background: 'white',
    borderRadius: '16px',
    padding: 'clamp(16px, 4vw, 20px)',
    border: '1px solid #e2e8f0'
  },
  declarationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  declarationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#000000',
    flexWrap: 'wrap'
  },
  modalOverlay: {
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
    padding: 'clamp(16px, 4vw, 20px)'
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: 'clamp(20px, 5vw, 24px)',
    width: '90%',
    maxWidth: '450px'
  },
  modalTitle: {
    fontSize: 'clamp(18px, 4vw, 20px)',
    fontWeight: '600',
    marginBottom: '16px'
  },
  modalText: {
    fontSize: '14px',
    color: '#000000',
    marginBottom: '12px'
  },
  modalWarning: {
    fontSize: '13px',
    color: '#dc2626',
    background: '#fef2f2',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    flexWrap: 'wrap'
  },
  cancelBtn: {
    padding: '8px 16px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  confirmWithdrawBtn: {
    padding: '8px 16px',
    background: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  submitAppealBtn: {
    padding: '8px 16px',
    background: '#d97706',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  },
  appealTextarea: {
    width: '100%',
    padding: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    marginBottom: '16px',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  backBtn: {
    marginTop: '20px',
    padding: '10px 20px',
    background: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer'
  }
};

// Add keyframes for spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default NominationDetail;