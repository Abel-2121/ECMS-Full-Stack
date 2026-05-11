// components/candidate/CandidateCard.jsx
import React from 'react';
import { FiEye, FiCheckCircle } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL_UPLOAD || 'http://localhost:4001';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  let normalizedPath = imagePath.replace(/\\/g, '/');
  if (normalizedPath.startsWith('uploads/uploads/')) normalizedPath = normalizedPath.replace('uploads/uploads/', 'uploads/');
  if (normalizedPath.startsWith('/uploads/')) normalizedPath = normalizedPath.substring(1);
  normalizedPath = normalizedPath.replace(/\/+/g, '/');
  return `${API_BASE_URL}/${normalizedPath}`;
};

const CandidateCard = ({ candidate, positionName, onViewDetails, onVote, isSelected, disabled }) => {
  const [imageError, setImageError] = React.useState(false);
  
  const photoUrl = candidate.processedPhotoUrl || getImageUrl(candidate.campaignPhoto);
  const hasValidPhoto = photoUrl && !imageError;
  
  const getStatusStyle = (status) => {
    switch(status) {
      case 'approved': return { background: '#10b981', color: 'white' };
      case 'pending': return { background: '#f59e0b', color: 'white' };
      case 'rejected': return { background: '#ef4444', color: 'white' };
      case 'elected': return { background: '#8b5cf6', color: 'white' };
      default: return { background: '#64748b', color: 'white' };
    }
  };

  const candidateName = candidate.userId?.firstName && candidate.userId?.lastName 
    ? `${candidate.userId.firstName} ${candidate.userId.lastName}`
    : candidate.userId?.name || 'Candidate';
  
  const initials = candidateName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleViewDetails = (e) => { e.stopPropagation(); onViewDetails(candidate); };
  const handleVoteClick = (e) => { e.stopPropagation(); if (!disabled && !isSelected) onVote(candidate); };

  return (
    <div style={{...styles.card, ...(isSelected && styles.cardSelected), cursor: 'pointer'}} onClick={handleVoteClick}>
      <div style={styles.photoSection}>
        {hasValidPhoto ? (
          <img src={photoUrl} alt={candidateName} style={styles.photo} onError={() => setImageError(true)} />
        ) : (
          <div style={styles.photoPlaceholder}>{initials}</div>
        )}
        <p style={{ ...styles.statusBadge, ...getStatusStyle(candidate.status) }}>{candidate.status?.toUpperCase() || 'PENDING'}</p>
        <button style={styles.eyeIconBtn} onClick={handleViewDetails} title="View Profile Details"><FiEye size={16} /></button>
      </div>
      
      <div style={styles.content}>
        <h3 style={styles.name}>{candidateName}</h3>
        <p style={styles.position}>{positionName || candidate.positionName}</p>
        {candidate.slogan && <p style={styles.slogan}>"{candidate.slogan.substring(0, 60)}{candidate.slogan.length > 60 ? '...' : ''}"</p>}
        
        <div style={styles.contactInfo}>
          <div style={styles.contactItem}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.icon}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <p>{candidate.userId?.email}</p>
          </div>
          {candidate.userId?.phone && (<div style={styles.contactItem}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={styles.icon}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <p>{candidate.userId.phone}</p>
          </div>)}
        </div>
        
        <button style={{...styles.voteBtn, ...(isSelected && styles.voteBtnSelected), ...(disabled && isSelected && styles.voteBtnDisabled)}} onClick={handleVoteClick} disabled={isSelected}>
          {isSelected ? (<><FiCheckCircle size={16} /> Voted</>) : (<>Vote Me</>)}
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: { background: 'white', borderRadius: 'clamp(12px, 3vw, 16px)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', transition: 'all 0.2s', border: '2px solid transparent', display: 'flex', flexDirection: 'column' },
  cardSelected: { borderColor: '#10b981', boxShadow: '0 8px 16px -6px rgba(16,185,129,0.2)', backgroundColor: '#f0fdf4' },
  photoSection: { position: 'relative', height: 'clamp(160px, 30vw, 180px)', overflow: 'hidden', background: 'linear-gradient(135deg, #D23A01, #023430)' },
  photo: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' },
  photoPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(32px, 8vw, 48px)', fontWeight: '700', color: 'white' },
  statusBadge: { position: 'absolute', top: 'clamp(8px, 2vw, 12px)', right: 'clamp(8px, 2vw, 12px)', padding: '4px 10px', borderRadius: '8px', fontSize: 'clamp(10px, 2.5vw, 11px)', fontWeight: '700', textTransform: 'uppercase', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  eyeIconBtn: { position: 'absolute', bottom: 'clamp(8px, 2vw, 12px)', right: 'clamp(8px, 2vw, 12px)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 'clamp(28px, 6vw, 32px)', height: 'clamp(28px, 6vw, 32px)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', backdropFilter: 'blur(4px)' },
  content: { padding: 'clamp(14px, 3vw, 18px)' },
  name: { fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: '700', color: '#1e293b', marginBottom: '6px' },
  position: { fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: '600', color: '#D23A01', background: '#FEF3C7', display: 'inline-block', padding: '4px 12px', borderRadius: '8px', marginBottom: '12px' },
  slogan: { fontSize: 'clamp(12px, 3vw, 14px)', fontStyle: 'italic', color: '#64748b', marginBottom: '16px', lineHeight: '1.5' },
  contactInfo: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' },
  contactItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(11px, 2.5vw, 13px)', color: '#475569', flexWrap: 'wrap' },
  icon: { width: '14px', height: '14px', color: '#94a3b8', flexShrink: 0 },
  voteBtn: { width: '100%', padding: 'clamp(10px, 2.5vw, 12px)', background: '#D23A01', border: 'none', borderRadius: '10px', fontSize: 'clamp(13px, 3vw, 14px)', fontWeight: '600', color: 'white', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  voteBtnSelected: { background: '#10b981', cursor: 'default' },
  voteBtnDisabled: { opacity: 0.7, cursor: 'not-allowed' }
};

export default CandidateCard;