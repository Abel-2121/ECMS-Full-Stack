// pages/superadmin/SystemSettings.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { 
  fetchSettings, updateSettings, resetToDefault,
  uploadHeroImage, deleteHeroImage, setActiveHeroImage,
  clearSuccess, clearError
} from '../../Js/system-settings-slice';
import { 
  FiSave, FiRefreshCw, FiMail, FiSettings as FiSettingsIcon,
  FiInfo, FiEdit2, FiPlus, FiTrash2, FiGlobe, FiPhone, FiMapPin,
  FiAward, FiTrendingUp, FiLink, FiStar, FiUpload, FiImage
} from 'react-icons/fi';

const API_BASE_URL = import.meta.env.VITE_API_URL_UPLOAD || 'http://localhost:4001';

const SystemSettings = () => {
  const dispatch = useDispatch();
  const { settings, loading, saving, uploading, success, error } = useSelector(state => state.systemSettings);
  const [localSettings, setLocalSettings] = useState({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingFeature, setEditingFeature] = useState(null);
  const [editingStep, setEditingStep] = useState(null);
  const [newFeature, setNewFeature] = useState({ title: '', description: '' });
  const [newStep, setNewStep] = useState({ number: '', title: '', description: '', icon: '' });
  
  // Hero image upload states
  const [heroImageFile, setHeroImageFile] = useState(null);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (success) {
      setTimeout(() => dispatch(clearSuccess()), 3000);
    }
  }, [success, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (section, field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleAboutChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      about: {
        ...prev.about,
        [field]: value
      }
    }));
  };

  const handleHeroChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
  };

  const handleHowItWorksChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      howItWorks: {
        ...prev.howItWorks,
        [field]: value
      }
    }));
  };

  const handleFooterChange = (field, value) => {
    setLocalSettings(prev => ({
      ...prev,
      footer: {
        ...prev.footer,
        [field]: value
      }
    }));
  };

  // Feature handlers
  const handleAddFeature = () => {
    if (newFeature.title && newFeature.description) {
      const features = [...(localSettings.about?.features || [])];
      features.push({ ...newFeature, id: Date.now() });
      setLocalSettings(prev => ({
        ...prev,
        about: {
          ...prev.about,
          features
        }
      }));
      setNewFeature({ title: '', description: '' });
    }
  };

  const handleUpdateFeature = (index, field, value) => {
    const features = [...(localSettings.about?.features || [])];
    features[index][field] = value;
    setLocalSettings(prev => ({
      ...prev,
      about: {
        ...prev.about,
        features
      }
    }));
    setEditingFeature(null);
  };

  const handleDeleteFeature = (index) => {
    const features = [...(localSettings.about?.features || [])];
    features.splice(index, 1);
    setLocalSettings(prev => ({
      ...prev,
      about: {
        ...prev.about,
        features
      }
    }));
  };

  // Hero Stats handlers
  const handleAddStat = () => {
    const stats = [...(localSettings.hero?.stats || [])];
    stats.push({ number: '', label: '' });
    handleHeroChange('stats', stats);
  };

  const handleUpdateStat = (index, field, value) => {
    const stats = [...(localSettings.hero?.stats || [])];
    stats[index][field] = value;
    handleHeroChange('stats', stats);
  };

  const handleDeleteStat = (index) => {
    const stats = (localSettings.hero?.stats || []).filter((_, i) => i !== index);
    handleHeroChange('stats', stats);
  };

  // Hero Image handlers using Redux
  const handleUploadHeroImage = async () => {
    if (!heroImageFile) {
      toast.error('Please select an image first');
      return;
    }
    
    const result = await dispatch(uploadHeroImage(heroImageFile));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Hero image uploaded successfully');
      setHeroImageFile(null);
      dispatch(fetchSettings());
    }
  };

  const handleDeleteHeroImage = async (imageId) => {
    const result = await dispatch(deleteHeroImage(imageId));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Image deleted successfully');
      dispatch(fetchSettings());
    }
  };

  const handleSetActiveHeroImage = async (imageId) => {
    const result = await dispatch(setActiveHeroImage(imageId));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Active image updated');
      dispatch(fetchSettings());
    }
  };

  // How It Works Steps handlers
  const handleAddStep = () => {
    if (newStep.title && newStep.description) {
      const steps = [...(localSettings.howItWorks?.steps || [])];
      steps.push({ ...newStep, id: Date.now() });
      setLocalSettings(prev => ({
        ...prev,
        howItWorks: {
          ...prev.howItWorks,
          steps
        }
      }));
      setNewStep({ number: '', title: '', description: '', icon: '' });
    }
  };

  const handleUpdateStep = (index, field, value) => {
    const steps = [...(localSettings.howItWorks?.steps || [])];
    steps[index][field] = value;
    setLocalSettings(prev => ({
      ...prev,
      howItWorks: {
        ...prev.howItWorks,
        steps
      }
    }));
    setEditingStep(null);
  };

  const handleDeleteStep = (index) => {
    const steps = (localSettings.howItWorks?.steps || []).filter((_, i) => i !== index);
    setLocalSettings(prev => ({
      ...prev,
      howItWorks: {
        ...prev.howItWorks,
        steps
      }
    }));
  };

  // Footer Links handlers
  const handleAddLink = () => {
    const links = [...(localSettings.footer?.links || [])];
    links.push({ label: '', path: '' });
    handleFooterChange('links', links);
  };

  const handleUpdateLink = (index, field, value) => {
    const links = [...(localSettings.footer?.links || [])];
    links[index][field] = value;
    handleFooterChange('links', links);
  };

  const handleDeleteLink = (index) => {
    const links = (localSettings.footer?.links || []).filter((_, i) => i !== index);
    handleFooterChange('links', links);
  };

  const handleSave = async () => {
    const loadingToast = toast.loading('Saving settings...');
    try {
      await dispatch(updateSettings(localSettings)).unwrap();
      toast.success('Settings saved successfully!', { id: loadingToast });
    } catch (err) {
      toast.error(err || 'Failed to save settings', { id: loadingToast });
    }
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = async () => {
    const loadingToast = toast.loading('Resetting settings...');
    try {
      await dispatch(resetToDefault()).unwrap();
      toast.success('Settings reset to default!', { id: loadingToast });
      setShowResetConfirm(false);
    } catch (err) {
      toast.error(err || 'Failed to reset settings', { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p>Loading settings...</p>
      </div>
    );
  }

  const about = localSettings.about || {
    platformName: 'ECMS - Election Control & Management System',
    version: '2.0.0',
    description: '',
    features: [],
    contactEmail: 'support@ecms.com',
    website: 'www.ecms-platform.com',
    ctaTitle: 'Ready to get started?',
    ctaText: 'Join thousands of institutions already using ECMS for their elections.',
    ctaButtonText: 'Create Free Account',
    contactPhone: '+1 (555) 123-4567',
    contactAddress: '123 Election St, Democracy City, 12345'
  };

  const hero = localSettings.hero || {
    title: 'Election Control & Management System',
    subtitle: 'Secure, transparent, and efficient online voting platform for institutions and organizations worldwide.',
    stats: [
      { number: '500+', label: 'Organizations' },
      { number: '100K+', label: 'Voters Served' },
      { number: '99.9%', label: 'Satisfaction' }
    ],
    ctaButtonText: 'Register Institution',
    images: []
  };

  const howItWorks = localSettings.howItWorks || {
    title: 'How It Works',
    steps: [
      { number: '01', title: 'Register', description: 'Create your account with your email address', icon: 'FiUserPlus' },
      { number: '02', title: 'Verify', description: 'Verify your email with OTP to activate account', icon: 'FiCheckCircle' },
      { number: '03', title: 'Participate', description: 'Vote, manage elections, or run as a candidate', icon: 'FiAward' }
    ]
  };

  const footer = localSettings.footer || {
    copyright: '© 2024 ECMS. All rights reserved.',
    links: [
      { label: 'Privacy', path: '/privacy' },
      { label: 'Terms', path: '/terms' },
      { label: 'Contact', path: '/contact' },
      { label: 'FAQ', path: '/faq' }
    ]
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>System Settings</h1>
          <p style={styles.subtitle}>Configure platform-wide parameters and preferences</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.resetBtn} onClick={handleReset}>
            <FiRefreshCw size={16} /> Reset to Default
          </button>
          <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : <><FiSave size={16} /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* Settings Content */}
      <div style={styles.content}>
        {/* GENERAL SETTINGS */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <FiSettingsIcon size={18} /> General Settings
          </h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Platform Name</label>
              <input
                type="text"
                value={localSettings.general?.platformName || ''}
                onChange={(e) => handleChange('general', 'platformName', e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}><FiMail size={14} /> Support Email</label>
              <input
                type="email"
                value={localSettings.general?.supportEmail || ''}
                onChange={(e) => handleChange('general', 'supportEmail', e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}><FiPhone size={14} /> Support Phone</label>
              <input
                type="text"
                value={localSettings.general?.supportPhone || ''}
                onChange={(e) => handleChange('general', 'supportPhone', e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}><FiMapPin size={14} /> Contact Address</label>
              <textarea
                value={localSettings.general?.contactAddress || ''}
                onChange={(e) => handleChange('general', 'contactAddress', e.target.value)}
                style={styles.textarea}
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* HERO SECTION */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <FiAward size={18} /> Hero Section
          </h2>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Hero Title</label>
              <input
                type="text"
                value={hero.title}
                onChange={(e) => handleHeroChange('title', e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Hero Subtitle</label>
              <textarea
                value={hero.subtitle}
                onChange={(e) => handleHeroChange('subtitle', e.target.value)}
                style={styles.textarea}
                rows={2}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>CTA Button Text</label>
              <input
                type="text"
                value={hero.ctaButtonText}
                onChange={(e) => handleHeroChange('ctaButtonText', e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Hero Statistics */}
          <div style={styles.subSection}>
            <h3 style={styles.subSectionTitle}>Hero Statistics</h3>
            <div style={styles.statsList}>
              {(hero.stats || []).map((stat, index) => (
                <div key={index} style={styles.statCard}>
                  <input
                    type="text"
                    value={stat.number}
                    onChange={(e) => handleUpdateStat(index, 'number', e.target.value)}
                    style={{...styles.inputSmall, width: '120px'}}
                    placeholder="Number (e.g., 500+)"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => handleUpdateStat(index, 'label', e.target.value)}
                    style={{...styles.inputSmall, flex: 1}}
                    placeholder="Label (e.g., Organizations)"
                  />
                  <button
                    style={{...styles.iconBtn, ...styles.dangerIcon}}
                    onClick={() => handleDeleteStat(index)}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button style={styles.addBtn} onClick={handleAddStat}>
              <FiPlus size={16} /> Add Statistic
            </button>
          </div>

          {/* Hero Images (Carousel) */}
          <div style={styles.subSection}>
            <h3 style={styles.subSectionTitle}>
              <FiImage size={14} /> Hero Background Images (Carousel)
            </h3>
            <p style={styles.helperText}>
              These images will rotate automatically every 5 seconds on the homepage hero section.
            </p>
            
            {/* Upload new image */}
            <div style={styles.uploadSection}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                onChange={(e) => setHeroImageFile(e.target.files[0])}
                style={styles.fileInput}
              />
              <button 
                style={styles.uploadBtn} 
                onClick={handleUploadHeroImage} 
                disabled={!heroImageFile || uploading}
              >
                <FiUpload size={14} /> {uploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>

            {/* List existing images */}
            <div style={styles.imagesList}>
              {(hero.images || []).length === 0 ? (
                <div style={styles.emptyImages}>
                  <FiImage size={32} />
                  <p>No hero images uploaded yet. Upload at least one image for the carousel.</p>
                </div>
              ) : (
                (hero.images || []).map((img, index) => (
                  <div key={img._id || index} style={styles.imageCard}>
                    <img 
                      src={img.url.startsWith('http') ? img.url : `${API_BASE_URL}${img.url}`} 
                      alt={`Hero ${index + 1}`}
                      style={styles.imagePreview}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/80x50?text=Error'; }}
                    />
                    <div style={styles.imageInfo}>
                      <div style={styles.imageName}>{img.url?.split('/').pop() || 'Image'}</div>
                      {img.isActive && <span style={styles.activeBadge}>● Active</span>}
                    </div>
                    <div style={styles.imageActions}>
                      {!img.isActive && (
                        <button 
                          style={styles.iconBtn} 
                          onClick={() => handleSetActiveHeroImage(img._id)} 
                          title="Set as Active"
                        >
                          <FiStar size={14} />
                        </button>
                      )}
                      <button 
                        style={{...styles.iconBtn, ...styles.dangerIcon}} 
                        onClick={() => handleDeleteHeroImage(img._id)}
                        title="Delete"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* HOW IT WORKS SECTION */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <FiTrendingUp size={18} /> How It Works Section
          </h2>
          <div style={styles.formGroup}>
            <label style={styles.label}>Section Title</label>
            <input
              type="text"
              value={howItWorks.title}
              onChange={(e) => handleHowItWorksChange('title', e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.subSection}>
            <h3 style={styles.subSectionTitle}>Steps</h3>
            <div style={styles.stepsList}>
              {(howItWorks.steps || []).map((step, index) => (
                <div key={step.id || index} style={styles.stepCard}>
                  {editingStep === index ? (
                    <div style={styles.editStepForm}>
                      <input
                        type="text"
                        defaultValue={step.number}
                        placeholder="Step number (e.g., 01)"
                        style={styles.inputSmall}
                        autoFocus
                        onBlur={(e) => handleUpdateStep(index, 'number', e.target.value)}
                      />
                      <input
                        type="text"
                        defaultValue={step.title}
                        placeholder="Step title"
                        style={styles.inputSmall}
                        onBlur={(e) => handleUpdateStep(index, 'title', e.target.value)}
                      />
                      <textarea
                        defaultValue={step.description}
                        placeholder="Step description"
                        style={styles.textareaSmall}
                        rows={2}
                        onBlur={(e) => handleUpdateStep(index, 'description', e.target.value)}
                      />
                      <input
                        type="text"
                        defaultValue={step.icon}
                        placeholder="Icon name"
                        style={styles.inputSmall}
                        onBlur={(e) => handleUpdateStep(index, 'icon', e.target.value)}
                      />
                    </div>
                  ) : (
                    <>
                      <div style={styles.stepContent}>
                        <div style={styles.stepNumber}>{step.number}</div>
                        <div style={styles.stepInfo}>
                          <strong>{step.title}</strong>
                          <p>{step.description}</p>
                          <small style={{ color: '#D23A01' }}>Icon: {step.icon}</small>
                        </div>
                      </div>
                      <div style={styles.stepActions}>
                        <button style={styles.iconBtn} onClick={() => setEditingStep(index)}><FiEdit2 size={14} /></button>
                        <button style={{...styles.iconBtn, ...styles.dangerIcon}} onClick={() => handleDeleteStep(index)}><FiTrash2 size={14} /></button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div style={styles.addStepForm}>
              <input
                type="text"
                placeholder="Step number"
                value={newStep.number}
                onChange={(e) => setNewStep({ ...newStep, number: e.target.value })}
                style={{...styles.inputSmall, width: '80px'}}
              />
              <input
                type="text"
                placeholder="Step title"
                value={newStep.title}
                onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                style={styles.inputSmall}
              />
              <textarea
                placeholder="Step description"
                value={newStep.description}
                onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                style={styles.textareaSmall}
                rows={2}
              />
              <input
                type="text"
                placeholder="Icon name"
                value={newStep.icon}
                onChange={(e) => setNewStep({ ...newStep, icon: e.target.value })}
                style={styles.inputSmall}
              />
              <button style={styles.addBtn} onClick={handleAddStep} disabled={!newStep.title || !newStep.description}>
                <FiPlus size={16} /> Add Step
              </button>
            </div>
          </div>
        </div>

        {/* ABOUT SECTION */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <FiInfo size={18} /> About ECMS
          </h2>
          
          <div style={styles.aboutForm}>
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Platform Display Name</label>
                <input
                  type="text"
                  value={about.platformName || ''}
                  onChange={(e) => handleAboutChange('platformName', e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Platform Description</label>
              <textarea
                value={about.description || ''}
                onChange={(e) => handleAboutChange('description', e.target.value)}
                style={styles.textarea}
                rows={4}
                placeholder="Describe what your platform does..."
              />
            </div>

            {/* Features Section */}
            <div style={styles.subSection}>
              <h3 style={styles.subSectionTitle}>Key Features</h3>
              <div style={styles.featuresList}>
                {(about.features || []).map((feature, index) => (
                  <div key={feature.id || index} style={styles.featureCard}>
                    {editingFeature === index ? (
                      <div style={styles.editFeatureForm}>
                        <input
                          type="text"
                          defaultValue={feature.title}
                          placeholder="Feature title"
                          style={styles.inputSmall}
                          autoFocus
                          onBlur={(e) => handleUpdateFeature(index, 'title', e.target.value)}
                        />
                        <textarea
                          defaultValue={feature.description}
                          placeholder="Feature description"
                          style={styles.textareaSmall}
                          rows={2}
                          onBlur={(e) => handleUpdateFeature(index, 'description', e.target.value)}
                        />
                      </div>
                    ) : (
                      <>
                        <div style={styles.featureContent}>
                          <strong>{feature.title}</strong>
                          <p>{feature.description}</p>
                        </div>
                        <div style={styles.featureActions}>
                          <button style={styles.iconBtn} onClick={() => setEditingFeature(index)} title="Edit">
                            <FiEdit2 size={14} />
                          </button>
                          <button style={{ ...styles.iconBtn, ...styles.dangerIcon }} onClick={() => handleDeleteFeature(index)} title="Delete">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Add New Feature */}
              <div style={styles.addFeatureForm}>
                <input
                  type="text"
                  placeholder="Feature title"
                  value={newFeature.title}
                  onChange={(e) => setNewFeature({ ...newFeature, title: e.target.value })}
                  style={styles.inputSmall}
                />
                <textarea
                  placeholder="Feature description"
                  value={newFeature.description}
                  onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                  style={styles.textareaSmall}
                  rows={2}
                />
                <button 
                  style={styles.addBtn}
                  onClick={handleAddFeature}
                  disabled={!newFeature.title || !newFeature.description}
                >
                  <FiPlus size={16} /> Add Feature
                </button>
              </div>
            </div>

            {/* CTA Section for About */}
            <div style={styles.subSection}>
              <h3 style={styles.subSectionTitle}>Call to Action Section</h3>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>CTA Title</label>
                  <input
                    type="text"
                    value={about.ctaTitle || ''}
                    onChange={(e) => handleAboutChange('ctaTitle', e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>CTA Text</label>
                  <textarea
                    value={about.ctaText || ''}
                    onChange={(e) => handleAboutChange('ctaText', e.target.value)}
                    style={styles.textarea}
                    rows={2}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>CTA Button Text</label>
                  <input
                    type="text"
                    value={about.ctaButtonText || ''}
                    onChange={(e) => handleAboutChange('ctaButtonText', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div style={styles.subSection}>
              <h3 style={styles.subSectionTitle}>Contact Information</h3>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.label}><FiMail size={14} /> Contact Email</label>
                  <input
                    type="email"
                    value={about.contactEmail || ''}
                    onChange={(e) => handleAboutChange('contactEmail', e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}><FiPhone size={14} /> Contact Phone</label>
                  <input
                    type="text"
                    value={about.contactPhone || ''}
                    onChange={(e) => handleAboutChange('contactPhone', e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}><FiMapPin size={14} /> Contact Address</label>
                  <input
                    type="text"
                    value={about.contactAddress || ''}
                    onChange={(e) => handleAboutChange('contactAddress', e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}><FiGlobe size={14} /> Website URL</label>
                  <input
                    type="url"
                    value={about.website || ''}
                    onChange={(e) => handleAboutChange('website', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER SETTINGS */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <FiLink size={18} /> Footer Settings
          </h2>
          <div style={styles.formGroup}>
            <label style={styles.label}>Copyright Text</label>
            <input
              type="text"
              value={footer.copyright}
              onChange={(e) => handleFooterChange('copyright', e.target.value)}
              style={styles.input}
            />
          </div>
          
          {/* Footer Links */}
          <div style={styles.subSection}>
            <h3 style={styles.subSectionTitle}>Footer Links</h3>
            <div style={styles.linksList}>
              {(footer.links || []).map((link, index) => (
                <div key={index} style={styles.linkCard}>
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleUpdateLink(index, 'label', e.target.value)}
                    style={{...styles.inputSmall, flex: 1}}
                    placeholder="Link Label"
                  />
                  <input
                    type="text"
                    value={link.path}
                    onChange={(e) => handleUpdateLink(index, 'path', e.target.value)}
                    style={{...styles.inputSmall, flex: 1}}
                    placeholder="Link Path (e.g., /privacy)"
                  />
                  <button
                    style={{...styles.iconBtn, ...styles.dangerIcon}}
                    onClick={() => handleDeleteLink(index)}
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button style={styles.addBtn} onClick={handleAddLink}>
              <FiPlus size={16} /> Add Footer Link
            </button>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Reset to Default Settings?</h3>
            <p>This will revert all settings to their default values. This action cannot be undone.</p>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowResetConfirm(false)}>Cancel</button>
              <button style={styles.confirmBtn} onClick={confirmReset}>Yes, Reset All</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: { 
    padding: '32px', 
    maxWidth: '1200px', 
    margin: '0 auto', 
    minHeight: '100vh',
    background: '#f8fafc'
  },
  loaderContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '400px', 
    gap: '16px' 
  },
  spinner: { 
    width: '48px', 
    height: '48px', 
    border: '3px solid #e2e8f0', 
    borderTop: `3px solid #D23A01`, 
    borderRadius: '50%', 
    animation: 'spin 1s linear infinite' 
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '32px', 
    flexWrap: 'wrap', 
    gap: '16px' 
  },
  title: { 
    fontSize: '28px', 
    fontWeight: '700', 
    color: '#023430', 
    marginBottom: '8px' 
  },
  subtitle: { 
    fontSize: '14px', 
    color: '#64748b' 
  },
  headerActions: { 
    display: 'flex', 
    gap: '12px' 
  },
  saveBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '10px 24px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  resetBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '10px 20px', 
    background: '#f1f5f9', 
    border: '1px solid #e2e8f0', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: '500', 
    color: '#475569',
    transition: 'all 0.2s'
  },
  content: { 
    background: 'white', 
    borderRadius: '16px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
    padding: '24px' 
  },
  section: { 
    marginBottom: '40px',
    paddingBottom: '32px',
    borderBottom: '1px solid #e2e8f0'
  },
  sectionTitle: { 
    fontSize: '18px', 
    fontWeight: '600', 
    color: '#023430', 
    marginBottom: '20px', 
    paddingBottom: '12px', 
    borderBottom: `2px solid #D23A01`,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
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
    display: 'block', 
    fontWeight: '500', 
    marginBottom: '8px', 
    color: '#1e293b',
    fontSize: '13px'
  },
  input: { 
    width: '100%', 
    padding: '10px 12px', 
    border: '1px solid #e2e8f0', 
    borderRadius: '8px', 
    fontSize: '14px',
    transition: 'all 0.2s',
    outline: 'none'
  },
  textarea: { 
    width: '100%', 
    padding: '10px 12px', 
    border: '1px solid #e2e8f0', 
    borderRadius: '8px', 
    fontSize: '14px', 
    fontFamily: 'inherit', 
    resize: 'vertical',
    outline: 'none'
  },
  aboutForm: {
    marginTop: '0'
  },
  subSection: {
    marginTop: '24px',
    paddingTop: '16px',
    borderTop: '1px solid #e2e8f0'
  },
  subSectionTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#023430',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  helperText: {
    fontSize: '12px',
    color: '#64748b',
    marginBottom: '16px'
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px'
  },
  featureCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '12px 16px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  featureContent: {
    flex: 1,
    '& strong': {
      display: 'block',
      marginBottom: '4px',
      color: '#023430'
    },
    '& p': {
      margin: 0,
      fontSize: '13px',
      color: '#475569'
    }
  },
  featureActions: {
    display: 'flex',
    gap: '8px',
    marginLeft: '12px'
  },
  editFeatureForm: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  addFeatureForm: {
    marginTop: '12px',
    padding: '16px',
    background: '#f1f5f9',
    borderRadius: '10px',
    border: `1px dashed #D23A01`
  },
  statsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px'
  },
  statCard: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  uploadSection: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  fileInput: {
    flex: 1,
    padding: '8px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white'
  },
  uploadBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 20px',
    background: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  imagesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  emptyImages: {
    textAlign: 'center',
    padding: '40px',
    background: '#f8fafc',
    borderRadius: '10px',
    color: '#94a3b8'
  },
  imageCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  imagePreview: {
    width: '80px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '8px'
  },
  imageInfo: {
    flex: 1
  },
  imageName: {
    fontSize: '12px',
    color: '#475569',
    marginBottom: '4px'
  },
  activeBadge: {
    fontSize: '11px',
    color: '#D23A01',
    fontWeight: '500'
  },
  imageActions: {
    display: 'flex',
    gap: '8px'
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px'
  },
  stepCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '12px 16px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  stepContent: {
    display: 'flex',
    gap: '16px',
    flex: 1
  },
  stepNumber: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#D23A01',
    minWidth: '50px'
  },
  stepInfo: {
    flex: 1,
    '& strong': {
      display: 'block',
      marginBottom: '4px',
      color: '#023430'
    },
    '& p': {
      margin: '0 0 4px 0',
      fontSize: '13px',
      color: '#475569'
    }
  },
  stepActions: {
    display: 'flex',
    gap: '8px',
    marginLeft: '12px'
  },
  editStepForm: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  addStepForm: {
    marginTop: '12px',
    padding: '16px',
    background: '#f1f5f9',
    borderRadius: '10px',
    border: `1px dashed #D23A01`,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  linksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px'
  },
  linkCard: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '1px solid #e2e8f0'
  },
  addBtn: {
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
    fontWeight: '500',
    transition: 'all 0.2s'
  },
  inputSmall: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  textareaSmall: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '13px',
    fontFamily: 'inherit',
    resize: 'vertical',
    outline: 'none'
  },
  iconBtn: {
    padding: '6px',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#64748b',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
    '&:hover': {
      background: '#e2e8f0'
    }
  },
  dangerIcon: {
    '&:hover': {
      color: '#dc2626',
      background: '#fee2e2'
    }
  },
  modalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    background: 'rgba(0,0,0,0.5)', 
    zIndex: 1000, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  modal: { 
    background: 'white', 
    borderRadius: '16px', 
    padding: '24px', 
    maxWidth: '400px', 
    width: '90%' 
  },
  modalActions: { 
    display: 'flex', 
    gap: '12px', 
    marginTop: '20px' 
  },
  cancelBtn: { 
    flex: 1, 
    padding: '10px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer',
    fontWeight: '500'
  },
  confirmBtn: { 
    flex: 1, 
    padding: '10px', 
    background: '#dc2626', 
    color: 'white', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer',
    fontWeight: '500'
  }
};

export default SystemSettings;