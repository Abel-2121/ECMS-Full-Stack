
// components/monitoring/PositionLeaderboard.jsx
import React, { useState, useMemo } from 'react';
import { FiAward, FiUser, FiTrendingUp, FiBarChart2, FiChevronDown, FiStar, FiUsers } from 'react-icons/fi';
import { FaTrophy } from 'react-icons/fa';

// API base URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL_UPLOAD || 'http://localhost:4001';

// Helper function to get full image URL - Fixed for Windows paths
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Fix Windows backslashes to forward slashes
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
  
  return `${API_BASE_URL}/${normalizedPath}`;
};

const PositionLeaderboard = ({ position }) => {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  const { totalVotes, sortedCandidates } = useMemo(() => {
    if (!position?.candidates) return { totalVotes: 0, sortedCandidates: [] };
    const total = position.candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
    const sorted = [...position.candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    
    // Process image URLs
    const processedCandidates = sorted.map(candidate => ({
      ...candidate,
      processedPhotoUrl: getImageUrl(candidate.campaignPhoto || candidate.photoUrl || candidate.userId?.photo)
    }));
    
    return { totalVotes: total, sortedCandidates: processedCandidates };
  }, [position]);

  const handleImageError = (candidateId) => {
    setImageErrors(prev => ({ ...prev, [candidateId]: true }));
  };

  if (!sortedCandidates.length) {
    return (
      <div style={styles.emptyCard}>
        <FiBarChart2 size={48} style={styles.emptyIcon} />
        <h3 style={styles.emptyTitle}>No candidates available</h3>
        <p style={styles.emptySubtext}>Check back later for election updates.</p>
      </div>
    );
  }

  const visibleCandidates = showAll ? sortedCandidates : sortedCandidates.slice(0, 5);
  const voteLabel = 'votes';

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header} onClick={() => setExpanded(!expanded)}>
        <div style={styles.headerLeft}>
          <div style={styles.iconBox}>
            {position.electionType === 'single_winner' ? <FaTrophy size={24} /> : <FiUsers size={24} />}
          </div>
          <div>
            <h3 style={styles.positionTitle}>{position.positionName}</h3>
            <div style={styles.metaRow}>
              <span style={styles.badge}>{position.electionType?.replace('_', ' ') || 'Single Winner'}</span>
              <span style={styles.candidateCount}>
                <FiUser size={14} /> {position.candidates.length} Candidates
              </span>
            </div>
          </div>
        </div>

        <div style={styles.headerRight}>
          <div style={styles.totalStats}>
            <div style={styles.totalValue}>{totalVotes.toLocaleString()}</div>
            <div style={styles.totalLabel}>TOTAL {voteLabel.toUpperCase()}</div>
          </div>
          <div style={{ ...styles.chevron, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <FiChevronDown size={22} />
          </div>
        </div>
      </div>

      {expanded && (
        <div style={styles.content}>
          <div style={styles.list}>
            {visibleCandidates.map((candidate, index) => (
              <CandidateRow 
                key={candidate.candidateId || index}
                candidate={candidate}
                index={index}
                totalVotes={totalVotes}
                voteLabel={voteLabel}
                isWinner={index < (position.totalSeats || 1)}
                onImageError={handleImageError}
                imageError={imageErrors[candidate.candidateId]}
              />
            ))}
          </div>

          {sortedCandidates.length > 5 && (
            <button style={styles.viewMoreBtn} onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Show Top 5' : `View All ${sortedCandidates.length} Candidates`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const CandidateRow = ({ candidate, index, totalVotes, voteLabel, isWinner, onImageError, imageError }) => {
  const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0;
  const isLeading = index === 0 && candidate.votes > 0;
  
  // Get candidate name
  const candidateName = candidate.candidateName || 
    (candidate.userId?.firstName && candidate.userId?.lastName 
      ? `${candidate.userId.firstName} ${candidate.userId.lastName}`
      : 'Candidate');
  
  // Get initials for fallback
  const initials = candidateName.charAt(0) || '?';
  
  // Check if photo should be shown
  const hasPhoto = candidate.processedPhotoUrl && !imageError;

  return (
    <div style={{ 
      ...styles.candidateRow, 
      borderColor: isWinner ? '#D23A0120' : '#e5e7eb',
      background: isWinner ? '#D23A0110' : '#f8fafc'
    }}>
      <div style={styles.rowMain}>
        <div style={{ 
          ...styles.rankBox, 
          background: isLeading ? '#D23A0110' : '#e5e7eb',
          color: isLeading ? '#D23A01' : '#6b7280'
        }}>
          {isLeading ? <FiStar size={14} /> : index + 1}
        </div>

        <div style={styles.avatarContainer}>
          {hasPhoto ? (
            <img 
              src={candidate.processedPhotoUrl} 
              style={styles.avatar} 
              alt={candidateName}
              onError={() => onImageError(candidate.candidateId)}
            />
          ) : (
            <div style={styles.avatarPlaceholder}>{initials}</div>
          )}
          {isWinner && <div style={styles.winnerDot}><FiAward size={10} /></div>}
        </div>

        <div style={styles.candidateInfo}>
          <div style={styles.nameRow}>
            <span style={styles.name}>{candidateName}</span>
            {isLeading && <span style={styles.leadingBadge}>LEADING</span>}
          </div>
          <div style={styles.party}>{candidate.party || 'Independent Candidate'}</div>
        </div>

        <div style={styles.voteBox}>
          <div style={styles.voteValue}>{candidate.votes?.toLocaleString()} <span style={styles.voteUnit}>{voteLabel}</span></div>
          <div style={styles.votePercent}>{percentage}%</div>
        </div>
      </div>

      <div style={styles.miniProgressTrack}>
        <div style={{ 
          ...styles.miniProgressFill, 
          width: `${percentage}%`,
          background: isLeading ? '#D23A01' : '#023430'
        }} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '20px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    fontFamily: "'Poppins', sans-serif"
  },
  header: {
    padding: '18px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e5e7eb',
    flexWrap: 'wrap',
    gap: '16px'
  },
  headerLeft: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 'clamp(12px, 3vw, 16px)' 
  },
  iconBox: {
    width: 'clamp(40px, 8vw, 48px)',
    height: 'clamp(40px, 8vw, 48px)',
    backgroundColor: '#D23A01',
    borderRadius: 'clamp(10px, 2.5vw, 12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff'
  },
  positionTitle: { 
    margin: 0, 
    fontSize: 'clamp(16px, 4vw, 18px)', 
    fontWeight: '800', 
    color: '#1a1a1a' 
  },
  metaRow: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    marginTop: '6px',
    flexWrap: 'wrap' 
  },
  badge: { 
    padding: '3px 10px', 
    backgroundColor: '#D23A0110', 
    color: '#D23A01', 
    borderRadius: '20px', 
    fontSize: 'clamp(10px, 2.5vw, 11px)', 
    fontWeight: '700', 
    textTransform: 'uppercase' 
  },
  candidateCount: { 
    fontSize: 'clamp(12px, 3vw, 13px)', 
    color: '#6b7280', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    fontWeight: '500' 
  },
  headerRight: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 'clamp(12px, 3vw, 20px)' 
  },
  totalStats: { 
    textAlign: 'right' 
  },
  totalValue: { 
    fontSize: 'clamp(18px, 4vw, 22px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    lineHeight: 1 
  },
  totalLabel: { 
    fontSize: 'clamp(8px, 2vw, 9px)', 
    fontWeight: '700', 
    color: '#9ca3af', 
    marginTop: '4px', 
    letterSpacing: '0.05em' 
  },
  chevron: { 
    color: '#9ca3af', 
    transition: 'transform 0.3s ease' 
  },
  content: { 
    padding: 'clamp(16px, 4vw, 20px) clamp(16px, 4vw, 24px)', 
    borderTop: '1px solid #e5e7eb' 
  },
  list: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px' 
  },
  candidateRow: {
    padding: 'clamp(10px, 2.5vw, 14px)',
    borderRadius: '14px',
    border: '1px solid',
    transition: 'all 0.2s ease'
  },
  rowMain: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: 'clamp(10px, 2.5vw, 14px)',
    flexWrap: 'wrap'
  },
  rankBox: { 
    width: 'clamp(28px, 6vw, 32px)', 
    height: 'clamp(28px, 6vw, 32px)', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontSize: 'clamp(12px, 3vw, 14px)', 
    fontWeight: '800', 
    flexShrink: 0 
  },
  avatarContainer: { 
    position: 'relative' 
  },
  avatar: { 
    width: 'clamp(40px, 8vw, 48px)', 
    height: 'clamp(40px, 8vw, 48px)', 
    borderRadius: '50%', 
    objectFit: 'cover', 
    border: '2px solid #fff', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
  },
  avatarPlaceholder: { 
    width: 'clamp(40px, 8vw, 48px)', 
    height: 'clamp(40px, 8vw, 48px)', 
    borderRadius: '50%', 
    backgroundColor: '#D23A01', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    fontWeight: '700', 
    color: '#fff', 
    fontSize: 'clamp(16px, 3.5vw, 18px)' 
  },
  winnerDot: { 
    position: 'absolute', 
    top: '-2px', 
    right: '-2px', 
    width: 'clamp(16px, 3.5vw, 18px)', 
    height: 'clamp(16px, 3.5vw, 18px)', 
    backgroundColor: '#023430', 
    borderRadius: '50%', 
    color: '#fff', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    border: '2px solid #fff' 
  },
  candidateInfo: { 
    flexGrow: 1, 
    minWidth: 'clamp(120px, 30vw, 200px)' 
  },
  nameRow: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    flexWrap: 'wrap' 
  },
  name: { 
    fontWeight: '800', 
    color: '#1a1a1a', 
    fontSize: 'clamp(14px, 3.5vw, 16px)' 
  },
  leadingBadge: { 
    fontSize: 'clamp(8px, 2vw, 9px)', 
    fontWeight: '800', 
    backgroundColor: '#D23A0110', 
    color: '#D23A01', 
    padding: '2px 8px', 
    borderRadius: '12px' 
  },
  party: { 
    fontSize: 'clamp(11px, 2.5vw, 12px)', 
    color: '#6b7280', 
    marginTop: '2px', 
    fontWeight: '500' 
  },
  voteBox: { 
    textAlign: 'right',
    minWidth: 'clamp(70px, 15vw, 90px)'
  },
  voteValue: { 
    fontSize: 'clamp(14px, 3.5vw, 18px)', 
    fontWeight: '800', 
    color: '#1a1a1a' 
  },
  voteUnit: { 
    fontSize: 'clamp(9px, 2.5vw, 11px)', 
    color: '#9ca3af', 
    fontWeight: '500' 
  },
  votePercent: { 
    fontSize: 'clamp(12px, 3vw, 14px)', 
    fontWeight: '800', 
    color: '#D23A01', 
    marginTop: '2px' 
  },
  miniProgressTrack: { 
    height: '4px', 
    backgroundColor: '#e5e7eb', 
    borderRadius: '2px', 
    marginTop: '12px', 
    overflow: 'hidden' 
  },
  miniProgressFill: { 
    height: '100%', 
    borderRadius: '2px', 
    transition: 'width 1s ease' 
  },
  viewMoreBtn: { 
    width: '100%', 
    padding: 'clamp(12px, 3vw, 14px)', 
    marginTop: '16px', 
    border: 'none', 
    background: 'none', 
    color: '#D23A01', 
    fontSize: 'clamp(12px, 3vw, 13px)', 
    fontWeight: '700', 
    cursor: 'pointer', 
    borderTop: '1px solid #e5e7eb',
    fontFamily: "'Poppins', sans-serif"
  },
  emptyCard: { 
    padding: 'clamp(32px, 8vw, 48px) clamp(16px, 4vw, 20px)', 
    textAlign: 'center', 
    backgroundColor: '#f8fafc', 
    borderRadius: '20px', 
    border: '1px solid #e5e7eb' 
  },
  emptyIcon: { 
    marginBottom: '16px', 
    color: '#9ca3af' 
  },
  emptyTitle: { 
    fontSize: 'clamp(16px, 4vw, 18px)', 
    fontWeight: '700', 
    color: '#4b5563', 
    margin: '0 0 8px 0',
    fontFamily: "'Poppins', sans-serif"
  },
  emptySubtext: { 
    fontSize: 'clamp(12px, 3vw, 13px)', 
    color: '#9ca3af', 
    margin: 0,
    fontFamily: "'Poppins', sans-serif"
  }
};

