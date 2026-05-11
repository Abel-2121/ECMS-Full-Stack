// pages/RequestInstitution.jsx
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FiHome, FiMail, FiPhone, FiMapPin, FiCode, FiFileText, 
  FiCheckCircle, FiAlertCircle, FiLoader, FiSend
} from 'react-icons/fi';
import axiosPrivate from '../utils/axiosPrivate';
import { securityValidators } from '../utils/validators';

const RequestInstitution = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    about: ''
  });

  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});

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

  const validateAbout = (value) => {
    const error = securityValidators.isValidInstitutionDesc(value);
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let errorMsg = null;

    switch (field) {
      case 'name':
        errorMsg = validateName(value);
        break;
      case 'code':
        errorMsg = validateCode(value);
        break;
      case 'email':
        errorMsg = validateEmail(value);
        break;
      case 'phone':
        errorMsg = validatePhone(value);
        break;
      case 'address':
        errorMsg = validateAddress(value);
        break;
      case 'about':
        errorMsg = validateAbout(value);
        break;
      default:
        break;
    }

    setFieldErrors(prev => ({ ...prev, [field]: errorMsg }));
  };

  const validateForm = () => {
    const errors = {};
    
    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;
    
    const codeError = validateCode(formData.code);
    if (codeError) errors.code = codeError;
    
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;
    
    const addressError = validateAddress(formData.address);
    if (addressError) errors.address = addressError;
    
    const aboutError = validateAbout(formData.about);
    if (aboutError) errors.about = aboutError;
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      code: true,
      email: true,
      phone: true,
      address: true,
      about: true
    });
    
    const errors = validateForm();
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      setError('Please fill all required fields correctly');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axiosPrivate.post(`/institution/request`, formData);
      
      if (response.data.status === 'success') {
        setSuccess(true);
        setTimeout(() => navigate('/'), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const showFieldError = (field) => {
    return touched[field] && fieldErrors[field];
  };

  if (success) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>
            <FiCheckCircle size={64} />
          </div>
          <h2 style={styles.successTitle}>Request Submitted!</h2>
          <p style={styles.successMessage}>
            We've sent a verification email to <strong>{formData.email}</strong>.
          </p>
          <p style={styles.successNote}>
            Please check your inbox and click the verification link.
            <br />
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Register Institution</h1>
          <p style={styles.subtitle}>
            Register your institution to start managing elections
          </p>
        </div>

        {error && (
          <div style={styles.errorBanner}>
            <FiAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Institution Name */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FiHome size={16} style={styles.labelIcon} />
              Institution Name <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={(e) => handleBlur('name', e.target.value)}
              placeholder="e.g., Addis Ababa University"
              style={{
                ...styles.input,
                ...(showFieldError('name') ? styles.inputError : {})
              }}
            />
            {showFieldError('name') && (
              <span style={styles.fieldError}>{fieldErrors.name}</span>
            )}
          </div>

          {/* Institution Code & Email - Row */}
          <div style={styles.row} className='row'>
            <div style={styles.rowItem}>
              <label style={styles.label}>
                <FiCode size={16} style={styles.labelIcon} />
                Institution Code <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                onBlur={(e) => handleBlur('code', e.target.value)}
                placeholder="e.g., AAU"
                style={{
                  ...styles.input,
                  ...(showFieldError('code') ? styles.inputError : {})
                }}
              />
              {showFieldError('code') && (
                <span style={styles.fieldError}>{fieldErrors.code}</span>
              )}
            </div>

            <div style={styles.rowItem}>
              <label style={styles.label}>
                <FiMail size={16} style={styles.labelIcon} />
                Institution Email <span style={styles.required}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={(e) => handleBlur('email', e.target.value)}
                placeholder="admin@university.edu"
                style={{
                  ...styles.input,
                  ...(showFieldError('email') ? styles.inputError : {})
                }}
              />
              {showFieldError('email') && (
                <span style={styles.fieldError}>{fieldErrors.email}</span>
              )}
            </div>
          </div>

          {/* Phone & Address - Row */}
          <div style={styles.row} className='row'>
            <div style={styles.rowItem}>
              <label style={styles.label}>
                <FiPhone size={16} style={styles.labelIcon} />
                Phone Number <span style={styles.required}>*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={(e) => handleBlur('phone', e.target.value)}
                placeholder="+251-XXX-XXX-XXX"
                style={{
                  ...styles.input,
                  ...(showFieldError('phone') ? styles.inputError : {})
                }}
              />
              {showFieldError('phone') && (
                <span style={styles.fieldError}>{fieldErrors.phone}</span>
              )}
            </div>

            <div style={styles.rowItem}>
              <label style={styles.label}>
                <FiMapPin size={16} style={styles.labelIcon} />
                Address <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                onBlur={(e) => handleBlur('address', e.target.value)}
                placeholder="4 Kilo, Addis Ababa"
                style={{
                  ...styles.input,
                  ...(showFieldError('address') ? styles.inputError : {})
                }}
              />
              {showFieldError('address') && (
                <span style={styles.fieldError}>{fieldErrors.address}</span>
              )}
            </div>
          </div>

          {/* About Institution */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              <FiFileText size={16} style={styles.labelIcon} />
              About Institution
            </label>
            <textarea
              name="about"
              value={formData.about}
              onChange={handleChange}
              onBlur={(e) => handleBlur('about', e.target.value)}
              placeholder="Brief description of your institution..."
              rows={4}
              style={{
                ...styles.textarea,
                ...(showFieldError('about') ? styles.inputError : {})
              }}
            />
            {showFieldError('about') && (
              <span style={styles.fieldError}>{fieldErrors.about}</span>
            )}
          </div>

          {/* Info Note */}
          <div style={styles.infoBox}>
            <FiCheckCircle size={18} color="#D23A01" />
            <span style={styles.infoText}>
              After submission, we'll send a verification link to your institution email. 
              Once verified, a SuperAdmin will review and approve your request.
            </span>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? (
              <>
                <FiLoader size={20} className="spinner" />
                Submitting Request...
              </>
            ) : (
              <>
                <FiSend size={16} />
                Submit Request
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        
        /* Tablet Responsive */
        @media (max-width: 768px) {
          .row {
            flex-direction: column !important;
            gap: 16px !important;
          }
           .formGroup{
           width:100%;
           } 
        }
        
        /* Mobile Responsive */
        @media (max-width: 640px) {
          .row {
            gap: 20px !important;
          }
        }
        
        /* Hover effects - desktop only */
        @media (min-width: 769px) {
          input:hover, textarea:hover {
            border-color: #D23A01 !important;
          }
          button:hover {
            background: #b83200 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 20px rgba(210, 58, 1, 0.3) !important;
          }
        }
        
        /* Touch-friendly for mobile */
        @media (max-width: 768px) {
          input, textarea, button {
            font-size: 16px !important; /* Prevents zoom on iOS */
          }
          button {
            padding: 16px 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(16px, 4vw, 32px)',
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  card: {
    background: 'white',
    borderRadius: 'clamp(20px, 5vw, 28px)',
    padding: 'clamp(24px, 6vw, 48px)',
    maxWidth: '750px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s ease'
  },
  header: {
    textAlign: 'center',
    marginBottom: 'clamp(24px, 5vw, 36px)'
  },
  title: {
    fontSize: 'clamp(24px, 6vw, 34px)',
    fontWeight: '800',
    color: '#D23A01',
    marginBottom: '8px',
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: 'clamp(13px, 3vw, 16px)',
    color: '#6b7280',
    fontFamily: "'Poppins', sans-serif",
    lineHeight: '1.5'
  },
  errorBanner: {
    background: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '12px 16px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#dc2626',
    fontSize: '14px',
    fontFamily: "'Poppins', sans-serif",
    flexWrap: 'wrap'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'clamp(18px, 4vw, 24px)'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: 'clamp(13px, 3vw, 14px)',
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: "'Poppins', sans-serif"
  },
  labelIcon: {
    color: '#D23A01',
    flexShrink: 0
  },
  required: {
    color: '#D23A01',
    fontSize: 'clamp(12px, 3vw, 14px)'
  },
  input: {
    width: '100%',
    padding: 'clamp(12px, 3vw, 14px) clamp(14px, 3vw, 16px)',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: 'clamp(14px, 3vw, 15px)',
    fontFamily: "'Poppins', sans-serif",
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#fff',
    boxSizing: 'border-box'
  },
  inputError: {
    borderColor: '#dc2626',
    backgroundColor: '#fef2f2'
  },
  textarea: {
    width: '100%',
    padding: 'clamp(12px, 3vw, 14px) clamp(14px, 3vw, 16px)',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: 'clamp(14px, 3vw, 15px)',
    fontFamily: "'Poppins', sans-serif",
    resize: 'vertical',
    outline: 'none',
    transition: 'all 0.2s ease',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
    minHeight: '100px'
  },
  fieldError: {
    fontSize: 'clamp(11px, 2.5vw, 12px)',
    color: '#dc2626',
    fontFamily: "'Poppins', sans-serif",
    marginTop: '4px',
    display: 'block'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'clamp(16px, 4vw, 20px)'
  },
  rowItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: 0 // Prevents overflow
  },
  infoBox: {
    background: '#D23A0110',
    borderRadius: '12px',
    padding: 'clamp(14px, 3vw, 16px) clamp(16px, 4vw, 20px)',
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start',
    border: '1px solid #D23A0120'
  },
  infoText: {
    fontSize: 'clamp(12px, 2.5vw, 13px)',
    color: '#4b5563',
    lineHeight: '1.5',
    fontFamily: "'Poppins', sans-serif",
    flex: 1
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: 'clamp(12px, 3vw, 14px) clamp(20px, 4vw, 24px)',
    background: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: 'clamp(14px, 3vw, 15px)',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: "'Poppins', sans-serif",
    transition: 'all 0.2s ease',
    marginTop: '8px',
    width: '100%'
  },
  // Success Screen
  successContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'clamp(16px, 4vw, 32px)',
    fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
  },
  successCard: {
    background: 'white',
    borderRadius: 'clamp(24px, 6vw, 28px)',
    padding: 'clamp(32px, 8vw, 60px)',
    textAlign: 'center',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb'
  },
  successIcon: {
    width: 'clamp(72px, 15vw, 88px)',
    height: 'clamp(72px, 15vw, 88px)',
    background: '#10b981',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
    color: 'white'
  },
  successTitle: {
    fontSize: 'clamp(24px, 6vw, 32px)',
    fontWeight: '800',
    color: '#10b981',
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif"
  },
  successMessage: {
    fontSize: 'clamp(14px, 3vw, 16px)',
    color: '#4b5563',
    marginBottom: '12px',
    fontFamily: "'Poppins', sans-serif",
    lineHeight: '1.5'
  },
  successNote: {
    fontSize: 'clamp(12px, 2.5vw, 13px)',
    color: '#9ca3af',
    fontFamily: "'Poppins', sans-serif",
    lineHeight: '1.5'
  }
};

export default RequestInstitution;