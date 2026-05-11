// pages/profile/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  fetchMyProfile, updateProfile, changePassword, 
  uploadAvatar, removeAvatar, clearSuccess, clearError 
} from '../Js/user-slice';
import { 
  FiUser, FiMail, FiPhone, FiMapPin, FiCamera, 
  FiSave, FiLock, FiCheckCircle, FiAlertCircle, 
  FiArrowLeft, FiEdit2, FiX, FiTrash2, FiUserCheck,
  FiShield, FiAward, FiCalendar, FiClock
} from 'react-icons/fi';

const UserProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, updating, changingPassword, success, error } = useSelector(state => state.user);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });
  
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (success) {
      showToast('Profile updated successfully!', 'success');
      dispatch(clearSuccess());
      setIsEditing(false);
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
    }
    if (error) {
      showToast(error, 'error');
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  const showToast = (message, type) => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleProfileChange = (field, value) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('Avatar must be less than 2MB', 'error');
        return;
      }
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleSaveAvatar = async () => {
    if (avatarFile) {
      await dispatch(uploadAvatar(avatarFile));
      setAvatarFile(null);
      setAvatarPreview(null);
      showToast('Avatar updated successfully!', 'success');
    }
  };

  const handleRemoveAvatar = async () => {
    await dispatch(removeAvatar());
    showToast('Avatar removed successfully!', 'success');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    await dispatch(updateProfile(profileForm));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.newPasswordConfirm) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }
    await dispatch(changePassword(passwordForm));
  };

  const getInitials = () => {
    if (!user) return 'U';
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`;
  };

  const getRoleBadge = () => {
    const role = user?.role;
    switch(role) {
      case 'superAdmin': return { label: 'Super Admin', color: '#8b5cf6', bg: '#ede9fe', icon: <FiShield size={14} /> };
      case 'electionAdmin': return { label: 'Election Admin', color: '#3b82f6', bg: '#eff6ff', icon: <FiUserCheck size={14} /> };
      case 'candidate': return { label: 'Candidate', color: '#D23A01', bg: '#FEF3F0', icon: <FiAward size={14} /> };
      default: return { label: 'Voter', color: '#023430', bg: '#E8F5E9', icon: <FiUser size={14} /> };
    }
  };

  if (loading && !user) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={{ fontSize: '16px', color: '#4a5568' }}>Loading profile...</p>
      </div>
    );
  }

  const roleBadge = getRoleBadge();

  return (
    <div style={styles.container}>
      {/* Toast Message */}
      {toastMessage && (
        <div style={{
          ...styles.toast,
          background: toastMessage.type === 'success' ? '#D23A01' : '#ef4444'
        }}>
          {toastMessage.type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          <FiArrowLeft size={18} /> Back
        </button>
        <div>
          <h1 style={styles.title}>My Profile</h1>
          <p style={styles.subtitle}>Manage your personal information and account settings</p>
        </div>
      </div>

      {/* Profile Content */}
      <div style={styles.content} className='profile-content'>
        {/* Left Column - Avatar & Basic Info */}
        <div style={styles.leftColumn} className='profile-left'>
          <div style={styles.avatarCard}>
            <div style={styles.avatarContainer}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={styles.avatar} />
              ) : user?.photo && user.photo !== 'default.jpg' ? (
                <img src={user.photo} alt="Avatar" style={styles.avatar} />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  <span style={styles.initials}>{getInitials()}</span>
                </div>
              )}
              
              <label style={styles.uploadLabel}>
                <FiCamera size={16} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={styles.fileInput}
                />
              </label>
            </div>
            
            {(avatarFile || (user?.photo && user.photo !== 'default.jpg')) && (
              <div style={styles.avatarActions}>
                {avatarFile && (
                  <button style={styles.saveAvatarBtn} onClick={handleSaveAvatar}>
                    <FiCheckCircle size={14} /> Save Avatar
                  </button>
                )}
                {user?.photo && user.photo !== 'default.jpg' && !avatarFile && (
                  <button style={styles.removeAvatarBtn} onClick={handleRemoveAvatar}>
                    <FiTrash2 size={14} /> Remove
                  </button>
                )}
              </div>
            )}
            
            <div style={styles.userInfo}>
              <h2 style={styles.userName}>{user?.firstName} {user?.lastName}</h2>
              <div style={styles.userEmail}>
                <FiMail size={14} /> {user?.email}
              </div>
              <div style={{ ...styles.roleBadge, background: roleBadge.bg, color: roleBadge.color }}>
                {roleBadge.icon} {roleBadge.label}
              </div>
              {user?.createdAt && (
                <div style={styles.memberSince}>
                  <FiCalendar size={12} />
                  <span>Member since {new Date(user.createdAt).getFullYear()}</span>
                </div>
              )}
              {user?.institutionId && (
                <div style={styles.institutionInfo}>
                  <div style={styles.institutionName}>{user.institutionId.name}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Edit Forms */}
        <div style={styles.rightColumn} className=''>
          {/* Edit Profile Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                <FiUser size={20} style={{ color: '#D23A01' }} /> Personal Information
              </h2>
              {!isEditing ? (
                <button style={styles.editBtn} onClick={() => setIsEditing(true)}>
                  <FiEdit2 size={14} /> Edit Profile
                </button>
              ) : (
                <button style={styles.cancelBtn} onClick={() => {
                  setIsEditing(false);
                  setProfileForm({
                    firstName: user?.firstName || '',
                    lastName: user?.lastName || '',
                    phone: user?.phone || '',
                    address: user?.address || ''
                  });
                }}>
                  <FiX size={14} /> Cancel
                </button>
              )}
            </div>
            
            <form onSubmit={handleUpdateProfile}>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>First Name</label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    style={styles.input}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Last Name</label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    style={styles.input}
                    disabled={!isEditing}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    style={{ ...styles.input, background: '#f8fafc', borderColor: '#e5e7eb' }}
                    disabled
                  />
                  <p style={styles.helperText}>Email cannot be changed</p>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                    style={styles.input}
                    disabled={!isEditing}
                    placeholder="+251XXXXXXXXX"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Address</label>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => handleProfileChange('address', e.target.value)}
                    style={styles.textarea}
                    rows={2}
                    disabled={!isEditing}
                    placeholder="Your address"
                  />
                </div>
              </div>
              
              {isEditing && (
                <div style={styles.formActions}>
                  <button type="submit" style={styles.saveProfileBtn} disabled={updating}>
                    {updating ? 'Saving...' : <><FiSave size={16} /> Save Changes</>}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Change Password Section */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>
                <FiLock size={20} style={{ color: '#023430' }} /> Change Password
              </h2>
              {!isChangingPassword ? (
                <button style={styles.editBtn} onClick={() => setIsChangingPassword(true)}>
                  <FiLock size={14} /> Change Password
                </button>
              ) : (
                <button style={styles.cancelBtn} onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', newPasswordConfirm: '' });
                }}>
                  <FiX size={14} /> Cancel
                </button>
              )}
            </div>
            
            {isChangingPassword && (
              <form onSubmit={handleChangePassword}>
                <div style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      style={styles.input}
                      required
                    />
                    <p style={styles.helperText}>Minimum 8 characters</p>
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPasswordConfirm}
                      onChange={(e) => handlePasswordChange('newPasswordConfirm', e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                </div>
                
                <div style={styles.formActions}>
                  <button type="submit" style={styles.changePasswordBtn} disabled={changingPassword}>
                    {changingPassword ? 'Changing...' : 'Update Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .profile-content {
            grid-template-columns: 1fr !important;
          }
          .profile-left {
            position: static !important;
          }
          .profile-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { 
    padding: 'clamp(20px, 4vw, 32px)', 
    maxWidth: '1200px', 
    margin: '0 auto',
    marginTop: 'clamp(60px, 10vh, 80px)',
    minHeight: '100vh',
    background: '#f8fafc'
  },
  header: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '24px', 
    marginBottom: '32px', 
    flexWrap: 'wrap' 
  },
  backBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    background: 'white', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    color: '#1a1a1a', 
    fontSize: '14px',
    padding: '10px 18px',
    fontWeight: '500'
  },
  title: { 
    fontSize: 'clamp(24px, 5vw, 28px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    marginBottom: '8px',
    fontFamily: "'Poppins', sans-serif"
  },
  subtitle: { 
    fontSize: '15px', 
    color: '#4a5568',
    fontFamily: "'Poppins', sans-serif"
  },
  toast: { 
    position: 'fixed', 
    top: '80px', 
    right: '20px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    padding: '14px 24px', 
    borderRadius: '12px', 
    color: 'white', 
    fontSize: '14px', 
    zIndex: 1000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  content: { 
    display: 'grid', 
    gridTemplateColumns: '320px 1fr', 
    gap: 'clamp(24px, 4vw, 32px)' 
  },
  leftColumn: { 
    position: 'sticky', 
    top: '100px', 
    height: 'fit-content' 
  },
  rightColumn: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '24px' 
  },
  
  avatarCard: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 28px)', 
    border: '1px solid #e5e7eb', 
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  avatarContainer: { 
    position: 'relative', 
    width: '140px', 
    height: '140px', 
    margin: '0 auto 20px' 
  },
  avatar: { 
    width: '100%', 
    height: '100%', 
    borderRadius: '50%', 
    objectFit: 'cover',
    border: '3px solid #D23A01'
  },
  avatarPlaceholder: { 
    width: '100%', 
    height: '100%', 
    borderRadius: '50%', 
    background: 'linear-gradient(135deg, #D23A01, #b02e00)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  initials: { 
    fontSize: '48px', 
    fontWeight: '700', 
    color: 'white',
    fontFamily: "'Poppins', sans-serif"
  },
  uploadLabel: { 
    position: 'absolute', 
    bottom: '5px', 
    right: '5px', 
    background: '#D23A01', 
    borderRadius: '50%', 
    width: '36px', 
    height: '36px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    cursor: 'pointer',
    border: '2px solid white',
    transition: 'all 0.2s'
  },
  fileInput: { 
    position: 'absolute', 
    top: 0, 
    left: 0, 
    width: '100%', 
    height: '100%', 
    opacity: 0, 
    cursor: 'pointer' 
  },
  avatarActions: { 
    display: 'flex', 
    justifyContent: 'center', 
    gap: '12px', 
    marginBottom: '20px' 
  },
  saveAvatarBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '8px 16px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '13px',
    fontWeight: '600'
  },
  removeAvatarBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '8px 16px', 
    background: '#fee2e2', 
    color: '#dc2626', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '13px',
    fontWeight: '600'
  },
  userInfo: { 
    marginTop: '20px' 
  },
  userName: { 
    fontSize: 'clamp(20px, 4vw, 22px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    marginBottom: '8px',
    fontFamily: "'Poppins', sans-serif"
  },
  userEmail: { 
    fontSize: '14px', 
    color: '#4a5568', 
    marginBottom: '12px', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '8px' 
  },
  roleBadge: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '6px', 
    padding: '6px 14px', 
    borderRadius: '24px', 
    fontSize: '13px', 
    fontWeight: '600',
    marginBottom: '12px'
  },
  memberSince: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#94a3b8',
    marginBottom: '12px'
  },
  institutionInfo: { 
    marginTop: '12px', 
    paddingTop: '12px', 
    borderTop: '1px solid #e5e7eb' 
  },
  institutionName: { 
    fontSize: '13px', 
    color: '#D23A01', 
    fontWeight: '600' 
  },
  
  section: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 28px)', 
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  sectionHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '24px', 
    flexWrap: 'wrap', 
    gap: '12px' 
  },
  sectionTitle: { 
    fontSize: 'clamp(18px, 4vw, 20px)', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: "'Poppins', sans-serif"
  },
  editBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '8px 16px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '14px', 
    color: '#1a1a1a',
    fontWeight: '500'
  },
  cancelBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '8px 16px', 
    background: '#fee2e2', 
    color: '#dc2626', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '14px',
    fontWeight: '500'
  },
  
  formGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
    gap: '20px' 
  },
  formGroup: { 
    marginBottom: '20px' 
  },
  label: { 
    display: 'block', 
    fontWeight: '600', 
    marginBottom: '8px', 
    color: '#1a1a1a',
    fontSize: '14px'
  },
  input: { 
    width: '100%', 
    padding: '12px 14px', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s'
  },
  textarea: { 
    width: '100%', 
    padding: '12px 14px', 
    border: '1px solid #e5e7eb', 
    borderRadius: '10px', 
    fontSize: '15px', 
    fontFamily: 'inherit', 
    resize: 'vertical',
    outline: 'none'
  },
  helperText: { 
    fontSize: '12px', 
    color: '#6b7280', 
    marginTop: '6px' 
  },
  formActions: { 
    marginTop: '24px', 
    textAlign: 'right' 
  },
  saveProfileBtn: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '12px 28px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontWeight: '600',
    fontSize: '15px'
  },
  changePasswordBtn: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '12px 28px', 
    background: '#023430', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontWeight: '600',
    fontSize: '15px'
  },
  
  loaderContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '400px', 
    gap: '20px' 
  },
  spinner: { 
    width: '50px', 
    height: '50px', 
    border: '3px solid #e5e7eb', 
    borderTop: '3px solid #D23A01', 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  }
};

export default UserProfile;