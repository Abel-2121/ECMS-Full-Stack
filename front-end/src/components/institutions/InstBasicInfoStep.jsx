import React, { useState } from 'react';
import { FiHome, FiMail, FiPhone, FiMapPin, FiCode, FiFileText } from 'react-icons/fi';
import { securityValidators } from '../../utils/validators';

const InstBasicInfoStep = ({ data, onChange }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateName = (value) => {
    const error = securityValidators.isValidInstitutionName(value);
    return error;
  };

  const validateCode = (value) => {
    const error = securityValidators.isValidInstitutionCode(value);
    return error;
  };

  const validateEmail = (value) => {
    const error = securityValidators.isValidEmail(value);
    return error;
  };

  const validatePhone = (value) => {
    const error = securityValidators.isValidPhone(value);
    return error;
  };

  const validateAddress = (value) => {
    const error = securityValidators.isValidInstitutionAddress(value);
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let error = null;

    switch (field) {
      case 'name':
        error = validateName(value);
        break;
      case 'code':
        error = validateCode(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validatePhone(value);
        break;
      case 'address':
        error = validateAddress(value);
        break;
      default:
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const showError = (field) => {
    return touched[field] && errors[field];
  };

  return (
    <div>
      <h2 style={styles.title}>Institution Details</h2>
      <p style={styles.subtitle}>Enter the basic information about the institution</p>

      <div style={styles.formContainer}>
        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <FiHome size={16} /> Institution Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={data.name}
              onChange={handleChange}
              onBlur={(e) => handleBlur('name', e.target.value)}
              placeholder="e.g., Addis Ababa University"
              style={{
                ...styles.input,
                ...(showError('name') ? styles.inputError : {})
              }}
              required
            />
            {showError('name') && (
              <span style={styles.fieldError}>{errors.name}</span>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <FiCode size={16} /> Institution Code <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="code"
              value={data.code}
              onChange={handleChange}
              onBlur={(e) => handleBlur('code', e.target.value)}
              placeholder="e.g., AAU"
              style={{
                ...styles.input,
                ...(showError('code') ? styles.inputError : {})
              }}
              required
            />
            {showError('code') && (
              <span style={styles.fieldError}>{errors.code}</span>
            )}
          </div>
        </div>

        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <FiMail size={16} /> Institution Email <span style={styles.required}>*</span>
            </label>
            <input
              type="email"
              name="email"
              value={data.email}
              onChange={handleChange}
              onBlur={(e) => handleBlur('email', e.target.value)}
              placeholder="admin@institution.edu"
              style={{
                ...styles.input,
                ...(showError('email') ? styles.inputError : {})
              }}
              required
            />
            {showError('email') && (
              <span style={styles.fieldError}>{errors.email}</span>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <FiPhone size={16} /> Phone Number <span style={styles.required}>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={data.phone}
              onChange={handleChange}
              onBlur={(e) => handleBlur('phone', e.target.value)}
              placeholder="+251-XXX-XXX-XXX"
              style={{
                ...styles.input,
                ...(showError('phone') ? styles.inputError : {})
              }}
              required
            />
            {showError('phone') && (
              <span style={styles.fieldError}>{errors.phone}</span>
            )}
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            <FiMapPin size={16} /> Address <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="address"
            value={data.address}
            onChange={handleChange}
            onBlur={(e) => handleBlur('address', e.target.value)}
            placeholder="Full address"
            style={{
              ...styles.input,
              ...(showError('address') ? styles.inputError : {})
            }}
            required
          />
          {showError('address') && (
            <span style={styles.fieldError}>{errors.address}</span>
          )}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            <FiFileText size={16} /> About Institution
          </label>
          <textarea
            name="about"
            value={data.about}
            onChange={handleChange}
            placeholder="Brief description of the institution..."
            rows={4}
            style={styles.textarea}
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  title: { 
    fontSize: '22px', 
    fontWeight: '700', 
    marginBottom: '8px',
    color: '#1a1a1a',
    
  },
  subtitle: { 
    color: '#000000', 
    marginBottom: '28px',
    fontSize: '14px',
    
  },
  formContainer: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px' 
  },
  row: { 
    display: 'grid', 
    gridTemplateColumns: '1fr 1fr', 
    gap: '20px' 
  },
  fieldGroup: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px' 
  },
  label: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    fontSize: '14px', 
    fontWeight: '600', 
    color: '#1a1a1a',
    
  },
  required: { 
    color: '#D23A01', 
    fontSize: '14px' 
  },
  input: { 
    width: '100%', 
    padding: '12px 16px', 
    border: '2px solid #e5e7eb', 
    borderRadius: '12px', 
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s'
  },
  inputError: {
    borderColor: '#dc2626',
    background: '#fef2f2'
  },
  fieldError: {
    display: 'block',
    fontSize: '11px',
    color: '#dc2626',
    marginTop: '4px',
    fontWeight: '500',
    
  },
  textarea: { 
    width: '100%', 
    padding: '12px 16px', 
    border: '2px solid #e5e7eb', 
    borderRadius: '12px', 
    fontSize: '14px',
    resize: 'vertical', 
    outline: 'none',
    transition: 'all 0.2s'
  }
};

export default InstBasicInfoStep;