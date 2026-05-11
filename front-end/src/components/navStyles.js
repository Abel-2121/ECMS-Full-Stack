// constants/navStyles.js
export const navStyles = {
  // Colors
  primary: '#D23A01',
  secondary: '#023430',
  
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    transition: 'all 0.3s ease'
  },
  
  navContainer: {
    maxWidth: '90vw',
    margin: '0 auto',
    padding: 'clamp(10px, 2.5vw, 14px) clamp(16px, 5vw, 32px)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 'clamp(60px, 6vh, 68px)',
    gap: 'clamp(16px, 3vw, 32px)',
    cursor: 'pointer'
  },
  
  logo: {
    fontSize: 'clamp(18px, 5vw, 22px)',
    fontWeight: '800',
    color: '#D23A01',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  
  logoIcon: {
    fontSize: 'clamp(20px, 5vw, 24px)'
  },
  
  desktopMenu: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'clamp(8px, 1.5vw, 16px)',
    flex: 1
  },
  
  navLink: {
    fontSize: 'clamp(15px, 4vw, 16px)',
    fontWeight: '700',
    color: '#4B5563',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  
  activeNavLink: {
    color: '#D23A01',
    fontWeight: '600'
  },
  
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 'clamp(12px, 2.5vw, 20px)',
    flexShrink: 0
  },
  
  mobileToggle: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#1F2937',
    padding: '8px',
    borderRadius: '8px',
    fontSize: '22px',
    transition: 'background 0.2s ease'
  },
  
  mobileMenu: {
    position: 'fixed',
    top: 'clamp(60px, 8vh, 68px)',
    left: 0,
    right: 0,
    background: '#ffffff',
    padding: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    zIndex: 999,
    borderTop: '1px solid #E5E7EB',
    maxHeight: 'calc(100vh - 70px)',
    overflowY: 'auto'
  },
  
  mobileNavLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#4B5563',
    textDecoration: 'none',
    padding: '12px 16px',
    borderRadius: '10px',
    transition: 'all 0.2s ease'
  },
  
  mobileActiveNavLink: {
    color: '#D23A01',
    fontWeight: '600'
  }
};