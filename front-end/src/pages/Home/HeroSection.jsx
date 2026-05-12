


// components/home/HeroSection.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiArrowRight } from 'react-icons/fi';
import heroBg from '../../assets/Hero.png';

const HeroSection = ({ data }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [currentIndex, setCurrentIndex] = useState(0);
   //console.log("HERO DTA ",data)
  const heroData = data || {
    title: 'Election Control & Management System',
    subtitle: 'Secure, transparent, and efficient online voting platform for institutions and organizations worldwide.',
    stats: [
      { number: '500+', label: 'Organizations' },
      { number: '100K+', label: 'Voters Served' },
      { number: '99.9%', label: 'Satisfaction' }
    ],
    ctaButtonText: 'Register Institution',
    images: [{ url: heroBg }]
  };

  // Get all images
  const images = (heroData.images || []).filter(img => img.url);
  const hasMultipleImages = images.length > 1;

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (!hasMultipleImages) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [images.length, hasMultipleImages]);

  const currentImage = images[currentIndex] || { url: heroBg };

  const styles = {
    hero: {
      position: 'relative',
      minHeight: 'clamp(450px, 80vh, 650px)',
      display: 'flex',
      alignItems: 'center',
      overflow: 'hidden',
      backgroundImage: `url(${currentImage.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      transition: 'background-image 0.8s ease-in-out',
      width: '100%'
    },
  
    content: {
      position: 'relative',
      zIndex: 2,
      maxWidth: '1200px',
      margin: '0 auto',
      padding: 'clamp(10px, 1vw, 20px) clamp(16px, 4vw, 40px)',
      width: '100%'
    },
    titleWrapper: {
      maxWidth: '100%',
      textAlign: 'left'
    },
    title: {
      fontSize: 'clamp(28px, 6vw, 44px)',
      fontWeight: '800',
      color: '#000000',
      marginBottom: 'clamp(12px, 2vw, 16px)',
      lineHeight: '1.2',
      letterSpacing: '-0.02em'
    },
    highlight: {
      color: '#D23A01',
      display: 'inline-block'
    },
    subtitle: {
      fontSize: 'clamp(15px, 3vw, 18px)',
      color: '#000000',
      marginBottom: 'clamp(24px, 4vw, 32px)',
      lineHeight: '1.5',
      maxWidth: '550px',
      fontWeight: '600',
    },
    buttonGroup: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      marginBottom: 'clamp(32px, 5vw, 48px)'
    },
    primaryBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 28px)',
      background: '#D23A01',
      color: 'white',
      textDecoration: 'none',
      borderRadius: '50px',
      fontSize: 'clamp(13px, 3vw, 14px)',
      fontWeight: '600',
      transition: 'all 0.2s ease',
      border: 'none',
      cursor: 'pointer'
    },
    secondaryBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: 'clamp(10px, 2vw, 12px) clamp(20px, 4vw, 28px)',
      background: 'transparent',
      color: '#D23A01',
      textDecoration: 'none',
      borderRadius: '50px',
      fontSize: 'clamp(13px, 3vw, 14px)',
      fontWeight: '600',
      border: '1px solid #D23A01',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    },
    statsSection: {
      display: 'flex',
      gap: 'clamp(20px, 5vw, 40px)',
      flexWrap: 'wrap',
      borderTop: '1px solid rgba(255,255,255,0.2)',
      paddingTop: 'clamp(20px, 4vw, 28px)',
      justifyContent: 'flex-start'
    },
    statItem: {
      textAlign: 'left'
    },
    statNumber: {
      fontSize: 'clamp(20px, 4vw, 26px)',
      fontWeight: '800',
      color: '#D23A01',
      marginBottom: '4px'
    },
    statLabel: {
      fontSize: 'clamp(12px, 2vw, 14px)',
      color: '#000000',
      fontWeight: '600'
    },
    scrollIndicator: {
      position: 'absolute',
      bottom: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 2,
      animation: 'bounce 2s infinite',
      cursor: 'pointer',
      background: 'rgba(210, 58, 1, 0.1)',
      borderRadius: '50%',
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    dotsContainer: {
      position: 'absolute',
      bottom: '70px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '10px',
      zIndex: 2
    },
    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,0.5)',
      transition: 'all 0.3s ease'
    },
    dotActive: {
      width: '24px',
      borderRadius: '12px',
      backgroundColor: '#D23A01'
    }
  };

  const scrollToNext = () => {
    const nextSection = document.getElementById('how-it-works');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Split title using & to preserve original color
  const titleParts = heroData.title.split('&');
  const firstPart = titleParts[0];
  const lastPart = titleParts[1] || 'Management System';
  const highlightWord = lastPart.trim();

  return (
    <>
      <style>
        {`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% {
              transform: translateX(-50%) translateY(0);
            }
            40% {
              transform: translateX(-50%) translateY(-8px);
            }
            60% {
              transform: translateX(-50%) translateY(-4px);
            }
          }
          
          @media (max-width: 768px) {
            .hero-stats {
              justify-content: center;
            }
          }
          
          @media (max-width: 480px) {
            .hero-buttons {
              flex-direction: column;
              align-items: stretch;
            }
            .hero-buttons a {
              justify-content: center;
            }
            .hero-stats {
              justify-content: space-between;
              gap: 12px;
            }
            .hero-stat-item {
              text-align: center;
            }
          }
        `}
      </style>

      <div style={styles.hero}>
     
        
        <div style={styles.content}>
          <div style={styles.titleWrapper}>
            <h1 style={styles.title} className="hero-title">
              {firstPart} & <br className="hide-on-mobile" /> 
              <span style={styles.highlight}>{highlightWord}</span>
            </h1>
            
            <p style={styles.subtitle}>{heroData.subtitle}</p>

            <div style={styles.buttonGroup} className="hero-buttons">
            
                <Link to="/request-institution" style={styles.primaryBtn}>
                  {heroData.ctaButtonText} <FiArrowRight size={14} />
                </Link>
             
            </div>

            {/* Stats Section */}
            <div style={styles.statsSection} className="hero-stats">
              {heroData.stats?.map((stat, index) => (
                <div key={index} style={styles.statItem} className="hero-stat-item">
                  <div style={styles.statNumber}>{stat.number}</div>
                  <div style={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dot Indicators (only show if multiple images) */}
        {hasMultipleImages && (
          <div style={styles.dotsContainer}>
            {images.map((_, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.dot,
                  ...(currentIndex === idx ? styles.dotActive : {})
                }}
              />
            ))}
          </div>
        )}

        {/* Scroll Indicator */}
        <div style={styles.scrollIndicator} onClick={scrollToNext}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D23A01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>
    </>
  );
};

export default HeroSection;