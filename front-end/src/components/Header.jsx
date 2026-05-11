// components/Header.jsx - Complete fixed version with mobile user avatar and profile picture
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineBars3 } from "react-icons/hi2";
import { AiOutlineClose } from "react-icons/ai";
import { FaUserCircle, FaChevronDown, FaChevronUp, FaVoteYea } from "react-icons/fa";
import { FiLogOut, FiUser } from "react-icons/fi";
import { logout } from '../Js/auth-slice';
import { navStyles } from './navStyles';

function Header() {
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'superAdmin':
        return '/superAdmin/dashboard';
      case 'electionAdmin':
        return '/electionAdmin/dashboard';
      case 'candidate':
        return '/candidate/my-nominations';
      case 'voter':
      case 'user':
        return '/voter/elections';
      default:
        return '/';
    }
  };

  // Get dashboard label
  const getDashboardLabel = () => {
    if (!user) return 'Dashboard';
    
    switch (user.role) {
      case 'superAdmin':
        return 'Admin Panel';
      case 'electionAdmin':
        return 'My Dashboard';
      case 'candidate':
        return 'My Dashboard';
      case 'voter':
      case 'user':
        return 'My Dashboard';
      default:
        return 'Dashboard';
    }
  };

  // Get role badge info
  const getRoleBadge = () => {
    const roles = {
      superAdmin: { color: '#D23A01', label: 'Super Admin', bg: '#FEF3F0' },
      electionAdmin: { color: '#D23A01', label: 'Election Admin', bg: '#FEF3F0' },
      candidate: { color: '#D23A01', label: 'Candidate', bg: '#FEF3F0' },
      voter: { color: '#D23A01', label: 'Voter', bg: '#FEF3F0' },
      user: { color: '#D23A01', label: 'Voter', bg: '#FEF3F0' }
    };
    return roles[user?.role] || { color: '#D23A01', label: user?.role || 'User', bg: '#FEF3F0' };
  };

  // Get profile picture URL
  const getProfilePicture = () => {
    if (user?.photo) {
      // Check if photo is a full URL or relative path
      if (user.photo.startsWith('http')) {
        return user.photo;
      }
      
    }
    return null;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    const result = await dispatch(logout());
    if (result.meta.requestStatus === "fulfilled") {
      setMobileMenuOpen(false);
      setShowUserMenu(false);
      navigate("/");
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const goToProfile = () => {
    setMobileMenuOpen(false);
    navigate('/profile');
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };

  const getFullName = () => {
    if (!user) return 'User';
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
  };

  const roleBadge = getRoleBadge();
  const profilePicture = getProfilePicture();

  const navbarStyle = {
    ...navStyles.navbar,
    background: scrolled ? 'rgba(255, 255, 255, 0.98)' : '#ffffff',
    backdropFilter: scrolled ? 'blur(8px)' : 'none',
    boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.08)' : '0 1px 3px rgba(0, 0, 0, 0.05)'
  };

  const userAvatarStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: '#F3F4F6',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 12px 6px 8px',
    borderRadius: '40px',
    transition: 'all 0.2s ease'
  };

  // ✅ Desktop avatar circle with photo support
  const avatarCircleStyle = {
    width: 'clamp(32px, 6vw, 36px)',
    height: 'clamp(32px, 6vw, 36px)',
    borderRadius: '50%',
    background: '#023430',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: 'clamp(14px, 3.5vw, 16px)',
    overflow: 'hidden'
  };

  const avatarImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  const userNameStyle = {
    fontSize: 'clamp(12px, 3vw, 13px)',
    fontWeight: '600',
    color: '#1F2937',
    maxWidth: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    padding: "10px"
  };

  const dropdownMenuStyle = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    minWidth: '200px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    border: '1px solid #E5E7EB',
    overflow: 'hidden',
    zIndex: 100
  };

  const dropdownItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#4B5563',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    width: '100%',
    textAlign: 'left'
  };

  // ✅ Mobile menu user section styles with photo support
  const mobileUserSectionStyle = {
    padding: '16px',
    borderBottom: '1px solid #E5E7EB',
    marginBottom: '8px',
    backgroundColor: '#F8FAFC'
  };

  const mobileUserInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  // ✅ Mobile avatar with photo support
  const mobileUserAvatarStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#023430',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '20px',
    overflow: 'hidden'
  };

  const mobileAvatarImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  const mobileUserDetailsStyle = {
    flex: 1
  };

  const mobileUserNameStyle = {
    fontSize: '16px',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '4px'
  };

  const mobileUserRoleStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: roleBadge.color,
    background: roleBadge.bg,
    padding: '2px 10px',
    borderRadius: '20px',
    display: 'inline-block'
  };

  const mobileProfileBtnStyle = {
    width: '100%',
    padding: '12px',
    background: '#F1F5F9',
    color: '#1F2937',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  // ✅ Render avatar content (image or initials)
  const renderAvatarContent = (size = 'desktop') => {
    if (profilePicture) {
      return (
        <img 
          src={profilePicture} 
          alt={getFullName()}
          style={size === 'desktop' ? avatarImageStyle : mobileAvatarImageStyle}
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.innerHTML = getUserInitials();
          }}
        />
      );
    }
    return getUserInitials();
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .desktop-menu {
            display: none !important;
          }
          .mobile-toggle {
            display: flex !important;
          }
          
          /* Hide avatar on mobile */
          .desktop-avatar {
            display: none !important;
          }
        }
        
        @media (min-width: 769px) {
          .desktop-avatar {
            display: flex !important;
          }
        }
        
        .nav-link:hover {
          color: #D23A01 !important;
        }
        .user-avatar:hover {
          background: #E5E7EB;
        }
        .dropdown-item:hover {
          background: #F3F4F6;
          color: #D23A01;
        }
        .mobile-nav-link:hover {
          background: #F3F4F6;
          color: #D23A01;
        }
        .mobile-profile-btn:hover {
          background: #E5E7EB !important;
        }
        .mobile-logout-btn:hover {
          background: #FECACA !important;
        }
        /* Active link styling for react-scroll */
        .active-scroll-link {
          color: #D23A01 !important;
          font-weight: 600;
        }
        .active-mobile-scroll-link {
          color: #D23A01 !important;
          font-weight: 600;
          background: #FEF3F0 !important;
        }
      `}</style>

      <nav style={navbarStyle}>
        <div style={navStyles.navContainer}>
          {/* Logo - LEFT with Icon */}
          <NavLink to="/" style={navStyles.logo} end>
            <FaVoteYea style={navStyles.logoIcon} />
            ECMS
          </NavLink>

          {/* Nav Items - CENTER - Using react-scroll */}
          <div style={navStyles.desktopMenu} className="desktop-menu">
            <ScrollLink
              to="hero"
              spy={true}
              smooth={true}
              duration={500}
              offset={-70}
              activeClass="active-scroll-link"
              style={navStyles.navLink}
              className="nav-link"
            >
              Home
            </ScrollLink>
            <ScrollLink
              to="how-it-works"
              spy={true}
              smooth={true}
              duration={500}
              offset={-70}
              activeClass="active-scroll-link"
              style={navStyles.navLink}
              className="nav-link"
            >
              How It Works
            </ScrollLink>
            <ScrollLink
              to="about"
              spy={true}
              smooth={true}
              duration={500}
              offset={-70}
              activeClass="active-scroll-link"
              style={navStyles.navLink}
              className="nav-link"
            >
              About
            </ScrollLink>
          </div>

          {/* User Profile & Logout - RIGHT */}
          <div style={navStyles.rightSection}>
            {isAuthenticated ? (
              <>
                {/* Dashboard Link for Authenticated Users */}
                <NavLink 
                  to={getDashboardPath()} 
                  style={({ isActive }) => ({
                    ...navStyles.navLink,
                    color: 'black',
                    ...(isActive && { opacity: 0.9 })
                  })} 
                  className="nav-link"
                >
                  {getDashboardLabel()}
                </NavLink>
                
                {/* Desktop Avatar - hidden on mobile */}
                <div style={{ position: 'relative' }} className="desktop-avatar" ref={userMenuRef}>
                  <button
                    style={userAvatarStyle}
                    className="user-avatar"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div style={avatarCircleStyle}>
                      {renderAvatarContent('desktop')}
                    </div>
                    <div style={{ color: '#9CA3AF', fontSize: '12px', transition: 'transform 0.2s ease', transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      {showUserMenu ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                    </div>
                  </button>

                  {showUserMenu && (
                    <div style={dropdownMenuStyle}>
                      <p style={userNameStyle}>{getFullName()}</p>
                      <NavLink to="/profile" style={dropdownItemStyle} className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                        <FaUserCircle size={16} /> My Profile
                      </NavLink>
                      <div style={{ height: '1px', background: '#E5E7EB', margin: '4px 0' }} />
                      <button onClick={handleLogout} style={dropdownItemStyle} className="dropdown-item">
                        <FiLogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <NavLink to="/login" style={{ ...navStyles.navLink, color: '#D23A01' }} className="nav-link">
                Login
              </NavLink>
            )}

            <button
              onClick={toggleMobileMenu}
              style={navStyles.mobileToggle}
              className="mobile-toggle"
            >
              {mobileMenuOpen ? <AiOutlineClose size={22} /> : <HiOutlineBars3 size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - WITH USER AVATAR SECTION */}
        {mobileMenuOpen && (
          <div style={navStyles.mobileMenu}>
            {/* ✅ USER AVATAR SECTION AT TOP OF MOBILE MENU with photo support */}
            {isAuthenticated && (
              <div style={mobileUserSectionStyle}>
                <div style={mobileUserInfoStyle}>
                  <div style={mobileUserAvatarStyle}>
                    {profilePicture ? (
                      <img 
                        src={profilePicture} 
                        alt={getFullName()}
                        style={mobileAvatarImageStyle}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = getUserInitials();
                        }}
                      />
                    ) : (
                      getUserInitials()
                    )}
                  </div>
                  <div style={mobileUserDetailsStyle}>
                    <div style={mobileUserNameStyle}>{getFullName()}</div>
                    <div style={mobileUserRoleStyle}>{roleBadge.label}</div>
                  </div>
                </div>
              </div>
            )}

            <ScrollLink
              to="hero"
              spy={true}
              smooth={true}
              duration={500}
              offset={-70}
              activeClass="active-mobile-scroll-link"
              style={navStyles.mobileNavLink}
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </ScrollLink>
            <ScrollLink
              to="how-it-works"
              spy={true}
              smooth={true}
              duration={500}
              offset={-70}
              activeClass="active-mobile-scroll-link"
              style={navStyles.mobileNavLink}
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </ScrollLink>
            <ScrollLink
              to="about"
              spy={true}
              smooth={true}
              duration={500}
              offset={-70}
              activeClass="active-mobile-scroll-link"
              style={navStyles.mobileNavLink}
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </ScrollLink>
            
            {isAuthenticated ? (
              <>
                <NavLink
                  to={getDashboardPath()}
                  style={{ ...navStyles.mobileNavLink, background: '#D23A01', color: 'white', justifyContent: 'center', marginTop: '8px' }}
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {getDashboardLabel()}
                </NavLink>
                
                {/* Profile button with icon */}
                <button
                  onClick={goToProfile}
                  style={mobileProfileBtnStyle}
                  className="mobile-profile-btn"
                >
                  <FiUser size={16} /> My Profile
                </button>
                
                <button
                  onClick={handleLogout}
                  style={{ ...navStyles.mobileNavLink, color: '#DC2626', justifyContent: 'center', marginTop: '8px' }}
                  className="mobile-logout-btn"
                >
                  <FiLogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                style={{ ...navStyles.mobileNavLink, color: '#D23A01', justifyContent: 'center' }}
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </NavLink>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

export default Header;