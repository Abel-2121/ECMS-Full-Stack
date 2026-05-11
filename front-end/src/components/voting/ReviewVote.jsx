// components/voting/ReviewVote.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { goToStep } from '../../Js/voting-slice';
import { 
  FiEdit2, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiArrowLeft,
  FiAward,
  FiUsers,
  FiBarChart2,
  FiUser,
  FiBookOpen,
  FiPhone,
  FiMail,
  FiCalendar,
  FiShield,
  FiFlag,
  FiStar
} from 'react-icons/fi';

// API base URL from environment or default
const API_BASE_URL = import.meta.env.VITE_API_URL_UPLOAD || 'http://localhost:4001';

// Brand Colors
const PRIMARY_COLOR = '#D23A01';
const SECONDARY_COLOR = '#023430';

const ReviewVote = ({ election, positions }) => {
  const dispatch = useDispatch();
  const { selections } = useSelector(state => state.voting);

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

  const reviewItems = positions.map(position => {
    const selectedCandidateId = selections[position.positionId];
    const selectedCandidate = selectedCandidateId 
      ? position.candidates?.find(c => c.id === selectedCandidateId || c._id === selectedCandidateId) || null
      : null;
    
    // Process candidate photo URL if exists
    let processedPhotoUrl = null;
    if (selectedCandidate) {
      const photoPath = selectedCandidate.campaignPhoto || selectedCandidate.photoUrl || selectedCandidate.profileImageUrl;
      if (photoPath) {
        processedPhotoUrl = getImageUrl(photoPath);
      }
    }
    
    return {
      positionId: position.positionId,
      positionTitle: position.title,
      electionType: position.electionType,
      totalSeats: position.totalSeats,
      selectedCandidate: selectedCandidate ? {
        ...selectedCandidate,
        processedPhotoUrl
      } : null,
      hasVote: !!selectedCandidate
    };
  });
  
  const votedItems = reviewItems.filter(item => item.hasVote);
  const missingItems = reviewItems.filter(item => !item.hasVote);
  const isComplete = missingItems.length === 0;
  
  const getElectionIcon = (type) => {
    switch(type) {
      case 'ranked': return <FiBarChart2 size={14} />;
      case 'multiple_winners': return <FiUsers size={14} />;
      default: return <FiAward size={14} />;
    }
  };
  
  const getElectionTypeText = (type) => {
    switch(type) {
      case 'ranked': return 'Ranked Voting';
      case 'multiple_winners': return 'Multiple Winners';
      default: return 'Single Winner';
    }
  };
  
  const handleEditPosition = (positionId) => {
    dispatch(goToStep({ step: 1 }));
    setTimeout(() => {
      const element = document.getElementById(`position-${positionId}`);
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };
  
  const handleBackToVoting = () => {
    dispatch(goToStep({ step: 1 }));
  };
  
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={handleBackToVoting}>
          <FiArrowLeft size={16} /> Back to Voting
        </button>
        <div style={styles.headerContent}>
          <div style={{...styles.headerIcon, background: PRIMARY_COLOR, boxShadow: `0 4px 12px ${PRIMARY_COLOR}4D` }}>
            <FiCheckCircle size={32} />
          </div>
          <h2 style={styles.title}>Review Your Ballot</h2>
          <p style={styles.subtitle}>
            Please carefully review your selections below. Once submitted, your vote is final.
          </p>
        </div>
      </div>
      
      {/* Warning for incomplete ballot */}
      {!isComplete && (
        <div style={styles.warningBox}>
          <FiAlertCircle size={20} style={styles.warningIconRed} />
          <div>
            <strong style={styles.warningTitle}>Incomplete Ballot</strong>
            <p style={styles.warningText}>
              You haven't voted for {missingItems.length} position{missingItems.length !== 1 ? 's' : ''}. 
              Please complete all positions before submitting.
            </p>
            <div style={styles.missingList}>
              {missingItems.map(item => (
                <p key={item.positionId} style={{...styles.missingBadge, background: PRIMARY_COLOR + '20', color: PRIMARY_COLOR }}>
                  {item.positionTitle}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Voted Items List */}
      <div style={styles.reviewList}>
        <h3 style={styles.sectionTitle}>
          Your Selections ({votedItems.length} of {positions.length})
        </h3>
        
        {votedItems.map(item => (
          <div key={item.positionId} style={styles.reviewItem}>
            <div style={styles.reviewItemHeader}>
              <div style={styles.positionInfo}>
                <div style={{...styles.positionIcon, background: PRIMARY_COLOR + '10', color: PRIMARY_COLOR }}>
                  {getElectionIcon(item.electionType)}
                </div>
                <div>
                  <h4 style={styles.positionTitle}>{item.positionTitle}</h4>
                  <div style={styles.positionMeta}>
                    <p style={{...styles.positionTypeBadge, background: PRIMARY_COLOR + '10', color: PRIMARY_COLOR }}>
                      {getElectionIcon(item.electionType)} {getElectionTypeText(item.electionType)}
                    </p>
                    <p style={styles.seatsBadge}>
                      <FiUsers size={10} /> {item.totalSeats} Seat{item.totalSeats !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
              <button 
                style={{...styles.editBtn, color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR + '40'}}
                onClick={() => handleEditPosition(item.positionId)}
              >
                <FiEdit2 size={14} /> Change
              </button>
            </div>
            
            <div style={styles.candidateSection}>
              <div style={styles.candidateAvatar}>
                {item.selectedCandidate?.processedPhotoUrl ? (
                  <img 
                    src={item.selectedCandidate.processedPhotoUrl} 
                    alt={item.selectedCandidate.name || item.selectedCandidate.userId?.name}
                    style={styles.avatarImg}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      const parent = e.target.parentElement;
                      if (parent) {
                        const placeholder = document.createElement('div');
                        placeholder.style.cssText = Object.entries(styles.avatarPlaceholder)
                          .map(([k, v]) => `${k}:${v}`)
                          .join(';');
                        const name = item.selectedCandidate.name || 
                                    `${item.selectedCandidate.userId?.firstName || ''} ${item.selectedCandidate.userId?.lastName || ''}`.trim();
                        placeholder.textContent = name?.charAt(0) || '?';
                        parent.appendChild(placeholder);
                        e.target.remove();
                      }
                    }}
                  />
                ) : (
                  <div style={{...styles.avatarPlaceholder, background: `linear-gradient(135deg, ${PRIMARY_COLOR}, ${SECONDARY_COLOR})` }}>
                    {(() => {
                      const candidateName = item.selectedCandidate?.name || 
                                          `${item.selectedCandidate?.userId?.firstName || ''} ${item.selectedCandidate?.userId?.lastName || ''}`.trim();
                      return candidateName?.charAt(0) || <FiUser size={24} />;
                    })()}
                  </div>
                )}
              </div>
              <div style={styles.candidateDetails}>
                <div style={styles.candidateName}>
                  <FiUser size={14} style={styles.nameIcon} />
                  {item.selectedCandidate?.name || 
                    `${item.selectedCandidate?.userId?.firstName || ''} ${item.selectedCandidate?.userId?.lastName || ''}`.trim() || 
                    'No candidate selected'}
                </div>
                {item.selectedCandidate?.slogan && (
                  <div style={{...styles.candidateSlogan, color: PRIMARY_COLOR }}>
                    <FiFlag size={12} /> "{item.selectedCandidate.slogan}"
                  </div>
                )}
                {item.selectedCandidate?.biography && (
                  <div style={styles.candidateBio}>
                    <FiBookOpen size={12} /> 
                    {item.selectedCandidate.biography.length > 80 
                      ? `${item.selectedCandidate.biography.substring(0, 80)}...` 
                      : item.selectedCandidate.biography}
                  </div>
                )}
                {item.selectedCandidate?.campaignPlatform && !item.selectedCandidate?.biography && (
                  <div style={styles.candidateBio}>
                    <FiFlag size={12} /> 
                    {item.selectedCandidate.campaignPlatform.length > 80 
                      ? `${item.selectedCandidate.campaignPlatform.substring(0, 80)}...` 
                      : item.selectedCandidate.campaignPlatform}
                  </div>
                )}
              </div>
              <div style={styles.confirmIcon}>
                <FiCheckCircle size={22} color="#10b981" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary */}
      <div style={styles.summaryBox}>
        <div style={{...styles.summaryHeader, background: SECONDARY_COLOR, color: 'white' }}>
          <FiShield size={16} />
          <p>Vote Summary</p>
        </div>
        <div style={styles.summaryRow}>
          <p>📋 Election:</p>
          <strong>{election?.title}</strong>
        </div>
        <div style={styles.summaryRow}>
          <p><FiAward size={12} /> Total Positions:</p>
          <strong>{positions.length}</strong>
        </div>
        <div style={styles.summaryRow}>
          <p><FiCheckCircle size={12} /> Votes Cast:</p>
          <strong style={{ color: '#10b981' }}>{votedItems.length}</strong>
        </div>
        {missingItems.length > 0 && (
          <div style={styles.summaryRow}>
            <p><FiAlertCircle size={12} /> Missing Votes:</p>
            <strong style={{ color: PRIMARY_COLOR }}>{missingItems.length}</strong>
          </div>
        )}
      </div>
      
      {/* Final Warning */}
      <div style={{...styles.finalWarning, background: PRIMARY_COLOR + '10', border: `1px solid ${PRIMARY_COLOR}20`, color: PRIMARY_COLOR }}>
        <div style={styles.finalWarningIcon}>
          <FiAlertCircle size={18} />
        </div>
        <div>
          <strong>Important:</strong> Once you click "Confirm & Submit", your vote will be recorded and cannot be changed.
          Please ensure all your selections are correct.
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  header: {
    marginBottom: '28px'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    fontSize: '13px',
    marginBottom: '20px',
    padding: '8px 0',
    transition: 'color 0.2s'
  },
  headerContent: {
    textAlign: 'center'
  },
  headerIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    color: 'white'
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 8px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  warningBox: {
    background: '#fef3c7',
    border: '1px solid #fde68a',
    borderRadius: '14px',
    padding: '16px 20px',
    marginBottom: '24px',
    display: 'flex',
    gap: '14px'
  },
  warningIconRed: {
    color: '#f59e0b',
    flexShrink: 0,
    marginTop: '2px'
  },
  warningTitle: {
    fontSize: '14px',
    marginBottom: '4px',
    color: '#92400e'
  },
  warningText: {
    fontSize: '13px',
    margin: '0 0 10px 0',
    color: '#92400e'
  },
  missingList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px'
  },
  missingBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500'
  },
  reviewList: {
    marginBottom: '24px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: '16px'
  },
  reviewItem: {
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    marginBottom: '16px',
    overflow: 'hidden',
    transition: 'all 0.2s'
  },
  reviewItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  positionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  positionIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  positionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#0f172a',
    margin: 0
  },
  positionMeta: {
    display: 'flex',
    gap: '8px',
    marginTop: '5px'
  },
  positionTypeBadge: {
    fontSize: '10px',
    padding: '2px 10px',
    borderRadius: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  seatsBadge: {
    fontSize: '10px',
    background: '#f1f5f9',
    color: '#64748b',
    padding: '2px 10px',
    borderRadius: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'white',
    border: '1px solid',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  candidateSection: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '18px',
    padding: '20px'
  },
  candidateAvatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    overflow: 'hidden',
    flexShrink: 0,
    background: '#f1f5f9',
    border: `2px solid ${PRIMARY_COLOR}40`
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: '600'
  },
  candidateDetails: {
    flex: 1
  },
  candidateName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  nameIcon: {
    color: '#64748b'
  },
  candidateSlogan: {
    fontSize: '13px',
    fontStyle: 'italic',
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  candidateBio: {
    fontSize: '12px',
    color: '#64748b',
    lineHeight: '1.5',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '6px'
  },
  confirmIcon: {
    flexShrink: 0
  },
  summaryBox: {
    background: '#ffffff',
    borderRadius: '14px',
    padding: '0',
    marginBottom: '20px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden'
  },
  summaryHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 20px',
    fontSize: '14px',
    fontWeight: '600'
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    fontSize: '13px',
    borderBottom: '1px solid #f1f5f9'
  },
  finalWarning: {
    display: 'flex',
    gap: '12px',
    padding: '16px 20px',
    borderRadius: '14px',
    fontSize: '13px',
    alignItems: 'center'
  },
  finalWarningIcon: {
    flexShrink: 0
  }
};

export default ReviewVote;