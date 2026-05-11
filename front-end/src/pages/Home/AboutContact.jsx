// components/home/AboutContact.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiArrowRight, FiMapPin, FiShield, FiUsers, FiCheckSquare, FiBarChart2 } from 'react-icons/fi';

const iconMap = {
  FiShield: <FiShield size={24} />,
  FiUsers: <FiUsers size={24} />,
  FiCheckSquare: <FiCheckSquare size={24} />,
  FiBarChart2: <FiBarChart2 size={24} />
};

const splitIntoParagraphs = (text) => {
  if (!text) return [];

  const sentences = text.split(/(?<=[.!?])\s+/);
  if (sentences.length <= 2) return [text];
  
  // Calculate total words
  const totalWords = text.split(/\s+/).length;
  
  if (totalWords < 30) return [text];
  const targetRatio = 0.5;
  let splitIndex = Math.floor(sentences.length * targetRatio);

  const minSentences = Math.floor(sentences.length * 0.3);
  const maxSentences = Math.floor(sentences.length * 0.7);
  
  if (splitIndex < minSentences) splitIndex = minSentences;
  if (splitIndex > maxSentences) splitIndex = maxSentences;
  
  // Split into two paragraphs
  const firstPara = sentences.slice(0, splitIndex).join(' ');
  const secondPara = sentences.slice(splitIndex).join(' ');
  
  const secondParaWords = secondPara.split(/\s+/).length;
  if (secondParaWords < 15 && sentences.length > 3) {
    const betterSplit = Math.floor(sentences.length * 0.6);
    const newFirstPara = sentences.slice(0, betterSplit).join(' ');
    const newSecondPara = sentences.slice(betterSplit).join(' ');
    return [newFirstPara, newSecondPara];
  }
  
  return [firstPara, secondPara];
};