export default PositionLeaderboard;







// // components/monitoring/PositionLeaderboard.jsx
// import React, { useState, useMemo } from 'react';
// import { FiAward, FiUser, FiTrendingUp, FiBarChart2, FiChevronDown, FiStar, FiUsers } from 'react-icons/fi';
// import {FaTrophy } from 'react-icons/fa';

// const PositionLeaderboard = ({ position }) => {
//   const [expanded, setExpanded] = useState(true);
//   const [showAll, setShowAll] = useState(false);

//   const { totalVotes, sortedCandidates } = useMemo(() => {
//     if (!position?.candidates) return { totalVotes: 0, sortedCandidates: [] };
//     const total = position.candidates.reduce((sum, c) => sum + (c.votes || 0), 0);
//     const sorted = [...position.candidates].sort((a, b) => (b.votes || 0) - (a.votes || 0));
//     return { totalVotes: total, sortedCandidates: sorted };
//   }, [position]);

//   if (!sortedCandidates.length) {
//     return (
//       <div style={styles.emptyCard}>
//         <FiBarChart2 size={48} style={styles.emptyIcon} />
//         <h3 style={styles.emptyTitle}>No candidates available</h3>
//         <p style={styles.emptySubtext}>Check back later for election updates.</p>
//       </div>
//     );
//   }

