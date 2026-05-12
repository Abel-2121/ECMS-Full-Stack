// components/elections/BasicInfoStep.jsx
import React, { useState, useEffect } from 'react';
import { FiEdit3, FiInfo, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { securityValidators } from '../../utils/validators';

const BasicInfoStep = ({ data, onChange }) => {
  const [focused, setFocused] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // Use your validators from validators.js
  const validateTitle = (title) => {
    return securityValidators.isValidElectionTitle(title);
  };

  const validateDescription = (description) => {
    if (!description || description.trim() === '') return null;
    return securityValidators.isValidElectionDescription(description);
  };

  useEffect(() => {
    const errors = {};
    const titleError = validateTitle(data.title);
    if (titleError) errors.title = titleError;
    const descError = validateDescription(data.description);
    if (descError) errors.description = descError;
    setValidationErrors(errors);
  }, [data.title, data.description]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
if (name === 'title') {
    processedValue =value
    }

    onChange({ [name]: processedValue });
    if (!touchedFields[name]) {
      setTouchedFields(prev => ({ ...prev, [name]: true }));
    }
  };


  const handleBlur = (fieldName) => {
    setTouchedFields(prev => ({ ...prev, [fieldName]: true }));
  };

  const getFieldError = (fieldName) => {
    return touchedFields[fieldName] && validationErrors[fieldName];
  };

  const getInputStyle = (fieldName) => {
    const hasError = getFieldError(fieldName);
    const isFocused = focused === fieldName;
    const value = data[fieldName];
    
    if (hasError) {
      return {
        ...styles.input,
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2'
      };
    }
    if (touchedFields[fieldName] && value && !hasError && fieldName === 'title') {
      return {
        ...styles.input,
        borderColor: '#10b981',
        backgroundColor: '#f0fdf4'
      };
    }
    return {
      ...styles.input,
      borderColor: isFocused ? '#D23A01' : '#E2E8F0',
      boxShadow: isFocused ? `0 0 0 4px rgba(210, 58, 1, 0.1)` : 'none'
    };
  };

  const getTextareaStyle = () => {
    const hasError = getFieldError('description');
    const isFocused = focused === 'description';
    const value = data.description;
    
    if (hasError) {
      return {
        ...styles.textarea,
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2'
      };
    }
    if (touchedFields.description && value && !hasError) {
      return {
        ...styles.textarea,
        borderColor: '#10b981',
        backgroundColor: '#f0fdf4'
      };
    }
    return {
      ...styles.textarea,
      borderColor: isFocused ? '#D23A01' : '#E2E8F0',
      boxShadow: isFocused ? `0 0 0 4px rgba(210, 58, 1, 0.1)` : 'none'
    };
  };

  const getWordCount = (text) => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const titleLength = data.title?.length || 0;
  const descriptionWordCount = getWordCount(data.description);

  return (
    <div style={styles.stepContainer}>
      <div style={styles.headerSection}>
        <div style={styles.iconCircle}>
          <FiEdit3 size={24} color="#D23A01" />
        </div>
        <div>
          <h3 style={styles.title}>Basic Election Information</h3>
          <p style={styles.subtitle}>Define the foundational identity and purpose of this election cycle.</p>
        </div>
      </div>



      <div style={styles.formContent}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Election Title <span style={styles.required}>*</span>
          </label>
          <div style={styles.inputWrapper}>
            <input
              name="title"
              placeholder="e.g., General Student Council Elections 2024"
              value={data.title || ''}
              onChange={handleChange}
              onFocus={() => setFocused('title')}
              onBlur={() => { setFocused(null); handleBlur('title'); }}
              style={getInputStyle('title')}
              maxLength={100}
            />
            {touchedFields.title && data.title && !validationErrors.title && (
              <div style={styles.inputSuccessIcon}>
                <FiCheckCircle size={18} color="#10b981" />
              </div>
            )}
          </div>
          <div style={styles.charCounter}>
            <span style={{ ...styles.charCountText, color: titleLength > 0 && titleLength < 5 ? '#D23A01' : '#64748b' }}>
              {titleLength} / 100 characters
            </span>
            {titleLength > 0 && titleLength < 5 && (
              <span style={styles.charWarning}>⚠️ Minimum 5 characters required</span>
            )}
            {titleLength >= 5 && titleLength <= 100 && titleLength > 0 && (
              <span style={styles.charSuccess}>✓ Good length</span>
            )}
          </div>
          <p style={styles.helperText}>Use a clear, recognizable name for voters (5-100 characters).</p>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Election Description 
            <span style={styles.optional}>(Optional)</span>
          </label>
          <div style={styles.inputWrapper}>
            <textarea
              name="description"
              placeholder="Provide context about eligibility, positions, and important rules..."
              value={data.description || ''}
              onChange={handleChange}
              onFocus={() => setFocused('description')}
              onBlur={() => { setFocused(null); handleBlur('description'); }}
              rows={6}
              style={getTextareaStyle()}
            />
            {touchedFields.description && data.description && !validationErrors.description && (
              <div style={styles.textareaSuccessIcon}>
                <FiCheckCircle size={18} color="#10b981" />
              </div>
            )}
          </div>
          <div style={styles.wordCounterContainer}>
            <div style={styles.wordCounter}>
              <span style={styles.wordCountText}>
                📝 {descriptionWordCount} / 150 words
              </span>
              {descriptionWordCount > 0 && descriptionWordCount < 5 && (
                <span style={styles.wordWarning}>⚠️ Minimum 5 words recommended</span>
              )}
            </div>
          </div>
          <div style={styles.infoNote}>
            <FiInfo size={14} />
            <p>This description will be visible to all registered voters (5-150 words recommended).</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  stepContainer: { 
    maxWidth: '800px', 
    margin: '0 auto', 
    padding: '20px 0' 
  },
  headerSection: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '20px', 
    marginBottom: '32px', 
    paddingBottom: '24px', 
    borderBottom: '1px solid #F1F5F9' 
  },
  iconCircle: { 
    width: '56px', 
    height: '56px', 
    borderRadius: '16px', 
    backgroundColor: '#FEF3F0', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    flexShrink: 0 
  },
  title: { 
    fontSize: 'clamp(22px, 4vw, 26px)', 
    fontWeight: '800', 
    color: '#1a1a1a', 
    margin: 0 
  },
  subtitle: { 
    fontSize: '15px', 
    color: '#4a5568', 
    margin: '4px 0 0 0', 
    fontWeight: '500' 
  },
  errorSummary: { 
    display: 'flex', 
    gap: '12px', 
    padding: '16px', 
    background: '#fef2f2', 
    borderRadius: '12px', 
    marginBottom: '24px', 
    border: '1px solid #fecaca' 
  },
  errorSummaryContent: { 
    flex: 1 
  },
  errorList: { 
    margin: '8px 0 0 20px', 
    fontSize: '13px', 
    color: '#dc2626' 
  },
  formContent: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '32px' 
  },
  formGroup: { 
    display: 'flex', 
    flexDirection: 'column' 
  },
  label: { 
    fontSize: '16px', 
    fontWeight: '700', 
    color: '#1a1a1a', 
    marginBottom: '10px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px' 
  },
  required: { 
    color: '#D23A01', 
    fontSize: '14px' 
  },
  optional: { 
    color: '#94A3B8', 
    fontSize: '13px', 
    fontWeight: '500' 
  },
  inputWrapper: { 
    width: '100%', 
    position: 'relative' 
  },
  input: { 
    width: '100%', 
    padding: '16px 48px 16px 20px', 
    border: '2px solid #E2E8F0', 
    borderRadius: '14px', 
    fontSize: '16px', 
    fontWeight: '500', 
    color: '#1a1a1a', 
    outline: 'none', 
    transition: 'all 0.2s ease', 
    boxSizing: 'border-box' 
  },
  textarea: { 
    width: '100%', 
    padding: '16px 48px 16px 20px', 
    border: '2px solid #E2E8F0', 
    borderRadius: '14px', 
    fontSize: '16px', 
    fontWeight: '500', 
    color: '#1a1a1a', 
    resize: 'vertical', 
    fontFamily: 'inherit', 
    outline: 'none', 
    transition: 'all 0.2s ease', 
    minHeight: '150px', 
    boxSizing: 'border-box' 
  },
  inputSuccessIcon: { 
    position: 'absolute', 
    right: '16px', 
    top: '50%', 
    transform: 'translateY(-50%)' 
  },
  textareaSuccessIcon: { 
    position: 'absolute', 
    right: '16px', 
    top: '20px' 
  },
  charCounter: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    marginTop: '8px', 
    flexWrap: 'wrap' 
  },
  charCountText: { 
    fontSize: '12px', 
    fontWeight: '500' 
  },
  charWarning: { 
    fontSize: '11px', 
    color: '#D23A01', 
    fontWeight: '500' 
  },
  charSuccess: { 
    fontSize: '11px', 
    color: '#10b981', 
    fontWeight: '500' 
  },
  wordCounterContainer: { 
    marginTop: '8px' 
  },
  wordCounter: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    flexWrap: 'wrap' 
  },
  wordCountText: { 
    fontSize: '12px', 
    fontWeight: '500', 
    color: '#4a5568' 
  },
  wordWarning: { 
    fontSize: '11px', 
    color: '#D23A01', 
    fontWeight: '500' 
  },
  helperText: { 
    fontSize: '13px', 
    color: '#94A3B8', 
    marginTop: '8px', 
    fontWeight: '500' 
  },
  infoNote: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    marginTop: '12px', 
    fontSize: '13px', 
    color: '#D23A01', 
    fontWeight: '600', 
    backgroundColor: '#FEF3F0', 
    padding: '10px 16px', 
    borderRadius: '10px', 
    width: 'fit-content' 
  }
};

export default BasicInfoStep;