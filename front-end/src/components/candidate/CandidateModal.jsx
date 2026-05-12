// components/candidate/CandidateModal.jsx
import React, { useEffect } from 'react';
import { FiUser, FiFileText, FiMail, FiPhone, FiX, FiDownload, FiFile, FiImage, FiFilePlus } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL_UPLOAD || 'http://localhost:4001';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const normalizedPath = imagePath.replace(/\\/g, '/');
  
  let cleanPath = normalizedPath;
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath;
  } else if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  return `${API_BASE_URL}/${cleanPath}`;
};

// Helper function to get document icon based on file type
const getDocumentIcon = (fileUrl) => {
  if (!fileUrl) return <FiFile size={16} />;
  
  const ext = fileUrl.split('.').pop()?.toLowerCase();
  
  if (ext === 'pdf') return <FiFileText size={16} />;
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <FiImage size={16} />;
  return <FiFilePlus size={16} />;
};

// Helper function to get document type label
const getDocumentTypeLabel = (documentType) => {
  const types = {
    nomination_form: 'Nomination Form',
    transcript: 'Academic Transcript',
    noc: 'No Objection Certificate',
    recommendation_letter: 'Recommendation Letter',
    other: 'Other Document'
  };
  return types[documentType] || documentType || 'Document';
};

// Helper function to get file name from URL
const getFileName = (fileUrl) => {
  if (!fileUrl) return 'Document';
  const parts = fileUrl.split(/[\\/]/);
  return parts[parts.length - 1] || 'Document';
};

// Helper function to open/view document
const viewDocument = (fileUrl) => {
  if (!fileUrl) return;
  
  const fullUrl = getImageUrl(fileUrl);
  
  // Open in new tab
  window.open(fullUrl, '_blank');
};

const CandidateModal = ({ candidate, isOpen, onClose }) => {
  if (!isOpen || !candidate) return null;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const profileImageUrl = getImageUrl(candidate.campaignPhoto || candidate.photoUrl || candidate.userId?.photo);
  
  const getInitials = () => {
    const firstName = candidate.userId?.firstName || '';
    const lastName = candidate.userId?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* HERO SECTION */}
        <div style={styles.heroSection}>
          {profileImageUrl ? (
            <img 
              src={profileImageUrl} 
              alt={candidate.userId?.firstName} 
              style={styles.heroImage}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `<div style="${Object.entries(styles.fallbackHero).map(([k, v]) => `${k}:${v}`).join(';')}">${getInitials()}</div>`;
              }}
            />
          ) : (
            <div style={styles.fallbackHero}>
              {getInitials()}
            </div>
          )}
          <div style={styles.heroOverlay}>
            <div style={styles.heroPosition}>{candidate.positionName}</div>
            <div style={styles.heroName}>{candidate.userId?.firstName} {candidate.userId?.lastName}</div>
            {candidate.slogan && <div style={styles.heroSlogan}>"{candidate.slogan}"</div>}
          </div>
        </div>

        <div style={styles.bodyContent}>
          {/* BIOGRAPHY */}
          {candidate.biography && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                <FiUser size={18} />
                Biography
              </div>
              <div style={styles.sectionContent}>{candidate.biography}</div>
            </div>
          )}

          {/* MANIFESTO */}
          {candidate.manifesto && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                <FiFileText size={18} />
                Manifesto
              </div>
              <div style={{ ...styles.sectionContent, whiteSpace: 'pre-wrap' }}>{candidate.manifesto}</div>
            </div>
          )}

          {/* SUPPORTING DOCUMENTS - NEW SECTION */}
          {candidate.supportingDocuments && candidate.supportingDocuments.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                <FiFilePlus size={18} />
                Supporting Documents
              </div>
              <div style={styles.documentsList}>
                {candidate.supportingDocuments.map((doc, index) => (
                  <div key={index} style={styles.documentItem}>
                    <div style={styles.documentInfo}>
                      <span style={styles.documentIcon}>
                        {getDocumentIcon(doc.fileUrl)}
                      </span>
                      <div style={styles.documentDetails}>
                        <span style={styles.documentType}>
                          {getDocumentTypeLabel(doc.documentType)}
                        </span>
                        <span style={styles.documentName}>
                          {getFileName(doc.fileUrl)}
                        </span>
                        {doc.uploadedAt && (
                          <span style={styles.documentDate}>
                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      style={styles.viewDocumentBtn}
                      onClick={() => viewDocument(doc.fileUrl)}
                      title="View Document"
                    >
                      <FiDownload size={14} /> View
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* INFO GRID */}
          <div style={styles.infoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Email</span>
              <span style={styles.infoValue}>
                <FiMail size={14} style={styles.infoIcon} /> {candidate.userId?.email}
              </span>
            </div>
            {candidate.userId?.phone && (
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>Phone</span>
                <span style={styles.infoValue}>
                  <FiPhone size={14} style={styles.infoIcon} /> {candidate.userId.phone}
                </span>
              </div>
            )}
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.closeBtn} onClick={onClose}>
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(15, 23, 42, 0.8)',
    backdropFilter: 'blur(8px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  modal: {
    background: 'white',
    borderRadius: '24px',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    position: 'relative',
  
  },
  heroSection: {
    position: 'relative',
    height: '320px',
    overflow: 'hidden'
  },
  heroImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center'
  },
  fallbackHero: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #D23A01, #b02e00)',
    color: 'white',
    fontSize: '64px',
    fontWeight: '700'
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: '40px 24px 24px',
    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0,0,0,0.4), transparent)',
    color: 'white'
  },
  heroName: {
    fontSize: '28px',
    fontWeight: '800',
    marginBottom: '6px',
    letterSpacing: '-0.02em'
  },
  heroPosition: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
    background: '#D23A01',
    padding: '4px 12px',
    borderRadius: '8px',
    marginBottom: '10px',
    display: 'inline-block'
  },
  heroSlogan: {
    fontSize: '16px',
    fontStyle: 'italic',
    color: '#e2e8f0',
    fontWeight: '500'
  },
  bodyContent: {
    padding: '28px'
  },
  section: {
    marginBottom: '28px'
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingBottom: '8px',
    borderBottom: '2px solid #f1f5f9'
  },
  sectionContent: {
    fontSize: '15px',
    color: '#475569',
    lineHeight: '1.6',
    fontWeight: '400'
  },
  
  documentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px'
  },
  documentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s ease'
  },
  documentInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },
  documentIcon: {
    color: '#D23A01',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#fff5f0',
    borderRadius: '8px'
  },
  documentDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  documentType: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#D23A01',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  documentName: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#1e293b',
    wordBreak: 'break-all'
  },
  documentDate: {
    fontSize: '10px',
    color: '#94a3b8'
  },
  viewDocumentBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    background: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap'
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '10px'
  },
  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #f1f5f9'
  },
  infoLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#64748b'
  },
  infoValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  infoIcon: {
    color: '#D23A01'
  },
  footer: {
    padding: '20px 28px 28px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  closeBtn: {
    padding: '12px 24px',
    background: '#1e293b',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s',
    '&:hover': {
      background: '#D23A01'
    }
  }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .close-btn:hover {
    background: #D23A01 !important;
  }
  .view-doc-btn:hover {
    background: #b02e00 !important;
  }
  .document-item:hover {
    border-color: #D23A01 !important;
    box-shadow: 0 2px 8px rgba(210, 58, 1, 0.1);
  }
`;
if (!document.head.querySelector('#candidate-modal-styles')) {
  styleSheet.id = 'candidate-modal-styles';
  document.head.appendChild(styleSheet);
}

export default CandidateModal;