//   const visibleCandidates = showAll ? sortedCandidates : sortedCandidates.slice(0, 5);
//   const voteLabel = 'votes';

//   return (
//     <div style={styles.container}>
//       {/* Header */}
//       <div style={styles.header} onClick={() => setExpanded(!expanded)}>
//         <div style={styles.headerLeft}>
//           <div style={styles.iconBox}>
//             {position.electionType === 'single_winner' ? <FaTrophy size={24} /> : <FiUsers size={24} />}
//           </div>
//           <div>
//             <h3 style={styles.positionTitle}>{position.positionName}</h3>
//             <div style={styles.metaRow}>
//               <span style={styles.badge}>{position.electionType?.replace('_', ' ') || 'Single Winner'}</span>
//               <span style={styles.candidateCount}>
//                 <FiUser size={14} /> {position.candidates.length} Candidates
//               </span>
//             </div>
//           </div>
//         </div>

//         <div style={styles.headerRight}>
//           <div style={styles.totalStats}>
//             <div style={styles.totalValue}>{totalVotes.toLocaleString()}</div>
//             <div style={styles.totalLabel}>TOTAL {voteLabel.toUpperCase()}</div>
//           </div>
//           <div style={{ ...styles.chevron, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
//             <FiChevronDown size={22} />
//           </div>
//         </div>
//       </div>

