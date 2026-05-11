import { useState, useEffect } from 'react'; 
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { 
  FiUser, FiMail, FiPhone, FiLoader, 
  FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import { signup } from '../../js/auth-slice';
import { securityValidators } from '../../utils/validators';

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({ checks: {} });

  const checkPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    };
    setPasswordStrength({ checks });
  };

  // Real-time password strength feedback
  useEffect(() => {
    if (touched.password) {
      const error = securityValidators.isStrongPassword(formData.password);
      setErrors(prev => ({ ...prev, password: error }));
      checkPasswordStrength(formData.password);
    }
  }, [formData.password]);

  // Real-time confirm password validation
  useEffect(() => {
    if (touched.confirmPassword) {
      const error = securityValidators.doPasswordsMatch(formData.password, formData.confirmPassword);
      setErrors(prev => ({ ...prev, confirmPassword: error }));
    }
  }, [formData.confirmPassword, formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let sanitizedValue = value;
    
    if (name === 'firstName' || name === 'lastName' || name === 'email') {
      sanitizedValue = securityValidators.sanitizeInput(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    setErrors(prev => ({ ...prev, [name]: null }));
    if (serverError) setServerError(null);
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let error = null;
    
    switch (field) {
      case 'firstName':
        error = securityValidators.isValidName(formData.firstName, 'First name');
        break;
      case 'lastName':
        error = securityValidators.isValidName(formData.lastName, 'Last name');
        break;
      case 'email':
        error = securityValidators.isValidEmail(formData.email);
        break;
      case 'phone':
        error = securityValidators.isValidPhone(formData.phone);
        break;
      case 'password':
        error = securityValidators.isStrongPassword(formData.password);
        checkPasswordStrength(formData.password);
        break;
      case 'confirmPassword':
        error = securityValidators.doPasswordsMatch(formData.password, formData.confirmPassword);
        break;
      default:
        error = null;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields on submit
    const firstNameError = securityValidators.isValidName(formData.firstName, 'First name');
    const lastNameError = securityValidators.isValidName(formData.lastName, 'Last name');
    const emailError = securityValidators.isValidEmail(formData.email);
    const phoneError = securityValidators.isValidPhone(formData.phone);
    const passwordError = securityValidators.isStrongPassword(formData.password);
    const confirmPasswordError = securityValidators.doPasswordsMatch(formData.password, formData.confirmPassword);
    
    const newErrors = {
      ...(firstNameError && { firstName: firstNameError }),
      ...(lastNameError && { lastName: lastNameError }),
      ...(emailError && { email: emailError }),
      ...(phoneError && { phone: phoneError }),
      ...(passwordError && { password: passwordError }),
      ...(confirmPasswordError && { confirmPassword: confirmPasswordError })
    };
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        password: true,
        confirmPassword: true
      });
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      await dispatch(signup({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        passwordConfirm: formData.confirmPassword
      })).unwrap();

      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCheckColor = (isValid) => isValid ? '#10b981' : '#9ca3af';

  return (
    <div style={styles.container} className='container'>
      <form style={styles.form} onSubmit={handleSubmit} noValidate>
        {/* Header */}
        <div style={styles.header} className='header'>
          <h2 style={styles.headerTitle} className='header-title'>Create Account</h2>
          <p style={styles.headerSubtitle}>Join us to participate in elections</p>
        </div>

        {serverError && (
          <div style={styles.errorBanner}>
            <FiAlertCircle size={14} />
            <span>{serverError}</span>
            <button type="button" style={styles.errorClose} onClick={() => setServerError(null)}>×</button>
          </div>
        )}

        {/* First Name & Last Name */}
        <div style={styles.row} className='row'>
          <div style={styles.formGroup} className='formGroup'>
            <label style={styles.label}>First Name</label>
            <div style={styles.inputWrapper}>
              <FiUser style={styles.inputIcon} />
              <input
                name="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={() => handleBlur('firstName')}
                className={errors.firstName && touched.firstName ? 'input-error' : ''}
                style={styles.input}
              />
            </div>
            {errors.firstName && touched.firstName && (
              <span style={styles.fieldError}>{errors.firstName}</span>
            )}
          </div>

          <div style={styles.formGroup} className='formGroup'>
            <label style={styles.label}>Last Name</label>
            <div style={styles.inputWrapper}>
              <FiUser style={styles.inputIcon} />
              <input
                name="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={() => handleBlur('lastName')}
                className={errors.lastName && touched.lastName ? 'input-error' : ''}
                style={styles.input}
              />
            </div>
            {errors.lastName && touched.lastName && (
              <span style={styles.fieldError}>{errors.lastName}</span>
            )}
          </div>
        </div>

        {/* Email & Phone */}
        <div style={styles.row} className='row'>
          <div style={styles.formGroup} className='formGroup'>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <FiMail style={styles.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                className={errors.email && touched.email ? 'input-error' : ''}
                style={styles.input}
              />
            </div>
            {errors.email && touched.email && (
              <span style={styles.fieldError}>{errors.email}</span>
            )}
          </div>

          <div style={styles.formGroup} className='formGroup'>
            <label style={styles.label}>Phone (Optional)</label>
            <div style={styles.inputWrapper}>
              <FiPhone style={styles.inputIcon} />
              <input
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                onBlur={() => handleBlur('phone')}
                className={errors.phone && touched.phone ? 'input-error' : ''}
                style={styles.input}
              />
            </div>
            {errors.phone && touched.phone && (
              <span style={styles.fieldError}>{errors.phone}</span>
            )}
          </div>
        </div>

        {/* Password */}
        <div style={styles.formGroup} className='formGroup'>
          <label style={styles.label}>Password</label>
          <div style={styles.inputWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              className={errors.password && touched.password ? 'input-error' : ''}
              style={styles.input}
            />
            <button type="button" style={styles.toggleBtn} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          
          {/* Password Requirements Checklist - Real-time */}
          {formData.password && (
            <div style={styles.checklist}>
              <span style={{ ...styles.checklistItem, color: getCheckColor(passwordStrength.checks.length) }}>
                {passwordStrength.checks.length && <FiCheckCircle size={10} color="#10b981" />}
                8+ characters
              </span>
              <span style={{ ...styles.checklistItem, color: getCheckColor(passwordStrength.checks.upper) }}>
                {passwordStrength.checks.upper && <FiCheckCircle size={10} color="#10b981" />}
                Uppercase letter
              </span>
              <span style={{ ...styles.checklistItem, color: getCheckColor(passwordStrength.checks.lower) }}>
                {passwordStrength.checks.lower && <FiCheckCircle size={10} color="#10b981" />}
                Lowercase letter
              </span>
              <span style={{ ...styles.checklistItem, color: getCheckColor(passwordStrength.checks.number) }}>
                {passwordStrength.checks.number && <FiCheckCircle size={10} color="#10b981" />}
                Number
              </span>
              <span style={{ ...styles.checklistItem, color: getCheckColor(passwordStrength.checks.special) }}>
                {passwordStrength.checks.special && <FiCheckCircle size={10} color="#10b981" />}
                Special character (!@#$%^&*)
              </span>
            </div>
          )}
          
          {errors.password && touched.password && (
            <span style={styles.fieldError}>{errors.password}</span>
          )}
        </div>

        {/* Confirm Password */}
        <div style={styles.formGroup} className='formGroup'>
          <label style={styles.label}>Confirm Password</label>
          <div style={styles.inputWrapper}>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur('confirmPassword')}
              className={errors.confirmPassword && touched.confirmPassword ? 'input-error' : ''}
              style={styles.input}
            />
          </div>
          {errors.confirmPassword && touched.confirmPassword && (
            <span style={styles.fieldError}>{errors.confirmPassword}</span>
          )}
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn primary full login-submit-btn" disabled={loading}>
          {loading ? (
            <span style={styles.btnFlex}>
              <FiLoader style={styles.spinner} /> Creating account...
            </span>
          ) : (
            'Create Account'
          )}
        </button>
        
        <p className="login-register-link">
          Already have an account? <Link to="/login" style={styles.loginLinkText}>Sign In</Link>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    background: '#f0f2f5'
  },
  form: {
    width: '100%',
    maxWidth: '750px',
    padding: '32px',
    background: '#ffffff',
    borderRadius: '20px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
    border: '1px solid #e8eaed'
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px'
  },
  headerTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#D23A01',
    marginBottom: '8px',
    letterSpacing: '-0.3px'
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#6c757d',
    fontWeight: '400'
  },
  errorBanner: {
    background: '#FEE2E2',
    color: '#DC2626',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #FECACA'
  },
  errorClose: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#DC2626',
    marginLeft: 'auto',
    padding: '0 4px'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '18px',
    marginBottom: '6px'
  },
  formGroup: {
    marginBottom: '18px'
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '6px',
    letterSpacing: '0.2px'
  },
  inputWrapper: {
    position: 'relative',
    width: '100%'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#adb5bd',
    fontSize: '16px',
    pointerEvents: 'none',
    zIndex: 1
  },
  input: {
    width: '100%',
    padding: '11px 14px 11px 42px',
    border: '2px solid #e0e4e8',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
    transition: 'all 0.2s ease',
    background: '#ffffff',
    color: '#1a1a1a',
    boxSizing: 'border-box'
  },
  toggleBtn: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#adb5bd',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
    zIndex: 1
  },
  fieldError: {
    display: 'block',
    fontSize: '11px',
    color: '#DC2626',
    marginTop: '5px',
    fontWeight: '500'
  },
  checklist: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginTop: '8px'
  },
  checklistItem: {
    fontSize: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontWeight: '500'
  },
  submitBtn: {
    width: '100%',
    padding: '13px 24px',
    background: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '12px',
    letterSpacing: '0.3px'
  },
  btnFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  spinner: {
    animation: 'spin 1s linear infinite'
  },
  loginLink: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#1a1a1a'
  },
  loginLinkText: {
    color: '#D23A01',
    textDecoration: 'none',
    fontWeight: '600',
    marginLeft: '5px'
  }
};