const AboutContact = ({ data, footer }) => {
 
  const aboutData = data || {
    description: 'ECMS (Election Control & Management System) is a cutting-edge platform designed to revolutionize how institutions conduct elections. Built with security, transparency, and ease-of-use at its core. Our system handles everything from voter registration to real-time result publication, making election management effortless and trustworthy.',
    features: [
      { title: 'Secure Elections', description: 'End-to-end encrypted voting system with complete audit trails.', icon: 'FiShield' },
      { title: 'Role Management', description: 'SuperAdmin, ElectionAdmin, Candidate, and Voter roles with permissions.', icon: 'FiUsers' },
      { title: 'Easy Voting', description: 'Simple, intuitive interface for voters to cast their ballots.', icon: 'FiCheckSquare' },
      { title: 'Real-time Results', description: 'Live vote tracking and instant result publication.', icon: 'FiBarChart2' }
    ],
    ctaTitle: 'Ready to get started?',
    ctaText: 'Join thousands of institutions already using ECMS for their elections.',
    ctaButtonText: 'Create Free Account',
    contactEmail: 'support@ecms.com',
    contactPhone: '+1 (555) 123-4567',
    contactAddress: '123 Election St, Democracy City, 12345'
  };

  const footerData = footer || {
    copyright: `© ${new Date().getFullYear()} ECMS. All rights reserved.`,
    links: [
      { label: 'Privacy', path: '/privacy' },
      { label: 'Terms', path: '/terms' },
      { label: 'Contact', path: '/contact' },
      { label: 'FAQ', path: '/faq' }
    ]
  };

  // Split description into balanced paragraphs
  const descriptionParagraphs = splitIntoParagraphs(aboutData.description);

  const styles = {
    section: {
      padding: 'clamp(40px, 6vw, 80px) clamp(16px, 4vw, 40px)',
      background: '#ffffff',
      width: '100%',
      overflowX: 'hidden'
    },
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      width: '100%'
    },
    aboutWrapper: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 'clamp(30px, 5vw, 50px)',
      marginBottom: 'clamp(40px, 6vw, 60px)'
    },
    aboutTitle: {
      fontSize: 'clamp(24px, 5vw, 32px)',
      fontWeight: '700',
      color: '#000000',
      marginBottom: '16px',
      letterSpacing: '-0.02em'
    },
    aboutText: {
      fontSize: 'clamp(15px, 2.5vw, 16px)',
      color: '#000000',
      lineHeight: '1.6',
      fontWeight: '500',
      marginBottom: '20px'
    },
    highlightText: {
      color: '#D23A01',
      fontWeight: '700'
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '16px',
      marginTop: '24px'
    },
    featureItem: {
      padding: '18px',
      background: '#f8fafc',
      borderRadius: '14px',
      transition: 'transform 0.3s ease',
      cursor: 'pointer'
    },
    featureIcon: {
      color: '#D23A01',
      marginBottom: '12px'
    },
    featureTitle: {
      fontSize: 'clamp(15px, 3vw, 16px)',
      fontWeight: '700',
      color: '#D23A01',
      marginBottom: '8px',
    },
    featureDesc: {
      fontSize: 'clamp(13px, 2.5vw, 14px)',
      color: '#000000',
      lineHeight: '1.5',
      fontWeight: '500'
    },
    contactInfo: {
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
      background: '#023430',
      padding: 'clamp(24px, 5vw, 32px)',
      borderRadius: '20px',
      color: 'white',
      height: '80%',
      gap: 'clamp(16px, 3vw, 24px)',
      marginTop:"7vh"

    },
    contactTitle: {
      color: "white",
      fontSize: 'clamp(22px, 4vw, 26px)',
      fontWeight: '900',
      marginBottom: '20px'
    },
    contactItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      marginBottom: '18px',
      fontSize: 'clamp(13px, 2.5vw, 14px)',
      flexWrap: 'wrap'
    },
    ctaSection: {
      textAlign: 'center',
      marginTop: 'clamp(40px, 6vw, 60px)',
      padding: 'clamp(40px, 6vw, 60px) clamp(20px, 5vw, 40px)',
      background: 'linear-gradient(135deg, #D23A01 0%, #023430 100%)',
      borderRadius: '20px'
    },
    ctaTitle: {
      fontSize: 'clamp(24px, 5vw, 32px)',
      fontWeight: '700',
      color: 'white',
      marginBottom: '12px'
    },
    ctaText: {
      fontSize: 'clamp(13px, 2.5vw, 15px)',
      color: 'rgba(255,255,255,0.9)',
      marginBottom: '28px',
      maxWidth: '500px',
      marginLeft: 'auto',
      marginRight: 'auto'
    },
    ctaBtn: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      padding: 'clamp(12px, 2.5vw, 14px) clamp(28px, 5vw, 36px)',
      background: 'white',
      color: '#D23A01',
      textDecoration: 'none',
      borderRadius: '50px',
      fontSize: 'clamp(14px, 2.5vw, 15px)',
      fontWeight: '600',
      transition: 'all 0.3s ease'
    },
    footer: {
      textAlign: 'center',
      padding: 'clamp(24px, 4vw, 32px) clamp(16px, 4vw, 40px)',
      borderTop: '1px solid #e5e7eb',
      marginTop: 'clamp(32px, 5vw, 48px)'
    },
    footerText: {
      fontSize: 'clamp(11px, 2vw, 12px)',
      color: '#6b7280',
      marginBottom: '12px'
    },
    footerLinks: {
      display: 'flex',
      gap: 'clamp(16px, 4vw, 24px)',
      justifyContent: 'center',
      flexWrap: 'wrap'
    },
    footerLink: {
      color: '#6b7280',
      textDecoration: 'none',
      fontSize: 'clamp(11px, 2vw, 12px)',
      transition: 'color 0.2s ease'
    }
  };

  return (
    <div style={styles.section}>
      <div style={styles.container}>
        {/* About Section */}
        <div style={styles.aboutWrapper}>
          {/* Left Side - About Content */}
          <div>
            <h2 style={styles.aboutTitle}>
              Why Choose <span style={styles.highlightText}>ECMS?</span>
            </h2>
            
            {/* Dynamically rendered balanced paragraphs */}
            {descriptionParagraphs.map((paragraph, idx) => (
              <p key={idx} style={styles.aboutText}>
                {paragraph}
              </p>
            ))}
            
            <div style={styles.featuresGrid}>
              {aboutData.features?.map((feature, index) => (
                <div key={index} style={styles.featureItem}>
                  <div style={styles.featureIcon}>{iconMap[feature.icon]}</div>
                  <h4 style={styles.featureTitle}>{feature.title}</h4>
                  <p style={styles.featureDesc}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Contact Section */}
          <div>
            <div style={styles.contactInfo}>
              <h3 style={styles.contactTitle}>Get in Touch</h3>
              <div style={styles.contactItem}>
                <FiMail size={18} />
                <p>{aboutData.contactEmail}</p>
              </div>
              <div style={styles.contactItem}>
                <FiPhone size={18} />
                <p>{aboutData.contactPhone}</p>
              </div>
              <div style={styles.contactItem}>
                <FiMapPin size={18} />
                <p>{aboutData.contactAddress}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={styles.ctaSection}>
          <h2 style={styles.ctaTitle}>{aboutData.ctaTitle}</h2>
          <p style={styles.ctaText}>{aboutData.ctaText}</p>
          <Link 
            to="/register" 
            style={styles.ctaBtn}
            onMouseEnter={(e) => { 
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => { 
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {aboutData.ctaButtonText} <FiArrowRight size={16} />
          </Link>
        </div>

        {/* Footer */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>{footerData.copyright}</p>
          <div style={styles.footerLinks}>
            {footerData.links?.map((link, index) => (
              <Link 
                key={index} 
                to={link.path} 
                style={styles.footerLink}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#D23A01'; }} 
                onMouseLeave={(e) => { e.currentTarget.style.color = '#6b7280'; }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </footer>
      </div>

      {/* Mobile Responsive Styles */}
      <style>
        {`
          @media (max-width: 768px) {
            .feature-item {
              text-align: center;
            }
            .contact-item {
              justify-content: center;
              text-align: center;
            }
          }
          
          @media (max-width: 480px) {
            .feature-item {
              padding: 14px !important;
            }
            .contact-info {
              padding: 20px !important;
            }
            .cta-section {
              padding: 30px 20px !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default AboutContact;