//       {expanded && (
//         <div style={styles.content}>
//           <div style={styles.list}>
//             {visibleCandidates.map((candidate, index) => (
//               <CandidateRow 
//                 key={candidate.candidateId || index}
//                 candidate={candidate}
//                 index={index}
//                 totalVotes={totalVotes}
//                 voteLabel={voteLabel}
//                 isWinner={index < (position.totalSeats || 1)}
//               />
//             ))}
//           </div>

//           {sortedCandidates.length > 5 && (
//             <button style={styles.viewMoreBtn} onClick={() => setShowAll(!showAll)}>
//               {showAll ? 'Show Top 5' : `View All ${sortedCandidates.length} Candidates`}
//             </button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// const CandidateRow = ({ candidate, index, totalVotes, voteLabel, isWinner }) => {
//   const percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0;
//   const isLeading = index === 0 && candidate.votes > 0;

//   return (
//     <div style={{ 
//       ...styles.candidateRow, 
//       borderColor: isWinner ? '#D23A0120' : '#e5e7eb',
//       background: isWinner ? '#D23A0110' : '#f8fafc'
//     }}>
//       <div style={styles.rowMain}>
//         <div style={{ 
//           ...styles.rankBox, 
//           background: isLeading ? '#D23A0110' : '#e5e7eb',
//           color: isLeading ? '#D23A01' : '#6b7280'
//         }}>
//           {isLeading ? <FiStar size={14} /> : index + 1}
//         </div>

