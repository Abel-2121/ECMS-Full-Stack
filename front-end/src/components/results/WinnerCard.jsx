// components/results/WinnerCard.jsx
import React from 'react';
import { 
  FiAward, FiHeart, FiUser, 
  FiMapPin, FiFlag, FiMessageCircle
} from 'react-icons/fi';
import { FaCrown, FaTrophy, FaMedal } from 'react-icons/fa';

// ✅ FIXED: Use VITE_API_URL_UPLOAD for Vite project
const API_BASE_URL = import.meta.env.VITE_API_URL_UPLOAD || 'http://localhost:4001';

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Fix Windows backslashes to forward slashes
  let normalizedPath = imagePath.replace(/\\/g, '/');
  
  // Remove duplicate uploads prefix
  let cleanPath = normalizedPath;
  if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath;
  } else if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  return `${API_BASE_URL}/${cleanPath}`;
};

const WinnerCard = ({ winner, positionName, rank, electedRole }) => {

  console.log("WINNER ",winner)
  const getRankIcon = () => {
    if (rank === 1) return <FaTrophy size={28} color="#D23A01" />;
    if (rank === 2) return <FaMedal size={28} color="#9ca3af" />;
    if (rank === 3) return <FaMedal size={28} color="#cd7f32" />;
    return <FiAward size={28} color="#D23A01" />;
  };

  const getRankTitle = () => {
    if (rank === 1) return 'Gold Winner';
    if (rank === 2) return 'Silver Winner';
    if (rank === 3) return 'Bronze Winner';
    return `Rank #${rank}`;
  };

  const getRankColor = () => {
    if (rank === 1) return { bg: '#D23A0110', color: '#D23A01', border: '#D23A01' };
    if (rank === 2) return { bg: '#f1f5f9', color: '#4b5563', border: '#9ca3af' };
    if (rank === 3) return { bg: '#fef3c7', color: '#d97706', border: '#fbbf24' };
    return { bg: '#FEF3F0', color: '#D23A01', border: '#D23A01' };
  };
  
  const rankStyle = getRankColor();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth <= 768);

  // Get image URL for winner - ✅ FIXED: Use correct field name
  const photoPath = winner.campaignPhoto || winner.photoUrl || winner.userId?.photo;
  const winnerPhotoUrl = getImageUrl(photoPath);
  const winnerName = winner.candidateName || winner.name || 'Candidate';
  const winnerInitial = winnerName.charAt(0) || '?';

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{
      ...styles.card,
      marginBottom: isMobile ? '16px' : '24px'
    }}>
      {/* Left Border Accent - Hide on mobile */}
      {!isMobile && <div style={{ ...styles.accentBorder, background: rankStyle.border }} />}
      
      <div style={{
        ...styles.cardContent,
        flexDirection: isMobile ? 'column' : 'row',
        padding: isMobile ? '16px' : 'clamp(20px, 4vw, 28px)',
        gap: isMobile ? '16px' : 'clamp(24px, 5vw, 40px)'
      }}>
        {/* Rectangular Photo Section */}
        <div style={{
          ...styles.photoSection,
          width: isMobile ? '100%' : 'clamp(200px, 28vw, 280px)',
          marginBottom: isMobile ? '0' : '0'
        }}>
          <div style={styles.photoWrapper}>
            {winnerPhotoUrl ? (
              <img 
                src={winnerPhotoUrl}
                alt={winnerName} 
                style={{
                  ...styles.photoImg,
                  height: isMobile ? 'clamp(180px, 30vw, 220px)' : 'clamp(220px, 32vw, 300px)'
                }} 
                onError={(e) => {
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  if (parent) {
                    const placeholder = document.createElement('div');
                    placeholder.style.width = '100%';
                    placeholder.style.height = isMobile ? 'clamp(180px, 30vw, 220px)' : 'clamp(220px, 32vw, 300px)';
                    placeholder.style.background = 'linear-gradient(135deg, #D23A01, #b02e00)';
                    placeholder.style.display = 'flex';
                    placeholder.style.alignItems = 'center';
                    placeholder.style.justifyContent = 'center';
                    placeholder.style.fontSize = isMobile ? '36px' : '56px';
                    placeholder.style.fontWeight = '800';
                    placeholder.style.color = '#ffffff';
                    placeholder.style.fontFamily = "'Poppins', sans-serif";
                    placeholder.textContent = winnerInitial;
                    parent.appendChild(placeholder);
                    e.target.remove();
                  }
                }}
              />
            ) : (
              <div style={{
                ...styles.photoPlaceholder,
                height: isMobile ? 'clamp(180px, 30vw, 220px)' : 'clamp(220px, 32vw, 300px)'
              }}>
                <span style={{
                  ...styles.photoPlaceholderText,
                  fontSize: isMobile ? '36px' : '56px'
                }}>
                  {winnerInitial}
                </span>
              </div>
            )}
            <div style={{ 
              ...styles.rankBadge, 
              background: rankStyle.bg, 
              color: rankStyle.color,
              padding: isMobile ? '6px 10px' : '10px 14px',
              fontSize: isMobile ? '11px' : '13px',
              bottom: isMobile ? '10px' : '16px',
              left: isMobile ? '10px' : '16px',
              right: isMobile ? '10px' : '16px'
            }}>
              {getRankIcon()}
              <span>{getRankTitle()}</span>
            </div>
          </div>
        </div>

        {/* Winner Info Section */}
        <div style={styles.infoSection}>
          <div style={{
            ...styles.headerRow,
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'flex-start',
            marginBottom: isMobile ? '8px' : '16px',
            gap: isMobile ? '8px' : '16px'
          }}>
            <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
              <div style={{
                ...styles.positionBadge,
                fontSize: isMobile ? '11px' : '13px',
                padding: isMobile ? '4px 10px' : '6px 14px',
                marginBottom: isMobile ? '6px' : '10px'
              }}>
                <FiMapPin size={isMobile ? 10 : 12} /> {positionName}
              </div>
              <h2 style={{
                ...styles.candidateName,
                fontSize: isMobile ? '20px' : 'clamp(24px, 5vw, 32px)'
              }}>{winnerName}</h2>
            </div>
            <div style={{ 
              ...styles.crownBadge, 
              background: rankStyle.bg, 
              color: rankStyle.color,
              width: isMobile ? '44px' : '60px',
              height: isMobile ? '44px' : '60px'
            }}>
              <FaCrown size={isMobile ? 22 : 28} />
            </div>
          </div>

          {electedRole && (
            <div style={{ textAlign: isMobile ? 'center' : 'left', marginBottom: isMobile ? '8px' : '0' }}>
              <div style={{
                ...styles.roleBadge,
                fontSize: isMobile ? '11px' : '13px',
                padding: isMobile ? '4px 12px' : '6px 16px'
              }}>
                <FiFlag size={isMobile ? 10 : 12} /> {electedRole}
              </div>
            </div>
          )}

          <div style={{
            ...styles.statsRow,
            flexDirection: isMobile ? 'row' : 'row',
            textAlign: isMobile ? 'center' : 'left',
            padding: isMobile ? '10px 12px' : '18px 24px',
            gap: isMobile ? '8px' : '20px',
            marginBottom: isMobile ? '12px' : '20px'
          }}>
            <div style={styles.statCard}>
              <span style={{
                ...styles.statValue,
                fontSize: isMobile ? '16px' : 'clamp(22px, 4vw, 28px)'
              }}>{winner.votes?.toLocaleString() || 0}</span>
              <span style={{
                ...styles.statLabel,
                fontSize: isMobile ? '9px' : '11px'
              }}>Votes</span>
            </div>
            <div style={styles.statCard}>
              <span style={{
                ...styles.statValue,
                fontSize: isMobile ? '16px' : 'clamp(22px, 4vw, 28px)'
              }}>{winner.percentage || 0}%</span>
              <span style={{
                ...styles.statLabel,
                fontSize: isMobile ? '9px' : '11px'
              }}>Percentage</span>
            </div>
            <div style={styles.statCard}>
              <span style={{
                ...styles.statValue,
                fontSize: isMobile ? '16px' : 'clamp(22px, 4vw, 28px)'
              }}>#{rank}</span>
              <span style={{
                ...styles.statLabel,
                fontSize: isMobile ? '9px' : '11px'
              }}>Rank</span>
            </div>
          </div>

          {winner.slogan && (
            <div style={{
              ...styles.sloganSection,
              borderLeftColor: rankStyle.color,
              flexDirection: isMobile ? 'row' : 'row',
              textAlign: isMobile ? 'left' : 'left',
              padding: isMobile ? '8px 12px' : '14px 18px',
              gap: isMobile ? '8px' : '12px',
              marginBottom: isMobile ? '12px' : '20px'
            }}>
              <FiMessageCircle size={isMobile ? 14 : 18} style={styles.sloganIcon} />
              <span style={{
                ...styles.sloganText,
                fontSize: isMobile ? '12px' : '15px'
              }}>"{winner.slogan}"</span>
            </div>
          )}

          {winner.biography && (
            <div style={{ marginBottom: isMobile ? '12px' : '20px' }}>
              <h4 style={{
                ...styles.sectionTitle,
                fontSize: isMobile ? '12px' : '14px',
                marginBottom: isMobile ? '6px' : '10px'
              }}>
                <FiUser size={isMobile ? 12 : 14} /> About
              </h4>
              <p style={{
                ...styles.bioText,
                fontSize: isMobile ? '12px' : '14px',
                lineHeight: isMobile ? '1.4' : '1.6'
              }}>{winner.biography}</p>
            </div>
          )}

          {winner.manifesto && (
            <div style={{ marginTop: isMobile ? '6px' : '8px' }}>
              <h4 style={{
                ...styles.sectionTitle,
                fontSize: isMobile ? '12px' : '14px',
                marginBottom: isMobile ? '6px' : '10px'
              }}>
                <FiHeart size={isMobile ? 12 : 14} /> Vision
              </h4>
              <div style={{
                ...styles.manifestoBox,
                padding: isMobile ? '10px 12px' : '18px 20px'
              }}>
                <p style={{
                  ...styles.manifestoText,
                  fontSize: isMobile ? '12px' : '14px',
                  lineHeight: isMobile ? '1.5' : '1.7'
                }}>{winner.manifesto}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    position: 'relative',
    background: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e5e7eb',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    overflow: 'hidden'
  },
  accentBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '6px'
  },
  cardContent: {
    display: 'flex'
  },
  photoSection: {
    flexShrink: 0
  },
  photoWrapper: {
    position: 'relative',
    width: '100%',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    background: '#f8fafc'
  },
  photoImg: {
    width: '100%',
    objectFit: 'cover',
    display: 'block',
    transition: 'transform 0.3s ease'
  },
  photoPlaceholder: {
    width: '100%',
    background: 'linear-gradient(135deg, #D23A01, #b02e00)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  photoPlaceholderText: {
    fontWeight: '800',
    color: '#ffffff',
    
  },
  rankBadge: {
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    borderRadius: '40px',
    fontWeight: '700',
    backdropFilter: 'blur(10px)',
    
  },
  infoSection: {
    flex: 1,
    minWidth: '0'
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  },
  positionBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '600',
    color: '#D23A01',
    background: '#FEF3F0',
    borderRadius: '20px',
    width: 'fit-content',
    
  },
  candidateName: {
    fontWeight: '800',
    color: '#1a1a1a',
    margin: 0,
    lineHeight: '1.2',
    
  },
  crownBadge: {
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '600',
    color: '#023430',
    background: '#e8f5e9',
    borderRadius: '20px',
    
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    background: '#f8fafc',
    borderRadius: '12px',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  statCard: {
    flex: 1,
    textAlign: 'center'
  },
  statValue: {
    display: 'block',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '2px',
    
  },
  statLabel: {
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    
  },
  sloganSection: {
    display: 'flex',
    alignItems: 'center',
    background: '#FEF3F0',
    borderRadius: '12px',
    borderLeft: `4px solid #D23A01`
  },
  sloganIcon: {
    color: '#D23A01',
    flexShrink: 0
  },
  sloganText: {
    fontWeight: '600',
    color: '#D23A01',
    fontStyle: 'italic',
    
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '700',
    color: '#1a1a1a',
    
  },
  bioText: {
    color: '#4b5563',
    margin: 0,
    
  },
  manifestoBox: {
    background: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e5e7eb'
  },
  manifestoText: {
    color: '#1a1a1a',
    margin: 0,
    
  }
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .winner-photo-img:hover {
    transform: scale(1.02);
  }
  
  .winner-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  }
`;

if (!document.head.querySelector('#winner-card-styles')) {
  styleSheet.id = 'winner-card-styles';
  document.head.appendChild(styleSheet);
}

export default WinnerCard;