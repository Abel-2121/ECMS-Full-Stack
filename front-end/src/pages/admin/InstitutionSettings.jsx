// pages/electionAdmin/InstitutionSettings.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyInstitution, updateMyInstitution, clearError } from '../../Js/institution-slice';
import { 
  FiSave, FiAlertCircle, FiCheckCircle, FiUpload,
  FiArrowLeft, FiFacebook, FiTwitter, FiLinkedin, FiInstagram,
  FiHome, FiMail, FiPhone, FiMapPin, FiGlobe, FiFileText,
  FiLoader, FiInfo, FiCalendar
} from 'react-icons/fi';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const InstitutionSettings = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedInstitution: institution, loading, error, success } = useSelector(state => state.institution);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    about: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    alternatePhone: '',
    fax: '',
    poBox: '',
    logo: null,
    logoPreview: null,
  });
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadInstitution();
  }, []);

  useEffect(() => {
    if (institution && !isDataLoaded) {
      setFormData({
        name: institution.name || '',
        about: institution.about || '',
        code: institution.code || '',
        address: institution.address || '',
        phone: institution.phone || '',
        email: institution.email || '',
        website: institution.website || '',
        alternatePhone: institution.alternatePhone || '',
        fax: institution.fax || '',
        poBox: institution.poBox || '',
        logoPreview: institution.logo || null,
      });
      setIsDataLoaded(true);
    }
  }, [institution, isDataLoaded]);

  useEffect(() => {
    if (success) {
      showToast('Institution settings updated successfully!', 'success');
      dispatch(clearError());
      loadInstitution();
    }
    if (error) {
      showToast(error, 'error');
      dispatch(clearError());
    }
  }, [success, error]);

  const loadInstitution = async () => {
    setIsDataLoaded(false);
    await dispatch(getMyInstitution());
  };

  const showToast = (message, type) => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value }
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'error');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        showToast('Logo must be less than 2MB', 'error');
        return;
      }
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, logoPreview: previewUrl }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('about', formData.about);
    submitData.append('address', formData.address);
    submitData.append('phone', formData.phone);
    submitData.append('email', formData.email);
    submitData.append('website', formData.website);
    submitData.append('alternatePhone', formData.alternatePhone);
    submitData.append('fax', formData.fax);
    submitData.append('poBox', formData.poBox);
    
    if (logoFile) {
      submitData.append('logo', logoFile);
    }
    
    await dispatch(updateMyInstitution({ id: institution._id, formData: submitData }));
    setSaving(false);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setFormData(prev => ({ ...prev, logoPreview: null }));
  };

  if (loading && !isDataLoaded) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loaderText}>Loading institution settings...</p>
      </div>
    );
  }

  if (!isDataLoaded && !institution) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loaderText}>Loading institution data...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Toast Message */}
      {toastMessage && (
        <div style={{
          ...styles.toast,
          background: toastMessage.type === 'success' ? '#10b981' : '#dc2626'
        }}>
          {toastMessage.type === 'success' ? <FiCheckCircle size={18} /> : <FiAlertCircle size={18} />}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button style={styles.backBtn} onClick={() => navigate('/electionAdmin/dashboard')}>
            <FiArrowLeft size={16} /> Back to Dashboard
          </button>
          <div>
            <h1 style={styles.title}>
              <FiHome size={28} style={styles.titleIcon} /> Institution Settings
            </h1>
            <p style={styles.subtitle}>Manage your institution profile and contact information</p>
          </div>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.saveBtn} onClick={handleSubmit} disabled={saving}>
            {saving ? (
              <><FiLoader size={16} className="spin" /> Saving...</>
            ) : (
              <><FiSave size={16} /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Basic Information Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Basic Information</h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Institution Name <span style={styles.required}>*</span></label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Institution Code</label>
              <input
                type="text"
                value={formData.code}
                style={{ ...styles.input, background: '#f1f5f9', color: '#6b7280' }}
                disabled
              />
              <span style={styles.helperText}>Institution code cannot be changed</span>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}><FiMail size={14} /> Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                style={styles.input}
                placeholder="contact@institution.edu"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}><FiPhone size={14} /> Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                style={styles.input}
                placeholder="+251 XXX XXX XXX"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Alternate Phone</label>
              <input
                type="tel"
                value={formData.alternatePhone}
                onChange={(e) => handleChange('alternatePhone', e.target.value)}
                style={styles.input}
                placeholder="Alternate contact number"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Fax Number</label>
              <input
                type="text"
                value={formData.fax}
                onChange={(e) => handleChange('fax', e.target.value)}
                style={styles.input}
                placeholder="Fax number"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>P.O. Box</label>
              <input
                type="text"
                value={formData.poBox}
                onChange={(e) => handleChange('poBox', e.target.value)}
                style={styles.input}
                placeholder="P.O. Box Number"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}><FiGlobe size={14} /> Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                style={styles.input}
                placeholder="https://www.institution.edu"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}><FiMapPin size={14} /> Address</label>
              <textarea
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                style={styles.textarea}
                rows={2}
                placeholder="Full institution address"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}><FiFileText size={14} /> About Institution</label>
              <textarea
                value={formData.about}
                onChange={(e) => handleChange('about', e.target.value)}
                style={styles.textarea}
                rows={3}
                placeholder="Brief description of your institution..."
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Institution Logo</label>
              <div style={styles.logoUpload}>
                {formData.logoPreview ? (
                  <div style={styles.logoPreview}>
                    <img 
                      src={formData.logoPreview.startsWith('http') ? formData.logoPreview : `http://localhost:4001/${formData.logoPreview}`} 
                      alt="Institution Logo" 
                      style={styles.logoImg}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=Logo'; }}
                    />
                    <button 
                      type="button"
                      style={styles.removeLogoBtn}
                      onClick={handleRemoveLogo}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label style={styles.uploadArea}>
                    <FiUpload size={32} color="#D23A01" />
                    <span style={styles.uploadText}>Click to upload logo</span>
                    <span style={styles.uploadHint}>PNG, JPG up to 2MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      style={styles.fileInput}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div style={styles.statusCard}>
          <h3 style={styles.cardTitle}>
            <FiInfo size={18} style={styles.cardIcon} /> Institution Status
          </h3>
          <div style={styles.statusGrid}>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}>Status</span>
              <span style={{
                ...styles.statusBadge,
                background: institution?.status === 'active' ? '#10b98120' : 
                           institution?.status === 'pending' ? '#D23A0110' : '#fee2e2',
                color: institution?.status === 'active' ? '#10b981' :
                       institution?.status === 'pending' ? '#D23A01' : '#dc2626'
              }}>
                {institution?.status === 'active' ? 'Active' : 
                 institution?.status === 'pending' ? 'Pending Approval' : 'Inactive'}
              </span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}><FiCalendar size={14} /> Approved On</span>
              <span>{institution?.approvedAt ? new Date(institution.approvedAt).toLocaleDateString() : 'Not yet approved'}</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}><FiCalendar size={14} /> Registered Since</span>
              <span>{institution?.createdAt ? new Date(institution.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusLabel}><FiCalendar size={14} /> Last Updated</span>
              <span>{institution?.updatedAt ? new Date(institution.updatedAt).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 1s linear infinite; }
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr !important;
          }
          .status-grid {
            grid-template-columns: 1fr !important;
          }
          .header-left {
            flex-direction: column;
            align-items: flex-start;
          }
          .header-actions {
            width: 100%;
          }
          .save-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { 
    padding: 'clamp(20px, 4vw, 32px)', 
    maxWidth: '1000px', 
    margin: '0 auto',
    minHeight: '100vh',
    background: '#f8fafc'
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 'clamp(24px, 5vw, 32px)', 
    flexWrap: 'wrap', 
    gap: '16px' 
  },
  headerLeft: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '20px', 
    flexWrap: 'wrap' 
  },
  backBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    color: '#6b7280', 
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: "'Poppins', sans-serif"
  },
  title: { 
    fontSize: 'clamp(24px, 5vw, 28px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontFamily: "'Poppins', sans-serif"
  },
  titleIcon: {
    color: '#D23A01'
  },
  subtitle: { 
    fontSize: 'clamp(13px, 3vw, 14px)', 
    color: '#6b7280',
    fontFamily: "'Poppins', sans-serif"
  },
  headerActions: { 
    display: 'flex', 
    gap: '12px' 
  },
  saveBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '12px 24px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: '700',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s'
  },
  toast: { 
    position: 'fixed', 
    top: 'clamp(70px, 12vh, 90px)', 
    right: '20px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    padding: '14px 20px', 
    borderRadius: '12px', 
    color: 'white', 
    fontSize: '14px', 
    fontWeight: '500',
    zIndex: 1000, 
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    fontFamily: "'Poppins', sans-serif"
  },
  form: { 
    background: 'white', 
    borderRadius: '20px', 
    border: '1px solid #e5e7eb', 
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
  },
  section: { 
    padding: 'clamp(20px, 4vw, 24px)', 
    borderBottom: '1px solid #e5e7eb' 
  },
  sectionTitle: { 
    fontSize: '18px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    marginBottom: '20px',
    fontFamily: "'Poppins', sans-serif"
  },
  formGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
    gap: '20px' 
  },
  formGroup: { 
    marginBottom: '16px' 
  },
  label: { 
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '700', 
    marginBottom: '8px', 
    color: '#1a1a1a',
    fontSize: '13px',
    fontFamily: "'Poppins', sans-serif"
  },
  required: {
    color: '#D23A01',
    fontSize: '14px'
  },
  input: { 
    width: '100%', 
    padding: '12px 14px', 
    border: '2px solid #e5e7eb', 
    borderRadius: '12px', 
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    outline: 'none',
    transition: 'all 0.2s'
  },
  textarea: { 
    width: '100%', 
    padding: '12px 14px', 
    border: '2px solid #e5e7eb', 
    borderRadius: '12px', 
    fontSize: '14px', 
    fontFamily: "'Poppins', sans-serif",
    resize: 'vertical', 
    outline: 'none'
  },
  helperText: { 
    fontSize: '11px', 
    color: '#9ca3af', 
    marginTop: '6px',
    display: 'block',
    fontFamily: "'Poppins', sans-serif"
  },
  logoUpload: { 
    marginTop: '8px' 
  },
  logoPreview: { 
    display: 'inline-flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    gap: '10px' 
  },
  logoImg: { 
    width: '100px', 
    height: '100px', 
    objectFit: 'cover', 
    borderRadius: '16px', 
    border: '2px solid #e5e7eb' 
  },
  removeLogoBtn: { 
    padding: '6px 16px', 
    background: '#fee2e2', 
    color: '#dc2626', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: "'Poppins', sans-serif"
  },
  uploadArea: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 'clamp(24px, 5vw, 32px)', 
    border: '2px dashed #cbd5e1', 
    borderRadius: '16px', 
    cursor: 'pointer', 
    position: 'relative',
    background: '#f8fafc',
    transition: 'all 0.2s'
  },
  uploadText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4b5563',
    marginTop: '8px',
    fontFamily: "'Poppins', sans-serif"
  },
  uploadHint: { 
    fontSize: '11px', 
    color: '#9ca3af', 
    marginTop: '4px',
    fontFamily: "'Poppins', sans-serif"
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
  statusCard: { 
    margin: '24px', 
    padding: '20px', 
    background: '#f8fafc', 
    borderRadius: '16px',
    border: '1px solid #e5e7eb'
  },
  cardTitle: { 
    fontSize: '16px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'Poppins', sans-serif"
  },
  cardIcon: {
    color: '#D23A01'
  },
  statusGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
    gap: '16px' 
  },
  statusRow: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '10px 0', 
    borderBottom: '1px solid #e5e7eb', 
    fontSize: '13px',
    flexWrap: 'wrap',
    gap: '8px',
    fontFamily: "'Poppins', sans-serif"
  },
  statusLabel: {
    fontWeight: '600',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  statusBadge: { 
    padding: '4px 12px', 
    borderRadius: '20px', 
    fontSize: '12px', 
    fontWeight: '700',
    fontFamily: "'Poppins', sans-serif"
  },
  loaderContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '60vh', 
    gap: '20px' 
  },
  loaderText: {
    fontSize: '15px',
    color: '#6b7280',
    fontFamily: "'Poppins', sans-serif"
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

export default InstitutionSettings;