//         <div style={styles.avatarContainer}>
//           {candidate.photoUrl ? (
//             <img src={candidate.photoUrl} style={styles.avatar} alt="" />
//           ) : (
//             <div style={styles.avatarPlaceholder}>{candidate.candidateName?.charAt(0)}</div>
//           )}
//           {isWinner && <div style={styles.winnerDot}><FiAward size={10} /></div>}
//         </div>

//         <div style={styles.candidateInfo}>
//           <div style={styles.nameRow}>
//             <span style={styles.name}>{candidate.candidateName}</span>
//             {isLeading && <span style={styles.leadingBadge}>LEADING</span>}
//           </div>
//           <div style={styles.party}>{candidate.party || 'Independent Candidate'}</div>
//         </div>

//         <div style={styles.voteBox}>
//           <div style={styles.voteValue}>{candidate.votes?.toLocaleString()} <span style={styles.voteUnit}>{voteLabel}</span></div>
//           <div style={styles.votePercent}>{percentage}%</div>
//         </div>
//       </div>

//       <div style={styles.miniProgressTrack}>
//         <div style={{ 
//           ...styles.miniProgressFill, 
//           width: `${percentage}%`,
//           background: isLeading ? '#D23A01' : '#023430'
//         }} />
//       </div>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     backgroundColor: '#fff',
//     borderRadius: '20px',
//     border: '1px solid #e5e7eb',
//     overflow: 'hidden',
//     boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
//     fontFamily: "'Poppins', sans-serif"
//   },
//   header: {
//     padding: '18px 24px',
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     cursor: 'pointer',
//     backgroundColor: '#f8fafc',
//     borderBottom: '1px solid #e5e7eb'
//   },
//   headerLeft: { 
//     display: 'flex', 
//     alignItems: 'center', 
//     gap: '16px' 
//   },
//   iconBox: {
//     width: '48px',
//     height: '48px',
//     backgroundColor: '#D23A01',
//     borderRadius: '12px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     color: '#fff'
//   },
//   positionTitle: { 
//     margin: 0, 
//     fontSize: '18px', 
//     fontWeight: '800', 
//     color: '#1a1a1a' 
//   },
//   metaRow: { 
//     display: 'flex', 
//     alignItems: 'center', 
//     gap: '10px', 
//     marginTop: '6px' 
//   },
//   badge: { 
//     padding: '3px 10px', 
//     backgroundColor: '#D23A0110', 
//     color: '#D23A01', 
//     borderRadius: '20px', 
//     fontSize: '11px', 
//     fontWeight: '700', 
//     textTransform: 'uppercase' 
//   },
//   candidateCount: { 
//     fontSize: '13px', 
//     color: '#6b7280', 
//     display: 'flex', 
//     alignItems: 'center', 
//     gap: '6px', 
//     fontWeight: '500' 
//   },
//   headerRight: { 
//     display: 'flex', 
//     alignItems: 'center', 
//     gap: '20px' 
//   },
//   totalStats: { 
//     textAlign: 'right' 
//   },
//   totalValue: { 
//     fontSize: '22px', 
//     fontWeight: '800', 
//     color: '#1a1a1a', 
//     lineHeight: 1 
//   },
//   totalLabel: { 
//     fontSize: '9px', 
//     fontWeight: '700', 
//     color: '#9ca3af', 
//     marginTop: '4px', 
//     letterSpacing: '0.05em' 
//   },
//   chevron: { 
//     color: '#9ca3af', 
//     transition: 'transform 0.3s ease' 
//   },
//   content: { 
//     padding: '20px 24px', 
//     borderTop: '1px solid #e5e7eb' 
//   },
//   list: { 
//     display: 'flex', 
//     flexDirection: 'column', 
//     gap: '12px' 
//   },
//   candidateRow: {
//     padding: '14px',
//     borderRadius: '14px',
//     border: '1px solid',
//     transition: 'all 0.2s ease'
//   },
//   rowMain: { 
//     display: 'flex', 
//     alignItems: 'center', 
//     gap: '14px' 
//   },
//   rankBox: { 
//     width: '32px', 
//     height: '32px', 
//     borderRadius: '50%', 
//     display: 'flex', 
//     alignItems: 'center', 
//     justifyContent: 'center', 
//     fontSize: '14px', 
//     fontWeight: '800', 
//     flexShrink: 0 
//   },
//   avatarContainer: { 
//     position: 'relative' 
//   },
//   avatar: { 
//     width: '48px', 
//     height: '48px', 
//     borderRadius: '50%', 
//     objectFit: 'cover', 
//     border: '2px solid #fff', 
//     boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
//   },
//   avatarPlaceholder: { 
//     width: '48px', 
//     height: '48px', 
//     borderRadius: '50%', 
//     backgroundColor: '#D23A01', 
//     display: 'flex', 
//     alignItems: 'center', 
//     justifyContent: 'center', 
//     fontWeight: '700', 
//     color: '#fff', 
//     fontSize: '18px' 
//   },
//   winnerDot: { 
//     position: 'absolute', 
//     top: '-2px', 
//     right: '-2px', 
//     width: '18px', 
//     height: '18px', 
//     backgroundColor: '#023430', 
//     borderRadius: '50%', 
//     color: '#fff', 
//     display: 'flex', 
//     alignItems: 'center', 
//     justifyContent: 'center', 
//     border: '2px solid #fff' 
//   },
//   candidateInfo: { 
//     flexGrow: 1, 
//     minWidth: 0 
//   },
//   nameRow: { 
//     display: 'flex', 
//     alignItems: 'center', 
//     gap: '8px', 
//     flexWrap: 'wrap' 
//   },
//   name: { 
//     fontWeight: '800', 
//     color: '#1a1a1a', 
//     fontSize: '16px' 
//   },
//   leadingBadge: { 
//     fontSize: '9px', 
//     fontWeight: '800', 
//     backgroundColor: '#D23A0110', 
//     color: '#D23A01', 
//     padding: '2px 8px', 
//     borderRadius: '12px' 
//   },
//   party: { 
//     fontSize: '12px', 
//     color: '#6b7280', 
//     marginTop: '2px', 
//     fontWeight: '500' 
//   },
//   voteBox: { 
//     textAlign: 'right' 
//   },
//   voteValue: { 
//     fontSize: '18px', 
//     fontWeight: '800', 
//     color: '#1a1a1a' 
//   },
//   voteUnit: { 
//     fontSize: '11px', 
//     color: '#9ca3af', 
//     fontWeight: '500' 
//   },
//   votePercent: { 
//     fontSize: '14px', 
//     fontWeight: '800', 
//     color: '#D23A01', 
//     marginTop: '2px' 
//   },
//   miniProgressTrack: { 
//     height: '4px', 
//     backgroundColor: '#e5e7eb', 
//     borderRadius: '2px', 
//     marginTop: '12px', 
//     overflow: 'hidden' 
//   },
//   miniProgressFill: { 
//     height: '100%', 
//     borderRadius: '2px', 
//     transition: 'width 1s ease' 
//   },
//   viewMoreBtn: { 
//     width: '100%', 
//     padding: '14px', 
//     marginTop: '16px', 
//     border: 'none', 
//     background: 'none', 
//     color: '#D23A01', 
//     fontSize: '13px', 
//     fontWeight: '700', 
//     cursor: 'pointer', 
//     borderTop: '1px solid #e5e7eb',
//     fontFamily: "'Poppins', sans-serif"
//   },
//   emptyCard: { 
//     padding: '48px 20px', 
//     textAlign: 'center', 
//     backgroundColor: '#f8fafc', 
//     borderRadius: '20px', 
//     border: '1px solid #e5e7eb' 
//   },
//   emptyIcon: { 
//     marginBottom: '16px', 
//     color: '#9ca3af' 
//   },
//   emptyTitle: { 
//     fontSize: '18px', 
//     fontWeight: '700', 
//     color: '#4b5563', 
//     margin: '0 0 8px 0',
//     fontFamily: "'Poppins', sans-serif"
//   },
//   emptySubtext: { 
//     fontSize: '13px', 
//     color: '#9ca3af', 
//     margin: 0,
//     fontFamily: "'Poppins', sans-serif"
//   }
// };

// export default PositionLeaderboard;