// Add responsive styles
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  input:focus {
    border-color: #D23A01 !important;
    box-shadow: 0 0 0 3px rgba(210, 58, 1, 0.1);
  }
  
  .input-error {
    border-color: #DC2626 !important;
    background: #FEF2F2 !important;
  }
  
  button:hover:not(:disabled) {
    transform: translateY(-1px);
    background: #b02e00;
    box-shadow: 0 4px 12px rgba(210, 58, 1, 0.2);
  }
  
  button:active:not(:disabled) {
    transform: translateY(0);
  }
  
  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  a:hover {
    text-decoration: underline;
  }
  
  /* Mobile */
  @media (max-width: 768px) {
    .container {
      padding: 16px !important;
    }
    
    form {
      padding: 4px !important;
      border-radius: 18px !important;
      max-width: 99%;
    }
    
    .row {
      display: flex !important;
      flex-direction: column !important;
      gap: 0 !important;
    }
    
    .form-group {
      margin-bottom: 1px !important;
    }
    
    input {
      padding: 10px 12px 10px 38px !important;
      font-size: 14px !important;
    }
    
    .input-icon {
      left: 12px !important;
      font-size: 15px !important;
    }
    
    label {
      font-size: 13px !important;
      margin-bottom: 5px !important;
    }
    .header {
      text-align: center;
      margin-bottom: 28px;
    }

    .header-title {
      font-size: 24px !important;
    }
    
    .header-subtitle {
      font-size: 13px !important;
    }
    
    .submit-btn {
      padding: 12px 20px !important;
      font-size: 14px !important;
    }
    
    .login-link {
      margin-top: 18px !important;
      font-size: 12px !important;
    }
  }
  
  /* Small phones */
  @media (max-width: 480px) {
    form {
      padding: 20px !important;
    }
    
    input {
      padding: 9px 11px 9px 36px !important;
      font-size: 13px !important;
    }
    
    .header-title {
      fontSize: 22px !important;
    }
    
    .submit-btn {
      padding: 11px 18px !important;
    }
  }
`;
    
if (!document.head.querySelector('#register-form-styles')) {
  styleSheet.id = 'register-form-styles';
  document.head.appendChild(styleSheet);
}

export default RegisterForm;