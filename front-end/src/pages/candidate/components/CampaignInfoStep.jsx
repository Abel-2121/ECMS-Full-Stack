// pages/candidate/components/CampaignInfoStep.jsx
import React, { useRef, useState } from 'react';
import { FiArrowLeft, FiArrowRight, FiPlus, FiFileText, FiX, FiCamera, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { securityValidators } from '../../../utils/validators';

export const CampaignInfoStep = ({ 
  selectedPosition, 
  formData, 
  onUpdateFormData, 
  onAddDocument, 
  onRemoveDocument, 
  documentTypes, 
  onBack, 
  onContinue,
  fieldErrors = {}
}) => {
  const photoInputRef = useRef(null);
  const docInputRef = useRef(null);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [tempFile, setTempFile] = useState(null);
  const [showDocTypeDropdown, setShowDocTypeDropdown] = useState(false);
  const [localErrors, setLocalErrors] = useState({});
  const [touched, setTouched] = useState({});

  const photoPreview = formData.campaignPhoto ? URL.createObjectURL(formData.campaignPhoto) : null;

  const getWordCount = (text) => {
    if (!text) return 0;
    return securityValidators.getWordCount(text);
  };

  const manifestoWordCount = getWordCount(formData.manifesto);
  const biographyWordCount = getWordCount(formData.biography);
  const sloganWordCount = getWordCount(formData.slogan);

  // Validation using securityValidators
  const validateManifesto = (value) => {
    const error = securityValidators.isValidManifesto(value);
    return error;
  };

  const validateBiography = (value) => {
    const error = securityValidators.isValidBiography(value);
    return error;
  };

  const validateSlogan = (value) => {
    const error = securityValidators.isValidSlogan(value);
    return error;
  };

  const validatePhoto = (file) => {
    const error = securityValidators.isValidImageFile(file, 5);
    return error;
  };

  const isManifestoValid = !validateManifesto(formData.manifesto);
  const isBiographyValid = !validateBiography(formData.biography);
  const isSloganValid = !validateSlogan(formData.slogan);

  const getManifestoError = () => {
    if (!touched.manifesto) return '';
    return validateManifesto(formData.manifesto) || '';
  };

  const getBiographyError = () => {
    if (!touched.biography) return '';
    return validateBiography(formData.biography) || '';
  };

  const getSloganError = () => {
    if (!touched.slogan) return '';
    return validateSlogan(formData.slogan) || '';
  };

  const isFormValid = () => {
    return isManifestoValid && 
           isBiographyValid && 
           isSloganValid &&
           formData.campaignPhoto !== null;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const error = validatePhoto(file);
      if (error) {
        alert(error);
        return;
      }
      onUpdateFormData({ campaignPhoto: file });
    }
  };

  const handleDocumentSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Document must be less than 5MB');
        return;
      }
      setTempFile(file);
      setShowDocTypeDropdown(true);
    }
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const handleConfirmDocument = () => {
    if (tempFile && selectedDocType) {
      onAddDocument(tempFile, selectedDocType);
      setTempFile(null);
      setSelectedDocType('');
      setShowDocTypeDropdown(false);
    } else {
      alert('Please select a document type');
    }
  };

  const handleCancelDocument = () => {
    setTempFile(null);
    setSelectedDocType('');
    setShowDocTypeDropdown(false);
  };

  const getProgressPercentage = () => {
    let completed = 0;
    if (formData.manifesto && isManifestoValid) completed++;
    if (formData.biography && isBiographyValid) completed++;
    if (formData.slogan && isSloganValid) completed++;
    if (formData.campaignPhoto) completed++;
    return (completed / 4) * 100;
  };

  const displayError = (field) => {
    return fieldErrors[field] || (touched[field] && localErrors[field]);
  };

  return (
    <div style={styles.card}>
      <div style={styles.backNav}>
        <button style={styles.backBtn} onClick={onBack}>
          <FiArrowLeft size={16} /> Back to Positions
        </button>
        <h3 style={styles.positionTitle}>Campaign Information for: {selectedPosition.positionName}</h3>
        <p style={styles.requiredHint}>All fields with <span style={styles.requiredStar}>*</span> are required</p>
      </div>
      
      {/* Progress Indicator */}
      <div style={styles.progressSection}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${getProgressPercentage()}%` }} />
        </div>
        <span style={styles.progressText}>{Math.round(getProgressPercentage())}% Complete</span>
      </div>
      
      {/* Manifesto */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Manifesto <span style={styles.requiredStar}>*</span>
        </label>
        <textarea 
          value={formData.manifesto} 
          onChange={(e) => onUpdateFormData({ manifesto: e.target.value })}
          onBlur={() => handleBlur('manifesto')}
          rows={6} 
          style={{
            ...styles.textarea,
            borderColor: displayError('manifesto') ? '#dc2626' : '#969aa3'
          }} 
          placeholder="Describe your goals, promises, and what you plan to achieve if elected... (15-60 words)"
        />
        <div style={styles.wordCountContainer}>
          <span style={{
            ...styles.wordCount,
            color: manifestoWordCount > 0 ? (isManifestoValid ? '#10b981' : '#dc2626') : '#6d727c'
          }}>
            <FiFileText size={12} /> {manifestoWordCount} / 60 words (minimum 15)
          </span>
          {displayError('manifesto') && (
            <span style={styles.errorText}>
              <FiAlertCircle size={12} /> {fieldErrors.manifesto || getManifestoError()}
            </span>
          )}
        </div>
      </div>
      
      {/* Biography */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Biography <span style={styles.requiredStar}>*</span>
        </label>
        <textarea 
          value={formData.biography} 
          onChange={(e) => onUpdateFormData({ biography: e.target.value })}
          onBlur={() => handleBlur('biography')}
          rows={4} 
          style={{
            ...styles.textarea,
            borderColor: displayError('biography') ? '#dc2626' : '#e5e7eb'
          }} 
          placeholder="Tell voters about your background, qualifications, and experience... (15-40 words)"
        />
        <div style={styles.wordCountContainer}>
          <span style={{
            ...styles.wordCount,
            color: biographyWordCount > 0 ? (isBiographyValid ? '#10b981' : '#dc2626') : '#707a8a'
          }}>
            <FiFileText size={12} /> {biographyWordCount} / 40 words (minimum 15)
          </span>
          {displayError('biography') && (
            <span style={styles.errorText}>
              <FiAlertCircle size={12} /> {fieldErrors.biography || getBiographyError()}
            </span>
          )}
        </div>
      </div>
      
      {/* Slogan */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Slogan <span style={styles.requiredStar}>*</span>
        </label>
        <input 
          value={formData.slogan} 
          onChange={(e) => onUpdateFormData({ slogan: e.target.value })}
          onBlur={() => handleBlur('slogan')}
          style={{
            ...styles.input,
            borderColor: displayError('slogan') ? '#dc2626' : '#3e4044'
          }} 
          placeholder="Your campaign slogan (e.g., 'Vote for Change!') (2-5 words)" 
        />
        <div style={styles.wordCountContainer}>
          <span style={{
            ...styles.wordCount,
            color: formData.slogan ? (isSloganValid ? '#10b981' : '#dc2626') : '#292a2c'
          }}>
            <FiCheckCircle size={12} /> {sloganWordCount} / 5 words (minimum 2)
          </span>
          {displayError('slogan') && (
            <span style={styles.errorText}>
              <FiAlertCircle size={12} /> {fieldErrors.slogan || getSloganError()}
            </span>
          )}
        </div>
      </div>
      
      {/* Campaign Photo */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Campaign Photo <span style={styles.requiredStar}>*</span>
        </label>
        <div style={styles.photoUploadContainer}>
          <input 
            ref={photoInputRef}
            type="file" 
            accept="image/*" 
            onChange={handlePhotoChange} 
            style={{ display: 'none' }} 
            id="photo-upload" 
          />
          
          {!formData.campaignPhoto ? (
            <div 
              style={styles.photoSquareBox}
              onClick={() => photoInputRef.current.click()}
            >
              <FiCamera size={36} color="#D23A01" />
              <span style={styles.photoUploadText}>Click to upload photo</span>
              <small style={styles.photoHint}>JPG, PNG, GIF (Max 5MB)</small>
            </div>
          ) : (
            <div style={styles.photoPreviewContainer}>
              <div style={styles.photoSquareBox}>
                <img src={photoPreview} alt="Campaign" style={styles.photoPreview} />
                <div style={styles.photoOverlay}>
                  <button 
                    onClick={() => photoInputRef.current.click()}
                    style={styles.photoChangeBtn}
                  >
                    <FiCamera size={14} /> Change
                  </button>
                  <button 
                    onClick={() => onUpdateFormData({ campaignPhoto: null })}
                    style={styles.photoRemoveBtn}
                  >
                    <FiX size={14} /> Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        {fieldErrors.campaignPhoto && !formData.campaignPhoto && (
          <span style={styles.errorText}>{fieldErrors.campaignPhoto}</span>
        )}
      </div>
      
      {/* Supporting Documents */}
      <div style={styles.formGroup}>
        <label style={styles.label}>Supporting Documents <span style={styles.optionalStar}>(Optional, Max 5MB each)</span></label>
        <div style={styles.fileUpload}>
          <input 
            ref={docInputRef}
            type="file" 
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
            onChange={handleDocumentSelect} 
            style={{ display: 'none' }} 
            id="doc-upload" 
          />
          <label htmlFor="doc-upload" style={styles.uploadLabel}>
            <FiPlus size={16} /> Add Document
          </label>
        </div>

        {/* Document Type Dropdown Modal */}
        {showDocTypeDropdown && tempFile && (
          <div style={styles.dropdownOverlay}>
            <div style={styles.dropdownModal}>
              <h4 style={styles.dropdownTitle}>Select Document Type</h4>
              <p style={styles.dropdownFile}>{tempFile.name}</p>
              
              <select 
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                style={styles.dropdownSelect}
              >
                <option value="">-- Select Document Type --</option>
                <option value="nomination_form">Nomination Form</option>
                <option value="transcript">Academic Transcript</option>
                <option value="noc">No Objection Certificate (NOC)</option>
                <option value="recommendation_letter">Recommendation Letter</option>
                <option value="other">Other Document</option>
              </select>
              
              <div style={styles.dropdownActions}>
                <button 
                  onClick={handleCancelDocument}
                  style={styles.dropdownCancelBtn}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDocument}
                  style={styles.dropdownConfirmBtn}
                >
                  Add Document
                </button>
              </div>
            </div>
          </div>
        )}

        {formData.supportingDocuments.length > 0 && (
          <div style={styles.documentList}>
            {formData.supportingDocuments.map((doc, idx) => (
              <div key={idx} style={styles.documentItem}>
                <FiFileText size={16} color="#D23A01" />
                <div style={styles.documentInfo}>
                  <span style={styles.documentName}>{doc.name}</span>
                  <span style={styles.documentTypeBadge}>
                    {documentTypes[idx]?.replace('_', ' ').toUpperCase() || 'OTHER'}
                  </span>
                </div>
                <button type="button" onClick={() => onRemoveDocument(idx)} style={styles.removeDocBtn}>
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button style={styles.secondaryBtn} onClick={onBack}>
          Back
        </button>
        <button 
          style={{
            ...styles.primaryBtn,
            opacity: !isFormValid() ? 0.5 : 1,
            cursor: !isFormValid() ? 'not-allowed' : 'pointer'
          }} 
          onClick={onContinue}
          disabled={!isFormValid()}
        >
          Continue <FiArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: { 
    background: 'white', 
    borderRadius: '20px', 
    padding: 'clamp(20px, 4vw, 28px)', 
    marginBottom: '24px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    border: '1px solid #e5e7eb'
  },
  backNav: { 
    marginBottom: '24px' 
  },
  backBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '6px', 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    color: '#000000', 
    marginBottom: '12px',
    fontSize: '14px',
    fontWeight: '500',
    padding: 0,
    
  },
  positionTitle: {
    fontSize: 'clamp(18px, 4vw, 20px)',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '6px',
    
  },
  requiredHint: {
    fontSize: '12px',
    color: '#0d0e0f',
    marginTop: '4px',
    
  },
  requiredStar: {
    color: '#dc2626',
    fontSize: '14px'
  },
  optionalStar: {
    color: '#000000',
    fontSize: '12px',
    fontWeight: '400'
  },
  formGroup: { 
    marginBottom: '24px' 
  },
  label: { 
    display: 'block', 
    fontWeight: '700', 
    marginBottom: '8px', 
    color: '#1a1a1a',
    fontSize: '14px',
    
  },
  input: { 
    width: '100%', 
    padding: '12px 16px', 
    border: '2px solid #e5e7eb', 
    borderRadius: '12px', 
    fontSize: '14px', 
    transition: 'border-color 0.2s',
    outline: 'none'
  },
  textarea: { 
    width: '100%', 
    padding: '12px 16px', 
    border: '2px solid #e5e7eb', 
    borderRadius: '12px', 
    resize: 'vertical', 
    fontSize: '14px', 
    outline: 'none'
  },
  wordCountContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: '8px'
  },
  wordCount: {
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    
  },
  errorText: {
    fontSize: '11px',
    color: '#dc2626',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    
  },
  
  // Progress Section
  progressSection: {
    marginBottom: '24px',
    padding: '16px',
    background: '#f8fafc',
    borderRadius: '12px'
  },
  progressBar: {
    height: '6px',
    background: '#e5e7eb',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  progressFill: {
    height: '100%',
    background: '#D23A01',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  },
  progressText: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#D23A01',
    
  },
  
  // Photo Styles
  photoUploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },
  photoSquareBox: {
    width: '200px',
    height: '200px',
    border: '2px dashed #808488',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#f8fafc',
    position: 'relative',
    overflow: 'hidden'
  },
  photoUploadText: {
    fontSize: '12px',
    color: '#000000',
    marginTop: '8px',
    
  },
  photoHint: {
    fontSize: '10px',
    color: '#000000',
    marginTop: '4px',
    
  },
  photoPreviewContainer: {
    position: 'relative'
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    gap: '8px',
    padding: '8px',
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center'
  },
  photoChangeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '600',
    
  },
  photoRemoveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '600',
    
  },
  
  // Document Styles
  fileUpload: { 
    display: 'flex', 
    gap: '12px', 
    alignItems: 'center' 
  },
  uploadLabel: { 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '8px', 
    padding: '10px 18px', 
    background: '#f1f5f9', 
    borderRadius: '10px', 
    cursor: 'pointer', 
    fontSize: '13px',
    fontWeight: '600',
    color: '#000000',
    transition: 'all 0.2s'
  },
  documentList: { 
    marginTop: '12px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px' 
  },
  documentItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '10px 14px', 
    background: '#f8fafc', 
    borderRadius: '10px', 
    border: '1px solid #686a6e'
  },
  documentInfo: { 
    flex: 1, 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px',
    flexWrap: 'wrap'
  },
  documentName: { 
    fontSize: '13px',
    fontWeight: '500',
    color: '#1a1a1a',
    
  },
  documentTypeBadge: { 
    fontSize: '10px', 
    padding: '2px 8px', 
    background: '#D23A0110', 
    color: '#D23A01', 
    borderRadius: '12px',
    fontWeight: '600',
    
  },
  removeDocBtn: { 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    color: '#ef4444', 
    display: 'flex', 
    alignItems: 'center', 
    padding: '4px' 
  },
  
  // Dropdown Modal
  dropdownOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  dropdownModal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '24px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
  },
  dropdownTitle: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#1a1a1a',
    
  },
  dropdownFile: {
    fontSize: '13px',
    color: '#45484e',
    marginBottom: '16px',
    padding: '10px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    wordBreak: 'break-all',
    
  },
  dropdownSelect: {
    width: '100%',
    padding: '12px',
    border: '2px solid #6d7077',
    borderRadius: '10px',
    fontSize: '14px',
    marginBottom: '20px',
    outline: 'none'
  },
  dropdownActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  dropdownCancelBtn: {
    padding: '10px 18px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#030303',
    fontWeight: '600',
    fontSize: '13px',
    
  },
  dropdownConfirmBtn: {
    padding: '10px 18px',
    backgroundColor: '#D23A01',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    color: 'white',
    fontWeight: '700',
    fontSize: '13px',
    
  },
  
  // Action Buttons
  actionButtons: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    marginTop: '24px',
    gap: '16px'
  },
  primaryBtn: { 
    flex: 1,
    padding: '12px 24px', 
    background: '#D23A01', 
    color: 'white', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: '700', 
    fontSize: '14px',
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: '8px',
    transition: 'background 0.2s'
  },
  secondaryBtn: { 
    flex: 1,
    padding: '12px 24px', 
    background: '#f1f5f9', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#000000',
    transition: 'all 0.2s'
  }
};

// Responsive styles
const responsiveStyles = document.createElement('style');
responsiveStyles.textContent = `
  @media (max-width: 640px) {
    .upload-label {
      width: 100%;
      justify-content: center;
    }
    .action-buttons {
      flex-direction: column;
    }
    .primary-btn, .secondary-btn {
      width: 100%;
    }
    .document-info {
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;
if (!document.head.querySelector('#campaign-info-styles')) {
  responsiveStyles.id = 'campaign-info-styles';
  document.head.appendChild(responsiveStyles);
}

export default CampaignInfoStep;