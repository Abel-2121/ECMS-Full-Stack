import React from 'react';
import { FiMail, FiPhone, FiEye, FiAward } from 'react-icons/fi';

// API base URL from environment
const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:4001';

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

const CandidateCard = ({ candidate, onClick }) => {
  const getStatusStyle = (status) => {
    switch(status) {
      case 'approved': return { background: '#10b981', color: 'white' };
      case 'pending': return { background: '#f59e0b', color: 'white' };
      case 'rejected': return { background: '#ef4444', color: 'white' };
      case 'elected': return { background: '#8b5cf6', color: 'white' };
      default: return { background: '#64748b', color: 'white' };
    }
  };

  // Get profile image URL from campaignPhoto or photo
  const profileImageUrl = getImageUrl(candidate.campaignPhoto || candidate.photoUrl || candidate.userId?.photo);
  
  // Get initials for fallback
  const getInitials = () => {
    const firstName = candidate.userId?.firstName || '';
    const lastName = candidate.userId?.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
  };

  const statusStyle = getStatusStyle(candidate.status);

  return (
    <div style={styles.card} onClick={() => onClick(candidate)}>
      <div style={styles.photoSection}>
        {profileImageUrl ? (
          <img 
            src={profileImageUrl} 
            alt={candidate.userId?.firstName} 
            style={styles.photo}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<div style="${Object.entries(styles.fallbackAvatar).map(([k, v]) => `${k}:${v}`).join(';')}">${getInitials()}</div>`;
            }}
          />
        ) : (
          <div style={styles.fallbackAvatar}>
            {getInitials()}
          </div>
        )}
        <span style={{ ...styles.statusBadge, background: statusStyle.background, color: statusStyle.color }}>
          {candidate.status?.toUpperCase()}
        </span>
      </div>
      
      <div style={styles.content}>
        <h3 style={styles.name}>{candidate.userId?.firstName} {candidate.userId?.lastName}</h3>
        <span style={styles.position}>{candidate.positionName}</span>
        
        {candidate.slogan && (
          <p style={styles.slogan}>"{candidate.slogan.substring(0, 60)}{candidate.slogan.length > 60 ? '...' : ''}"</p>
        )}
        
        <div style={styles.contactInfo}>
          <div style={styles.contactItem}>
            <FiMail size={14} style={styles.icon} />
            <span>{candidate.userId?.email}</span>
          </div>
          {candidate.userId?.phone && (
            <div style={styles.contactItem}>
              <FiPhone size={14} style={styles.icon} />
              <span>{candidate.userId.phone}</span>
            </div>
          )}
        </div>
        
        
        
        <button style={styles.detailsBtn} onClick={(e) => { e.stopPropagation(); onClick(candidate); }}>
          <FiEye size={14} />
          View Profile
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    border: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column'
  },
  photoSection: {
    position: 'relative',
    height: '180px',
    overflow: 'hidden',
    background: '#f8fafc'
  },
  photo: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center'
  },
  fallbackAvatar: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #D23A01, #b02e00)',
    color: 'white',
    fontSize: '48px',
    fontWeight: '700'
  },
  statusBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  content: {
    padding: '18px'
  },
  name: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '6px'
  },
  position: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#D23A01',
    background: '#FEF3F0',
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '8px',
    marginBottom: '12px'
  },
  slogan: {
    fontSize: '14px',
    fontStyle: 'italic',
    color: '#64748b',
    marginBottom: '16px',
    lineHeight: '1.5'
  },
  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9'
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: '#475569'
  },
  icon: {
    color: '#94a3b8'
  },
  voteCount: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    padding: '10px 14px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #f1f5f9'
  },
  voteLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  voteNumber: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0f172a'
  },
  detailsBtn: {
    width: '100%',
    padding: '12px',
    background: '#1e293b',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    transition: 'background 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  }
};

// Add hover effect via CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .candidate-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -12px rgba(0, 0, 0, 0.15);
  }
  .details-btn:hover {
    background: #D23A01 !important;
  }
`;
if (!document.head.querySelector('#candidate-card-styles')) {
  styleSheet.id = 'candidate-card-styles';
  document.head.appendChild(styleSheet);
}

export default CandidateCard;