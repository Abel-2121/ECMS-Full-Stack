// components/Navbar.jsx - Fixed with Profile picture in avatar
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineBars3 } from "react-icons/hi2";
import { AiOutlineClose } from "react-icons/ai";
import { FaUserCircle, FaChevronDown, FaChevronUp, FaVoteYea } from "react-icons/fa";
import { FiLogOut, FiUser } from "react-icons/fi";
import { logout } from '../Js/auth-slice';
import { navStyles } from './navStyles';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector(state => state.auth);
  const userRole = user?.role;

  // ✅ Get profile picture URL (added same as Header)
  const getProfilePicture = () => {
    if (user?.photo) {
      if (user.photo.startsWith('http')) {
        return user.photo;
      }
      const API_BASE_URL = import.meta.env.VITE_API_URL_UPLOAD || 'http://localhost:4001';
      const cleanPath = user.photo.replace(/\\/g, '/').replace(/^\/+/, '');
      return `${API_BASE_URL}/${cleanPath}`;
    }
    return null;
  };

  const getNavItems = () => {
    switch (userRole) {
      case 'superAdmin':
        return [
          { label: 'Dashboard', path: '/superAdmin/dashboard' },
          { label: 'Elections', path: '/superAdmin/elections' },
          { label: 'Institutions', path: '/superAdmin/manage-institutions' },
          { label: 'Admins', path: '/superAdmin/manage-admins' },
          { label: 'Analytics', path: '/superAdmin/system-analytics' },
          { label: 'Settings', path: '/superAdmin/system-settings' },
          { label: 'Results', path: '/superAdmin/results' }
        ];
      case 'electionAdmin':
        return [
          { label: 'Dashboard', path: '/electionAdmin/dashboard' },
          { label: 'Elections', path: '/electionAdmin/elections' },
          { label: 'Candidates', path: '/electionAdmin/candidates' },
          { label: 'Voter List', path: '/electionAdmin/voter-list' },
          { label: 'Monitor', path: '/electionAdmin/monitor-voting' },
          { label: 'Publish', path: '/electionAdmin/publish-results' },
          { label: 'Results', path: '/electionAdmin/results' },
          { label: 'Settings', path: '/electionAdmin/institution-settings' }
        ];
      case 'candidate':
        return [
          { label: 'Dashboard', path: '/candidate/Dashboard' },
          { label: 'Elections', path: '/candidate/elections' },
          { label: 'My Nominations', path: '/candidate/my-nominations' },
          { label: 'Results', path: '/candidate/results' }
        ];
      case 'voter':
      case 'user':
        return [
          { label: 'Elections', path: '/voter/elections' },
          { label: 'Submit Nomination', path: '/voter/submit-nomination' },
          { label: 'My Nominations', path: '/voter/my-nominations' },
          { label: 'My Votes', path: '/voter/my-votes' },
          { label: 'Results', path: '/voter/results' }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

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

  const getRoleBadge = () => {
    const roles = {
      superAdmin: { color: '#D23A01', label: 'Super Admin', bg: '#FEF3F0' },
      electionAdmin: { color: '#D23A01', label: 'Election Admin', bg: '#FEF3F0' },
      candidate: { color: '#D23A01', label: 'Candidate', bg: '#FEF3F0' },
      voter: { color: '#D23A01', label: 'Voter', bg: '#FEF3F0' },
      user: { color: '#D23A01', label: 'Voter', bg: '#FEF3F0' }
    };
    return roles[userRole] || { color: '#D23A01', label: userRole || 'User', bg: '#FEF3F0' };
  };

  const roleBadge = getRoleBadge();
  const profilePicture = getProfilePicture();

  if (!userRole) {
    return null;
  }

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

  // ✅ Updated avatar circle style with overflow hidden and image support
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
    whiteSpace: 'nowrap'
  };

  const userRoleBadgeStyle = {
    fontSize: '9px',
    fontWeight: '600',
    color: roleBadge.color,
    background: roleBadge.bg,
    padding: '2px 8px',
    borderRadius: '20px'
  };

  const dropdownMenuStyle = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    minWidth: '220px',
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

  const mobileUserSectionStyle = {
    padding: '12px 16px',
    borderTop: '1px solid #E5E7EB',
    marginTop: '8px',
    paddingTop: '16px'
  };

  const mobileUserInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px'
  };

  const mobileUserAvatarStyle = {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: '#023430',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '18px',
    overflow: 'hidden'
  };

  const mobileAvatarImageStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  const mobileUserNameStyle = {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: '2px'
  };

  const mobileUserRoleStyle = {
    fontSize: '11px',
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
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const mobileLogoutBtnStyle = {
    width: '100%',
    padding: '12px',
    background: '#FEE2E2',
    color: '#DC2626',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  // ✅ Render avatar content function (same as Header)
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
      `}</style>

      <nav style={navbarStyle}>
        <div style={navStyles.navContainer}>
          {/* Logo - LEFT with Icon */}
          <Link to="/" style={navStyles.logo}>
            <FaVoteYea style={navStyles.logoIcon} />
            ECMS
          </Link>

          {/* Nav Items - CENTER */}
          <div style={navStyles.desktopMenu} className="desktop-menu">
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                style={({ isActive }) => ({
                  ...navStyles.navLink,
                  ...(isActive ? navStyles.activeNavLink : {})
                })}
                className="nav-link"
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* User Profile & Logout - RIGHT (Desktop only) */}
          <div style={navStyles.rightSection}>
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
                  <div style={{padding:"20px"}}>
                    <p style={userNameStyle}>{getFullName()}</p>
                    <p style={userRoleBadgeStyle}>{roleBadge.label}</p>
                  </div>
                  <Link to="/profile" style={dropdownItemStyle} className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                    <FaUserCircle size={16} /> My Profile
                  </Link>
                  <div style={{ height: '1px', background: '#E5E7EB', margin: '4px 0' }} />
                  <button onClick={handleLogout} style={dropdownItemStyle} className="dropdown-item">
                    <FiLogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={toggleMobileMenu}
              style={navStyles.mobileToggle}
              className="mobile-toggle"
            >
              {mobileMenuOpen ? <AiOutlineClose size={22} /> : <HiOutlineBars3 size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={navStyles.mobileMenu}>
            {navItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                style={({ isActive }) => ({
                  ...navStyles.mobileNavLink,
                  ...(isActive ? navStyles.mobileActiveNavLink : {})
                })}
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            <div style={mobileUserSectionStyle}>
              <div style={mobileUserInfoStyle}>
                <div style={mobileUserAvatarStyle}>
                  {renderAvatarContent('mobile')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={mobileUserNameStyle}>{getFullName()}</div>
                  <div style={mobileUserRoleStyle}>{roleBadge.label}</div>
                </div>
              </div>
          
              <button 
                onClick={goToProfile} 
                style={mobileProfileBtnStyle} 
                className="mobile-profile-btn"
              >
                <FiUser size={16} /> My Profile
              </button>
              
              <button 
                onClick={handleLogout} 
                style={mobileLogoutBtnStyle} 
                className="mobile-logout-btn"
              >
                <FiLogOut size={16} /> Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;