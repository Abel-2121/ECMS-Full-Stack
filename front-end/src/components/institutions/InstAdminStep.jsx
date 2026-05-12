import React, { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { securityValidators } from '../../utils/validators';

const InstAdminStep = ({ data, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateName = (value, fieldName) => {
    const error = securityValidators.isValidName(value, fieldName);
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

  const validatePassword = (value) => {
    const error = securityValidators.isStrongPassword(value);
    return error;
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    const error = securityValidators.doPasswordsMatch(password, confirmPassword);
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
      case 'adminFirstName':
        error = validateName(value, 'First name');
        break;
      case 'adminLastName':
        error = validateName(value, 'Last name');
        break;
      case 'adminEmail':
        error = validateEmail(value);
        break;
      case 'adminPhone':
        error = validatePhone(value);
        break;
      case 'adminPassword':
        error = validatePassword(value);
        break;
      case 'adminConfirmPassword':
        error = validateConfirmPassword(data.adminPassword, value);
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
      <h2 style={styles.title}>Admin Account</h2>
      <p style={styles.subtitle}>Create the Election Admin account for this institution</p>

      <div style={styles.formContainer}>
        <div style={styles.row}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <FiUser size={16} /> First Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="adminFirstName"
              value={data.adminFirstName}
              onChange={handleChange}
              onBlur={(e) => handleBlur('adminFirstName', e.target.value)}
              placeholder="John"
              style={{
                ...styles.input,
                ...(showError('adminFirstName') ? styles.inputError : {})
              }}
              required
            />
            {showError('adminFirstName') && (
              <span style={styles.fieldError}>{errors.adminFirstName}</span>
            )}
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>
              <FiUser size={16} /> Last Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="adminLastName"
              value={data.adminLastName}
              onChange={handleChange}
              onBlur={(e) => handleBlur('adminLastName', e.target.value)}
              placeholder="Doe"
              style={{
                ...styles.input,
                ...(showError('adminLastName') ? styles.inputError : {})
              }}
              required
            />
            {showError('adminLastName') && (
              <span style={styles.fieldError}>{errors.adminLastName}</span>
            )}
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            <FiMail size={16} /> Email Address <span style={styles.required}>*</span>
          </label>
          <input
            type="email"
            name="adminEmail"
            value={data.adminEmail}
            onChange={handleChange}
            onBlur={(e) => handleBlur('adminEmail', e.target.value)}
            placeholder="admin@institution.edu"
            style={{
              ...styles.input,
              ...(showError('adminEmail') ? styles.inputError : {})
            }}
            required
          />
          {showError('adminEmail') && (
            <span style={styles.fieldError}>{errors.adminEmail}</span>
          )}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            <FiPhone size={16} /> Phone Number <span style={styles.required}>*</span>
          </label>
          <input
            type="tel"
            name="adminPhone"
            value={data.adminPhone}
            onChange={handleChange}
            onBlur={(e) => handleBlur('adminPhone', e.target.value)}
            placeholder="+251-XXX-XXX-XXX"
            style={{
              ...styles.input,
              ...(showError('adminPhone') ? styles.inputError : {})
            }}
            required
          />
          {showError('adminPhone') && (
            <span style={styles.fieldError}>{errors.adminPhone}</span>
          )}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            <FiLock size={16} /> Password <span style={styles.required}>*</span>
          </label>
          <div style={styles.passwordWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="adminPassword"
              value={data.adminPassword}
              onChange={handleChange}
              onBlur={(e) => handleBlur('adminPassword', e.target.value)}
              placeholder="Minimum 8 characters"
              style={{
                ...styles.input,
                ...(showError('adminPassword') ? styles.inputError : {})
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {showError('adminPassword') && (
            <span style={styles.fieldError}>{errors.adminPassword}</span>
          )}
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>
            <FiLock size={16} /> Confirm Password <span style={styles.required}>*</span>
          </label>
          <div style={styles.passwordWrapper}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="adminConfirmPassword"
              value={data.adminConfirmPassword}
              onChange={handleChange}
              onBlur={(e) => handleBlur('adminConfirmPassword', e.target.value)}
              placeholder="Confirm your password"
              style={{
                ...styles.input,
                ...(showError('adminConfirmPassword') ? styles.inputError : {})
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={styles.eyeButton}
            >
              {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {showError('adminConfirmPassword') && (
            <span style={styles.fieldError}>{errors.adminConfirmPassword}</span>
          )}
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
  passwordWrapper: { 
    position: 'relative' 
  },
  eyeButton: { 
    position: 'absolute', 
    right: '14px', 
    top: '50%', 
    transform: 'translateY(-50%)', 
    background: 'none', 
    border: 'none', 
    cursor: 'pointer', 
    color: '#000000',
    display: 'flex',
    alignItems: 'center'
  }
};

export default InstAdminStep;