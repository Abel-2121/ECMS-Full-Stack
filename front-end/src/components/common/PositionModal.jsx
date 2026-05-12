import React from 'react';
import { HiChartBar, HiUsers, HiDocumentText } from 'react-icons/hi';
import { MdOutlineAssignment, MdOutlineHowToVote } from 'react-icons/md';
import { BsBarChartSteps, BsPeopleFill, BsTrophy } from 'react-icons/bs';
import { GiTargetArrows, GiCrown } from 'react-icons/gi';
import { FiUsers, FiAward, FiCheckCircle, FiClock } from 'react-icons/fi';

const PositionModal = ({ position, isOpen, onClose }) => {
  if (!isOpen || !position) return null;

  const getElectionTypeIcon = (type) => {
    switch(type) {
      case 'ranked': return <BsBarChartSteps size={16} />;
      case 'multiple_winners': return <BsPeopleFill size={16} />;
      default: return <BsTrophy size={16} />;
    }
  };

  const getStatusBadge = (type) => {
    if (type === 'ranked') return { text: 'Ranked Voting', bg: '#ede9fe', color: '#6d28d9' };
    if (type === 'multiple_winners') return { text: 'Multiple Winners', bg: '#dcfce7', color: '#166534' };
    return { text: 'Single Winner', bg: '#dbeafe', color: '#1e40af' };
  };

  const status = getStatusBadge(position.electionType);
  const eligibleVoters = 2000;
  const turnout = Math.round((position.totalVotes / eligibleVoters) * 100);

  const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    modal: {
      background: '#ffffff',
      borderRadius: '28px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '85vh',
      overflowY: 'auto',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      animation: 'slideUp 0.3s ease',
    },
    modalHeader: {
      padding: '24px 28px',
      background: 'linear-gradient(135deg, #023430 0%, #011a18 100%)',
      color: 'white',
    },
    modalPositionName: {
      fontSize: '24px',
      fontWeight: '800',
      marginBottom: '8px',
    
      letterSpacing: '-0.3px',
    },
    modalPositionMeta: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      marginBottom: '14px',
    },
    modalMetaBadge: {
      padding: '4px 12px',
      borderRadius: '30px',
      fontSize: '12px',
      fontWeight: '600',
      background: 'rgba(255, 255, 255, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      
    },
    modalPositionDesc: {
      fontSize: '14px',
      opacity: 0.85,
      lineHeight: '1.6',
    
    },
    modalBody: {
      padding: '24px',
    },
    infoCards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
      marginBottom: '24px',
    },
    infoCard: {
      background: '#f8fafc',
      padding: '16px',
      borderRadius: '16px',
      textAlign: 'center',
      border: '1px solid #e5e7eb',
    },
    infoCardValue: {
      fontSize: '26px',
      fontWeight: '800',
      color: '#D23A01',
      
    },
    infoCardLabel: {
      fontSize: '11px',
      color: '#0f1013',
      marginTop: '6px',
      textTransform: 'uppercase',
      fontWeight: '600',
      
    },
    modalSection: {
      marginBottom: '24px',
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#1a1a1a',
      marginBottom: '14px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      paddingBottom: '8px',
      borderBottom: '2px solid #e5e7eb',
      
    },
    allocationList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    allocationItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '12px',
      background: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
    },
    allocationRank: {
      width: '50px',
      fontWeight: '800',
      color: '#D23A01',
      fontSize: '15px',
      
    },
    allocationRole: {
      flex: 1,
      fontWeight: '600',
      color: '#1a1a1a',
      fontSize: '14px',
      
    },
    allocationDesc: {
      fontSize: '12px',
      color: '#000000',
      
    },
    rulesList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    ruleItem: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 14px',
      background: '#f8fafc',
      borderRadius: '10px',
      fontSize: '13px',
      
    },
    ruleLabel: {
      color: '#010102',
      fontWeight: '500',
    },
    ruleValue: {
      fontWeight: '600',
      color: '#1a1a1a',
    },
    docsList: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
    },
    docBadge: {
      padding: '6px 14px',
      background: '#f1f5f9',
      borderRadius: '30px',
      fontSize: '12px',
      color: '#040405',
      fontWeight: '500',
      
    },
    modalCandidatesList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginTop: '14px',
    },
    modalCandidateItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '12px',
      background: '#f8fafc',
      borderRadius: '14px',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s',
    },
    candidateRankBadge: {
      width: '32px',
      height: '32px',
      background: '#e5e7eb',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '13px',
      fontWeight: '800',
      color: '#000000',
    },
    candidateInfo: {
      flex: 1,
    },
    candidateName: {
      fontSize: '15px',
      fontWeight: '700',
      color: '#1a1a1a',

    },
    candidateVotes: {
      fontSize: '12px',
      color: '#0b0d11',
      marginTop: '2px',
    },
    candidatePercentage: {
      fontSize: '15px',
      fontWeight: '700',
      color: '#D23A01',
    },
    modalFooter: {
      padding: '16px 24px',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'flex-end',
      background: '#fafafa',
    },
    closeModalBtn: {
      padding: '10px 24px',
      background: '#023430',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '600',
      color: 'white',
      transition: 'all 0.2s',
    },
  };

  const slideUpKeyframes = `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  return (
    <>
      <style>{slideUpKeyframes}</style>
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.modalHeader}>
            <div style={styles.modalPositionName}>{position.positionName}</div>
            <div style={styles.modalPositionMeta}>
              <span style={{ ...styles.modalMetaBadge, background: `${status.bg}`, color: status.color }}>
                {getElectionTypeIcon(position.electionType)} {status.text}
              </span>
              <span style={styles.modalMetaBadge}>
                <GiTargetArrows size={12} /> {position.totalSeats} Seat{position.totalSeats > 1 ? 's' : ''}
              </span>
              <span style={styles.modalMetaBadge}>
                <FiUsers size={12} /> {position.candidates?.length || 0} Candidates
              </span>
            </div>
            <div style={styles.modalPositionDesc}>{position.positionDescription}</div>
          </div>
          
          <div style={styles.modalBody}>
            <div style={styles.infoCards}>
              <div style={styles.infoCard}>
                <div style={styles.infoCardValue}>{position.candidates?.length || 0}</div>
                <div style={styles.infoCardLabel}>Total Candidates</div>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoCardValue}>{position.totalVotes?.toLocaleString() || 0}</div>
                <div style={styles.infoCardLabel}>Votes Cast</div>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoCardValue}>{turnout}%</div>
                <div style={styles.infoCardLabel}>Turnout Rate</div>
              </div>
            </div>

            {position.seatAllocation && position.seatAllocation.length > 0 && (
              <div style={styles.modalSection}>
                <div style={styles.sectionTitle}>
                  <HiChartBar size={18} color="#D23A01" /> Role Allocation (Ranked Voting)
                </div>
                <div style={styles.allocationList}>
                  {position.seatAllocation.map((alloc, idx) => (
                    <div key={idx} style={styles.allocationItem}>
                      <div style={styles.allocationRank}>#{alloc.rank}</div>
                      <div style={styles.allocationRole}>{alloc.roleName}</div>
                      <div style={styles.allocationDesc}>{alloc.description || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {position.eligibilityRules && (position.eligibilityRules.minGPA || 
              (position.eligibilityRules.allowedDepartments?.length > 0) || 
              (position.eligibilityRules.allowedYears?.length > 0)) && (
              <div style={styles.modalSection}>
                <div style={styles.sectionTitle}>
                  <MdOutlineAssignment size={18} color="#023430" /> Eligibility Requirements
                </div>
                <div style={styles.rulesList}>
                  {position.eligibilityRules.minGPA && (
                    <div style={styles.ruleItem}>
                      <span style={styles.ruleLabel}>Minimum GPA</span>
                      <span style={styles.ruleValue}>{position.eligibilityRules.minGPA}+</span>
                    </div>
                  )}
                  {position.eligibilityRules.allowedDepartments?.length > 0 && (
                    <div style={styles.ruleItem}>
                      <span style={styles.ruleLabel}>Allowed Departments</span>
                      <span style={styles.ruleValue}>{position.eligibilityRules.allowedDepartments.join(', ')}</span>
                    </div>
                  )}
                  {position.eligibilityRules.allowedYears?.length > 0 && (
                    <div style={styles.ruleItem}>
                      <span style={styles.ruleLabel}>Allowed Years</span>
                      <span style={styles.ruleValue}>Year {position.eligibilityRules.allowedYears.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {position.requiredDocuments && position.requiredDocuments.length > 0 && (
              <div style={styles.modalSection}>
                <div style={styles.sectionTitle}>
                  <HiDocumentText size={18} color="#D23A01" /> Required Documents
                </div>
                <div style={styles.docsList}>
                  {position.requiredDocuments.map((doc, idx) => (
                    <span key={idx} style={styles.docBadge}>
                      {doc.replace('_', ' ').toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.modalSection}>
              <div style={styles.sectionTitle}>
                <BsTrophy size={18} color="#D23A01" /> Candidate Standings
              </div>
              <div style={styles.modalCandidatesList}>
                {position.candidates?.map((candidate, idx) => (
                  <div key={candidate.id || idx} style={styles.modalCandidateItem}>
                    <div style={{
                      ...styles.candidateRankBadge,
                      ...(candidate.isWinner ? { background: '#D23A0110', color: '#D23A01' } : 
                         (idx === 0 ? { background: '#D23A0110', color: '#D23A01' } : { background: '#f1f5f9', color: '#4b5563' })
                      )
                    }}>
                      {candidate.isWinner ? <GiCrown size={14} color="#D23A01" /> : `#${idx + 1}`}
                    </div>
                    <div style={styles.candidateInfo}>
                      <div style={styles.candidateName}>{candidate.name}</div>
                      <div style={styles.candidateVotes}>
                        {candidate.slogan ? `"${candidate.slogan}"` : ''}
                      </div>
                    </div>
                    <div style={styles.candidatePercentage}>{candidate.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div style={styles.modalFooter}>
            <button 
              style={styles.closeModalBtn}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#D23A01';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#023430';
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PositionModal;