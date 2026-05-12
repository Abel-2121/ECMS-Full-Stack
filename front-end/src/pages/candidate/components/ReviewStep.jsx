// pages/candidate/components/ReviewStep.jsx
import React, { useState } from 'react';
import { 
  FiArrowLeft, 
  FiCheckCircle, 
  FiUser, 
  FiFileText, 
  FiImage, 
  FiBookOpen, 
  FiAward,
  FiAlertCircle,
  FiEdit2,
  FiFile,
  FiCalendar,
  FiBriefcase,
  FiTag,
  FiUsers,
  FiBarChart2,
 
  FiDownload,
  FiCheck
} from 'react-icons/fi';

export const ReviewStep = ({ 
  selectedElection,
  selectedPosition,
  formData,
  documentTypes,
  onBack,
  onSubmit,
  isLoading
}) => {
  const [expandedSections, setExpandedSections] = useState({
    election: true,
    position: true,
    campaign: true,
    documents: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Format document type for display
  const formatDocType = (type) => {
    const types = {
      nomination_form: 'Nomination Form',
      transcript: 'Academic Transcript',
      noc: 'No Objection Certificate',
      recommendation_letter: 'Recommendation Letter',
      other: 'Other Document'
    };
    return types[type] || type;
  };

  // Get document icon
  const getDocumentIcon = (type) => {
    switch(type) {
      case 'nomination_form': return <FiFileText size={20} />;
      case 'transcript': return <FiBookOpen size={20} />;
      case 'noc': return <FiFile size={20} />;
      case 'recommendation_letter': return <FiAward size={20} />;
      default: return <FiDownload size={20} />;
    }
  };

  // Get position type text
  const getPositionTypeText = (type) => {
    switch (type) {
      case 'single_winner': return 'Single Winner';
      case 'multiple_winners': return 'Multiple Winners';
      case 'ranked': return 'Ranked Voting';
      default: return 'Standard';
    }
  };

  // Get position type icon
  const getPositionTypeIcon = (type) => {
    switch (type) {
      case 'single_winner': return <FiAward size={14} />;
      case 'multiple_winners': return <FiUsers size={14} />;
      case 'ranked': return <FiBarChart2 size={14} />;
      default: return <FiAward size={14} />;
    }
  };

  // Get word count
  const getWordCount = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>
          <FiArrowLeft size={18} /> Back to Declarations
        </button>
        <div style={styles.headerContent}>
          <div style={styles.headerIcon}>
            <FiCheckCircle size={36} />
          </div>
          <h2 style={styles.headerTitle}>Review Your Nomination</h2>
          <p style={styles.headerSubtitle}>
            Please review all information before submitting
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        
        {/* Election Section */}
        <div style={styles.section}>
          <div 
            style={styles.sectionHeader}
            onClick={() => toggleSection('election')}
          >
            <div style={styles.sectionTitle}>
              <FiCalendar size={20} style={styles.sectionIcon} />
              <h3 style={styles.sectionTitleText}>Election Details</h3>
            </div>
            <button style={styles.editBtn} onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}>
              <FiEdit2 size={14} /> Edit
            </button>
          </div>
          
          {expandedSections.election && (
            <div style={styles.sectionContent}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Election Title</span>
                <span style={styles.infoValue}>{selectedElection?.title}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Election ID</span>
                <span style={styles.infoValue}>#{selectedElection?.electionId}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Status</span>
                <span style={{
                  ...styles.statusBadge,
                  background: selectedElection?.status === 'nomination_open' ? '#D23A0110' : '#fef3c7',
                  color: selectedElection?.status === 'nomination_open' ? '#D23A01' : '#92400e'
                }}>
                  {selectedElection?.status?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Position Section */}
        <div style={styles.section}>
          <div 
            style={styles.sectionHeader}
            onClick={() => toggleSection('position')}
          >
            <div style={styles.sectionTitle}>
              <FiBriefcase size={20} style={styles.sectionIcon} />
              <h3 style={styles.sectionTitleText}>Position Details</h3>
            </div>
            <button style={styles.editBtn} onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}>
              <FiEdit2 size={14} /> Edit
            </button>
          </div>
          
          {expandedSections.position && (
            <div style={styles.sectionContent}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Position Name</span>
                <span style={styles.infoValue}>{selectedPosition?.positionName}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Election Type</span>
                <span style={styles.infoValue}>
                  {getPositionTypeIcon(selectedPosition?.electionType)} {getPositionTypeText(selectedPosition?.electionType)}
                </span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Total Seats</span>
                <span style={styles.infoValue}>{selectedPosition?.totalSeats} Seat{selectedPosition?.totalSeats > 1 ? 's' : ''}</span>
              </div>
              {selectedPosition?.positionDescription && (
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Description</span>
                  <span style={styles.infoValue}>{selectedPosition.positionDescription}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Campaign Information Section */}
        <div style={styles.section}>
          <div 
            style={styles.sectionHeader}
            onClick={() => toggleSection('campaign')}
          >
            <div style={styles.sectionTitle}>
              <FiUser size={20} style={styles.sectionIcon} />
              <h3 style={styles.sectionTitleText}>Campaign Information</h3>
            </div>
            <button style={styles.editBtn} onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}>
              <FiEdit2 size={14} /> Edit
            </button>
          </div>
          
          {expandedSections.campaign && (
            <div style={styles.sectionContent}>
              {/* Slogan */}
              <div style={styles.campaignCard}>
                <div style={styles.campaignHeader}>
                  <FiAward size={18} color="#D23A01" />
                  <strong style={styles.campaignHeaderText}>Slogan</strong>
                </div>
                <p style={styles.sloganText}>"{formData.slogan}"</p>
                <div style={styles.wordCountBadge}>
                  <FiTag size={10} /> {getWordCount(formData.slogan)} words
                </div>
              </div>

              {/* Manifesto */}
              <div style={styles.campaignCard}>
                <div style={styles.campaignHeader}>
                  <FiFileText size={18} color="#D23A01" />
                  <strong style={styles.campaignHeaderText}>Manifesto</strong>
                </div>
                <p style={styles.manifestoText}>{formData.manifesto}</p>
                <div style={styles.wordCountBadge}>
                  <FiFileText size={10} /> {getWordCount(formData.manifesto)} words
                </div>
              </div>

              {/* Biography */}
              <div style={styles.campaignCard}>
                <div style={styles.campaignHeader}>
                  <FiBookOpen size={18} color="#D23A01" />
                  <strong style={styles.campaignHeaderText}>Biography</strong>
                </div>
                <p style={styles.bioText}>{formData.biography}</p>
                <div style={styles.wordCountBadge}>
                  <FiBookOpen size={10} /> {getWordCount(formData.biography)} words
                </div>
              </div>

              {/* Campaign Photo */}
              {formData.campaignPhoto && (
                <div style={styles.photoCard}>
                  <div style={styles.campaignHeader}>
                    <FiImage size={18} color="#D23A01" />
                    <strong style={styles.campaignHeaderText}>Campaign Photo</strong>
                  </div>
                  <div style={styles.photoPreview}>
                    <img 
                      src={URL.createObjectURL(formData.campaignPhoto)} 
                      alt="Campaign"
                      style={styles.photo}
                    />
                    <div style={styles.photoInfo}>
                      <span style={styles.fileName}>{formData.campaignPhoto.name}</span>
                      <span style={styles.fileSize}>
                        {(formData.campaignPhoto.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Supporting Documents Section */}
        {formData.supportingDocuments.length > 0 && (
          <div style={styles.section}>
            <div 
              style={styles.sectionHeader}
              onClick={() => toggleSection('documents')}
            >
              <div style={styles.sectionTitle}>
                <FiFile size={20} style={styles.sectionIcon} />
                <h3 style={styles.sectionTitleText}>Supporting Documents</h3>
              </div>
              <span style={styles.docCount}>{formData.supportingDocuments.length} files</span>
            </div>
            
            {expandedSections.documents && (
              <div style={styles.sectionContent}>
                {formData.supportingDocuments.map((doc, idx) => (
                  <div key={idx} style={styles.documentCard}>
                    <div style={styles.documentIcon}>
                      {getDocumentIcon(documentTypes[idx])}
                    </div>
                    <div style={styles.documentInfo}>
                      <div style={styles.documentName}>{doc.name}</div>
                      <div style={styles.documentMeta}>
                        <span style={styles.docType}>{formatDocType(documentTypes[idx])}</span>
                        <span style={styles.docSize}>{(doc.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <FiCheckCircle size={18} style={styles.documentCheck} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Declarations Summary */}
        <div style={styles.declarationSection}>
          <div style={styles.declarationHeader}>
            <FiCheckCircle size={20} color="#10b981" />
            <h4 style={styles.declarationTitle}>Declarations Accepted</h4>
          </div>
          <div style={styles.declarationList}>
            {formData.declarations.codeOfConduct && (
              <div style={styles.declarationItem}>
                <FiCheck size={14} color="#10b981" /> Code of Conduct Agreement
              </div>
            )}
            {formData.declarations.spendingLimit && (
              <div style={styles.declarationItem}>
                <FiCheck size={14} color="#10b981" /> Spending Limit Compliance
              </div>
            )}
            {formData.declarations.truthfulness && (
              <div style={styles.declarationItem}>
                <FiCheck size={14} color="#10b981" /> Truthfulness Declaration
              </div>
            )}
          </div>
        </div>

        {/* Important Notice */}
        <div style={styles.notice}>
          <FiAlertCircle size={18} style={styles.noticeIcon} />
          <div style={styles.noticeText}>
            <strong>Important:</strong> Once submitted, you cannot modify your nomination. 
            Please ensure all information is correct before proceeding.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button 
            style={styles.secondaryBtn} 
            onClick={onBack}
          >
            Back to Declarations
          </button>
          <button 
            style={styles.submitBtn} 
            onClick={onSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div style={styles.spinner}></div>
                Submitting...
              </>
            ) : (
              <>
                <FiCheckCircle size={18} />
                Submit Nomination
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    background: '#ffffff',
    borderRadius: '20px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  header: {
    padding: 'clamp(20px, 4vw, 28px)',
    background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
    borderBottom: '1px solid #e5e7eb'
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '16px',
    padding: 0,
    
  },
  headerContent: {
    textAlign: 'center'
  },
  headerIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#D23A0110',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    color: '#D23A01'
  },
  headerTitle: {
    fontSize: 'clamp(22px, 5vw, 26px)',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '8px',
    
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    
  },
  content: {
    padding: 'clamp(20px, 4vw, 24px)'
  },
  section: {
    marginBottom: '24px',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    overflow: 'hidden'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 'clamp(14px, 3vw, 16px) 20px',
    background: '#fafbfc',
    cursor: 'pointer',
    borderBottom: '1px solid #e5e7eb'
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  sectionIcon: {
    color: '#D23A01'
  },
  sectionTitleText: {
    fontSize: 'clamp(15px, 3vw, 16px)',
    fontWeight: '700',
    margin: 0,
    color: '#1a1a1a',
    
  },
  editBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '600',
    color: '#4b5563',
    
  },
  sectionContent: {
    padding: '20px'
  },
  infoRow: {
    display: 'flex',
    padding: '10px 0',
    borderBottom: '1px solid #f1f5f9',
    flexWrap: 'wrap',
    gap: '8px'
  },
  infoLabel: {
    width: '140px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    
  },
  infoValue: {
    flex: 1,
    fontSize: '13px',
    fontWeight: '500',
    color: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    display: 'inline-block'
  },
  campaignCard: {
    marginBottom: '20px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  campaignHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  },
  campaignHeaderText: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#1a1a1a',
    
  },
  sloganText: {
    fontSize: '16px',
    fontStyle: 'italic',
    color: '#D23A01',
    marginBottom: '10px',
    padding: '0 8px',
    
  },
  manifestoText: {
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#050607',
    marginBottom: '10px',
    
  },
  bioText: {
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#0a0b0e',
    marginBottom: '10px',
    
  },
  wordCountBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    background: '#e5e7eb',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: '500',
    color: '#070708',
    
  },
  photoCard: {
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  photoPreview: {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    marginTop: '12px',
    flexWrap: 'wrap'
  },
  photo: {
    width: '80px',
    height: '80px',
    borderRadius: '12px',
    objectFit: 'cover',
    border: '2px solid #e5e7eb'
  },
  photoInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  fileName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1a1a1a',
    
  },
  fileSize: {
    fontSize: '11px',
    color: '#000000',
    
  },
  docCount: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '2px 8px',
    background: '#e5e7eb',
    borderRadius: '12px',
    color: '#050608',
    
  },
  documentCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#f8fafc',
    borderRadius: '12px',
    marginBottom: '10px',
    border: '1px solid #e5e7eb'
  },
  documentIcon: {
    color: '#D23A01',
    flexShrink: 0
  },
  documentInfo: {
    flex: 1
  },
  documentName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1a1a1a',
    
  },
  documentMeta: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px',
    flexWrap: 'wrap'
  },
  docType: {
    fontSize: '10px',
    padding: '2px 8px',
    background: '#D23A0110',
    color: '#D23A01',
    borderRadius: '12px',
    fontWeight: '600',
    
  },
  docSize: {
    fontSize: '10px',
    color: '#000000',
    
  },
  documentCheck: {
    color: '#10b981',
    flexShrink: 0
  },
  declarationSection: {
    padding: '20px',
    background: '#f0fdf4',
    borderRadius: '16px',
    marginBottom: '20px',
    border: '1px solid #dcfce7'
  },
  declarationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px'
  },
  declarationTitle: {
    fontSize: '15px',
    fontWeight: '700',
    margin: 0,
    color: '#166534',
    
  },
  declarationList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  declarationItem: {
    fontSize: '13px',
    color: '#166534',
    padding: '4px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    
  },
  notice: {
    display: 'flex',
    gap: '12px',
    padding: '16px 20px',
    background: '#fef3c7',
    borderRadius: '12px',
    marginBottom: '24px',
    border: '1px solid #fde68a'
  },
  noticeIcon: {
    color: '#d97706',
    flexShrink: 0
  },
  noticeText: {
    fontSize: '12px',
    color: '#92400e',
    lineHeight: '1.5',
    
  },
  actionButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'flex-end',
    marginTop: '24px',
    flexWrap: 'wrap'
  },
  secondaryBtn: {
    flex: 1,
    padding: '12px 24px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#000000',
    transition: 'all 0.2s'
  },
  submitBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 28px',
    background: '#D23A01',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    transition: 'all 0.2s'
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid white',
    borderTop: '2px solid transparent',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite'
  }
};

// Add keyframe animation
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 640px) {
    .info-row {
      flex-direction: column;
      gap: 4px;
    }
    .info-label {
      width: 100% !important;
    }
    .action-buttons {
      flex-direction: column;
    }
    .secondary-btn, .submit-btn {
      width: 100%;
    }
    .photo-preview {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;
if (!document.head.querySelector('#review-step-styles')) {
  styleSheet.id = 'review-step-styles';
  document.head.appendChild(styleSheet);
}

export default ReviewStep;