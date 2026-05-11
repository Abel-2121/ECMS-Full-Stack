// components/voting/CandidateDetailsModal.jsx
import React from 'react';
import { FiX, FiUser, FiBookOpen, FiFlag, FiAward, FiMail, FiPhone } from 'react-icons/fi';

const CandidateDetailsModal = ({ candidate, onClose }) => {
  if (!candidate) return null;

  const userInfo = candidate.userId || {};
  const positionConfig = candidate.positionConfig || {};

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}>
          <FiX size={20} />
        </button>

        <div style={styles.header}>
          <div style={styles.avatar}>
            {candidate.campaignPhoto ? (
              <img src={candidate.campaignPhoto} alt={userInfo.firstName} style={styles.avatarImg} />
            ) : (
              <div style={styles.avatarPlaceholder}>
                {userInfo.firstName?.[0]}{userInfo.lastName?.[0]}
              </div>
            )}
          </div>
          <div style={styles.headerInfo}>
            <h2 style={styles.name}>{userInfo.firstName} {userInfo.lastName}</h2>
            <p style={styles.position}>{candidate.positionName}</p>
          </div>
        </div>

        <div style={styles.content}>
          {candidate.slogan && (
            <div style={styles.sloganBox}>
              <FiFlag size={18} color="#2563EB" />
              <p style={styles.slogan}>"{candidate.slogan}"</p>
            </div>
          )}

          {candidate.biography && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Biography</h3>
              <p style={styles.sectionContent}>{candidate.biography}</p>
            </div>
          )}

          {candidate.manifesto && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Manifesto</h3>
              <p style={styles.sectionContent}>{candidate.manifesto}</p>
            </div>
          )}

          {/* Position details */}
          {positionConfig.electionType === 'ranked' && positionConfig.seatAllocation?.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Role Allocation</h3>
              <div style={styles.allocationList}>
                {positionConfig.seatAllocation.map((alloc, idx) => (
                  <div key={idx} style={styles.allocationItem}>
                    <p style={styles.allocationRank}>
                      #{alloc.rank} {alloc.rank === 1 ? 'st' : alloc.rank === 2 ? 'nd' : alloc.rank === 3 ? 'rd' : 'th'}
                    </p>
                    <p style={styles.allocationRole}>{alloc.roleName}</p>
                    {alloc.description && <p style={styles.allocationDesc}>{alloc.description}</p>}
                  </div>
                ))}
              </div>
              <p style={styles.infoNote}>
                <strong>Note:</strong> Voters select ONE candidate. The candidate with the highest votes gets the top role.
              </p>
            </div>
          )}

          {positionConfig.totalSeats > 1 && positionConfig.electionType === 'multiple_winners' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Available Seats</h3>
              <p style={styles.sectionContent}>This position has <strong>{positionConfig.totalSeats} seats</strong>. Top {positionConfig.totalSeats} candidates by votes will be elected.</p>
            </div>
          )}

          {positionConfig.electionType === 'single_winner' && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Election Type</h3>
              <p style={styles.sectionContent}>Single Winner - Only the candidate with the most votes wins this position.</p>
            </div>
          )}
        </div>

        <button style={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal: { background: 'white', borderRadius: '20px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto', position: 'relative' },
  closeBtn: { position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  header: { display: 'flex', gap: '20px', padding: '24px', background: 'linear-gradient(135deg, #2563EB, #1e40af)', color: 'white', borderTopLeftRadius: '20px', borderTopRightRadius: '20px' },
  avatar: { flexShrink: 0 },
  avatarPlaceholder: { width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: '600' },
  avatarImg: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' },
  headerInfo: { flex: 1 },
  name: { fontSize: '24px', fontWeight: '700', marginBottom: '4px' },
  position: { fontSize: '14px', opacity: 0.9 },
  content: { padding: '24px' },
  sloganBox: { display: 'flex', gap: '12px', padding: '16px', background: '#eff6ff', borderRadius: '12px', marginBottom: '24px', alignItems: 'flex-start' },
  slogan: { margin: 0, fontSize: '16px', fontStyle: 'italic', color: '#1e40af', flex: 1 },
  section: { marginBottom: '24px' },
  sectionTitle: { fontSize: '16px', fontWeight: '600', color: '#0f172a', marginBottom: '12px' },
  sectionContent: { fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0 },
  allocationList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  allocationItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: '#f8fafc', borderRadius: '8px' },
  allocationRank: { fontWeight: '600', color: '#2563EB', minWidth: '50px' },
  allocationRole: { fontWeight: '500', color: '#1e293b', flex: 1 },
  allocationDesc: { fontSize: '12px', color: '#64748b' },
  infoNote: { fontSize: '12px', color: '#64748b', marginTop: '12px', padding: '8px', background: '#fef3c7', borderRadius: '8px' },
  closeButton: { width: 'calc(100% - 48px)', margin: '0 24px 24px 24px', padding: '12px', background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '500' }
};

export default CandidateDetailsModal;