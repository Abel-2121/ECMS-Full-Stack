import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../Js/auth-slice';
import { 
  FiHome, FiGrid, FiUsers, FiBarChart2, FiSettings, FiLogOut, 
  FiMenu, FiX, FiUser, FiPlusCircle, FiUpload, FiKey, 
  FiEdit, FiActivity, FiShield, FiCheckCircle
} from 'react-icons/fi';
import './RoleBasedNavbar.css';

const RoleBasedNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    navigate('/');
    setIsOpen(false);
  };

  const navConfigs = {
    superadmin: [
      { label: 'Dashboard', path: '/elections', icon: <FiGrid /> },
      { label: 'Manage Institutions', path: '/superAdmin/manage-institutions', icon: <FiHome /> },
      { label: 'Create Admin Accounts', path: '/superAdmin/manage-admins', icon: <FiUsers /> },
      { label: 'System Analytics', path: '/superAdmin/system-analytics', icon: <FiBarChart2 /> },
      { label: 'System Settings', path: '/superAdmin/system-settings', icon: <FiSettings /> },
      { label: 'View Results', path: '/superAdmin/results', icon: <FiCheckCircle /> },
    ],
    electionadmin: [
      { label: 'Dashboard', path: '/elections', icon: <FiGrid /> },
      { label: 'Create Election', path: '/electionadmin/create-election', icon: <FiPlusCircle /> },
      { label: 'Upload Voter List', path: '/electionadmin/upload-voter-list', icon: <FiUpload /> },
      { label: 'Manage Nominations', path: '/electionadmin/manage-nominations', icon: <FiEdit /> },
      { label: 'Monitor Voting', path: '/electionadmin/monitor-voting', icon: <FiActivity /> },
      { label: 'Publish Results', path: '/electionadmin/publish-results', icon: <FiShield /> },
      { label: 'View Results', path: '/electionadmin/results', icon: <FiCheckCircle /> },
    ],
    candidate: [
      { label: 'elections', path: '/elections', icon: <FiGrid /> },
      { label: 'Submit Nomination', path: '/candidate/submit-nomination', icon: <FiPlusCircle /> },
      { label: 'My Candidacy Status', path: '/candidate/candidacy-status', icon: <FiUser /> },
      { label: 'Update Profile', path: '/candidate/update-profile', icon: <FiEdit /> },
      { label: 'View Results', path: '/candidate/results', icon: <FiCheckCircle /> },
    ],
    voter: [
      { label: 'Dashboard', path: '/elections', icon: <FiGrid /> },
      { label: 'Verify Credentials', path: '/voter/verify-credentials', icon: <FiKey /> },
      { label: 'Cast Vote', path: '/voting/cast-vote', icon: <FiCheckCircle /> },
      { label: 'My Voting Status', path: '/voter/voting-status', icon: <FiActivity /> },
      { label: 'View Results', path: '/candidate/results', icon: <FiCheckCircle /> },
    ],
  };

  const currentNavItems = (user?.role && navConfigs[user.role.toLowerCase()]) || [];

  if (!isAuthenticated) return null;

  return (
    <nav className="enhanced-navbar">
      <div className="nav-blur-container">
        <div className="nav-content-wrapper">
          {/* Logo Section */}
          <Link to="/elections" className="nav-brand">
            <div className="brand-icon"><FiShield /></div>
            <p className="brand-text">ECMS <small>ADMIN</small></p>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links-desktop">
            {currentNavItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <p className="item-icon">{item.icon}</p>
                <p className="item-label">{item.label}</p>
              </NavLink>
            ))}
          </div>

          {/* User Section & Mobile Toggle */}
          <div className="nav-actions">
            <div className="user-profile-widget">
              <div className="user-info">
                <p className="user-role-badge">{user?.role?.toUpperCase()}</p>
                <p className="user-name">{user?.fullName || 'User'}</p>
              </div>
              <div className="user-avatar">
                <FiUser />
              </div>
            </div>

            <button className="logout-button-desktop" onClick={handleLogout} title="Logout">
              <FiLogOut />
            </button>

            <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`mobile-menu-overlay ${isOpen ? 'show' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-user-header">
             <div className="avatar-large"><FiUser /></div>
             <h3>{user?.fullName}</h3>
             <p className="role-pill">{user?.role}</p>
          </div>
          
          <div className="mobile-nav-list">
            {currentNavItems.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
              >
                <p className="mobile-item-icon">{item.icon}</p>
                {item.label}
              </NavLink>
            ))}
            <button className="mobile-logout-btn" onClick={handleLogout}>
              <FiLogOut /> Sign Out System
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default RoleBasedNavbar;
