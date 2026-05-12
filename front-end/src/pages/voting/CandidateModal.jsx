// components/candidate/CandidateModal.jsx
import React, { useEffect } from 'react';

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

const CandidateModal = ({ candidate, isOpen, onClose }) => {
  const [imageError, setImageError] = React.useState(false);
  
  if (!isOpen || !candidate) return null;

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const candidateName = candidate.userId?.firstName && candidate.userId?.lastName 
    ? `${candidate.userId.firstName} ${candidate.userId.lastName}`
    : candidate.userId?.name || 'Candidate';
  
  const photoUrl = candidate.processedPhotoUrl || getImageUrl(candidate.campaignPhoto);
  const hasValidPhoto = photoUrl && !imageError;
  const initials = candidateName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.heroSection}>
          {hasValidPhoto ? (
            <img src={photoUrl} alt={candidateName} style={styles.heroImage} onError={() => setImageError(true)} />
          ) : (
            <div style={styles.heroPlaceholder}>{initials}</div>
          )}
          <div style={styles.heroOverlay}>
            <div style={styles.heroPosition}>{candidate.positionName}</div>
            <div style={styles.heroName}>{candidateName}</div>
            {candidate.slogan && <div style={styles.heroSlogan}>"{candidate.slogan}"</div>}
          </div>
        </div>

        <div style={styles.bodyContent}>
          {candidate.biography && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Biography
              </div>
              <div style={styles.sectionContent}>{candidate.biography}</div>
            </div>
          )}

          {candidate.manifesto && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                Manifesto
              </div>
              <div style={{ ...styles.sectionContent, whiteSpace: 'pre-wrap' }}>{candidate.manifesto}</div>
            </div>
          )}

          <div style={styles.infoGrid}>
            <div style={styles.infoItem}><p style={styles.infoLabel}>Email</p><p style={styles.infoValue}>{candidate.userId?.email}</p></div>
            {candidate.userId?.phone && (<div style={styles.infoItem}><p style={styles.infoLabel}>Phone</p><p style={styles.infoValue}>{candidate.userId.phone}</p></div>)}
          </div>
        </div>

        <div style={styles.footer}>
          <button style={styles.closeBtn} onClick={onClose}>Close Profile</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 4vw, 20px)' },
  modal: { background: 'white', borderRadius: 'clamp(20px, 5vw, 24px)', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative',  },
  heroSection: { position: 'relative', height: 'clamp(280px, 40vh, 320px)', overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' },
  heroPlaceholder: { width: '100%', height: '100%', background: 'linear-gradient(135deg, #D23A01, #023430)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'clamp(48px, 10vw, 64px)', fontWeight: '700', color: 'white' },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'clamp(30px, 5vw, 40px) clamp(20px, 4vw, 24px) clamp(20px, 4vw, 24px)', background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.4), transparent)', color: 'white' },
  heroName: { fontSize: 'clamp(24px, 5vw, 28px)', fontWeight: '800', marginBottom: '6px', letterSpacing: '-0.02em' },
  heroPosition: { fontSize: 'clamp(11px, 2.5vw, 13px)', fontWeight: '700', background: '#D23A01', padding: '4px 12px', borderRadius: '8px', marginBottom: '10px', display: 'inline-block' },
  heroSlogan: { fontSize: 'clamp(14px, 3vw, 16px)', fontStyle: 'italic', color: '#e2e8f0', fontWeight: '500' },
  bodyContent: { padding: 'clamp(20px, 5vw, 28px)' },
  section: { marginBottom: 'clamp(20px, 4vw, 28px)' },
  sectionTitle: { fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: '700', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '8px', borderBottom: '2px solid #f1f5f9', flexWrap: 'wrap' },
  sectionContent: { fontSize: 'clamp(13px, 3vw, 15px)', color: '#475569', lineHeight: '1.6', fontWeight: '400' },
  infoGrid: { display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' },
  infoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'clamp(12px, 3vw, 14px) clamp(14px, 3vw, 18px)', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '10px' },
  infoLabel: { fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: '600', color: '#64748b' },
  infoValue: { fontSize: 'clamp(12px, 3vw, 14px)', fontWeight: '700', color: '#1e293b', wordBreak: 'break-all' },
  footer: { padding: 'clamp(16px, 4vw, 20px) clamp(20px, 5vw, 28px) clamp(20px, 5vw, 28px)', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' },
  closeBtn: { padding: 'clamp(10px, 2.5vw, 12px) clamp(20px, 4vw, 24px)', background: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontSize: 'clamp(13px, 3vw, 15px)', fontWeight: '600', cursor: 'pointer' }
};

export default CandidateModal;