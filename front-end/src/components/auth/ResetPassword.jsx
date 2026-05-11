import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiLock, FiLoader, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { resetPassword, clearError } from '../../js/auth-slice';
import { securityValidators } from '../../utils/validators';

const ResetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();
  
  const { isLoading, error, passwordResetSuccess } = useSelector((state) => state.auth);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });

  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Only update checks when password changes (for visual feedback, not validation)
  useEffect(() => {
    setChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    });
  }, [password]);

  useEffect(() => {
    if (passwordResetSuccess) {
      const timer = setTimeout(() => navigate('/login'), 2000);
      return () => clearTimeout(timer);
    }
  }, [passwordResetSuccess, navigate]);

  const validatePassword = (pwd) => {
    if (!pwd) return 'Password is required';
    if (pwd.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(pwd)) return 'Password must contain at least 1 uppercase letter';
    if (!/[a-z]/.test(pwd)) return 'Password must contain at least 1 lowercase letter';
    if (!/[0-9]/.test(pwd)) return 'Password must contain at least 1 number';
    return null;
  };

  const validatePasswordMatch = (pwd, confirmPwd) => {
    if (!confirmPwd) return 'Please confirm your password';
    if (pwd !== confirmPwd) return 'Passwords do not match';
    return null;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    // Clear errors when user starts typing
    if (localError) setLocalError('');
    dispatch(clearError());
  };

  const handleConfirmPasswordChange = (e) => {
    const newConfirmPassword = e.target.value;
    setPasswordConfirm(newConfirmPassword);
    // Clear errors when user starts typing
    if (localError) setLocalError('');
    dispatch(clearError());
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    const passwordError = validatePassword(password);
    if (passwordError) {
      setLocalError(passwordError);
    }
  };

  const handleConfirmPasswordBlur = () => {
    setTouched(prev => ({ ...prev, confirmPassword: true }));
    const matchError = validatePasswordMatch(password, passwordConfirm);
    if (matchError) {
      setLocalError(matchError);
    } else if (localError && localError.includes('match')) {
      setLocalError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });
    
    const passwordError = validatePassword(password);
    const matchError = validatePasswordMatch(password, passwordConfirm);
    
    if (passwordError) {
      setLocalError(passwordError);
      return;
    }
    if (matchError) {
      setLocalError(matchError);
      return;
    }
    
    await dispatch(resetPassword({ token, password, passwordConfirm }));
  };

  if (passwordResetSuccess) {
    return (
      <div style={styles.successContainer}>
        <div style={styles.successIcon}>
          <FiCheckCircle size={48} color="#10b981" />
        </div>
        <h2 style={styles.successTitle}>Password Reset Successful!</h2>
        <p style={styles.successMessage}>Your password has been changed successfully.</p>
        <p style={styles.successNote}>Redirecting you to login...</p>
        <Link to="/login" style={styles.successLink}>Go to Login</Link>
      </div>
    );
  }

  const showPasswordError = touched.password && validatePassword(password);
  const showMatchError = touched.confirmPassword && validatePasswordMatch(password, passwordConfirm);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create New Password</h2>
        <p style={styles.subtitle}>Please enter your new password below.</p>

        {(error || localError) && (
          <div style={styles.errorBanner}>
            <FiAlertCircle size={16} />
            <span>{error || localError}</span>
            <button 
              type="button" 
              onClick={() => { dispatch(clearError()); setLocalError(''); }} 
              style={styles.errorClose}
            >
              ×
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Password Field */}
          <div style={styles.inputWrapper}>
            <FiLock style={styles.inputIcon} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="New password (min 8 characters)"
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              required
              style={{
                ...styles.input,
                ...(showPasswordError ? styles.inputError : {})
              }}
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              style={styles.toggleBtn}
            >
              {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {showPasswordError && <span style={styles.fieldError}>{validatePassword(password)}</span>}

          {/* Password Strength Indicator (Visual only) */}
          <div style={styles.strengthContainer}>
            <div style={styles.strengthMeter}>
              <div style={{ ...styles.strengthBar, background: checks.length ? '#D23A01' : '#e5e7eb' }} />
              <div style={{ ...styles.strengthBar, background: checks.uppercase ? '#D23A01' : '#e5e7eb' }} />
              <div style={{ ...styles.strengthBar, background: checks.lowercase ? '#D23A01' : '#e5e7eb' }} />
              <div style={{ ...styles.strengthBar, background: checks.number ? '#D23A01' : '#e5e7eb' }} />
              <div style={{ ...styles.strengthBar, background: checks.special ? '#D23A01' : '#e5e7eb' }} />
            </div>
          </div>

          {/* Password Requirements Checklist (Visual only) */}
          <ul style={styles.checklist}>
            <li style={{ color: checks.length ? '#10b981' : '#6c757d' }}>
              {checks.length ? '✓' : '○'} At least 8 characters
            </li>
            <li style={{ color: checks.uppercase ? '#10b981' : '#6c757d' }}>
              {checks.uppercase ? '✓' : '○'} Uppercase letter (A-Z)
            </li>
            <li style={{ color: checks.lowercase ? '#10b981' : '#6c757d' }}>
              {checks.lowercase ? '✓' : '○'} Lowercase letter (a-z)
            </li>
            <li style={{ color: checks.number ? '#10b981' : '#6c757d' }}>
              {checks.number ? '✓' : '○'} Number (0-9)
            </li>
            <li style={{ color: checks.special ? '#10b981' : '#6c757d' }}>
              {checks.special ? '✓' : '○'} Special character (!@#$%^&*)
            </li>
          </ul>

          {/* Confirm Password Field */}
          <div style={styles.inputWrapper}>
            <FiLock style={styles.inputIcon} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={passwordConfirm}
              onChange={handleConfirmPasswordChange}
              onBlur={handleConfirmPasswordBlur}
              required
              style={{
                ...styles.input,
                ...(showMatchError ? styles.inputError : {})
              }}
            />
            <button 
              type="button" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
              style={styles.toggleBtn}
            >
              {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
          {showMatchError && <span style={styles.fieldError}>{validatePasswordMatch(password, passwordConfirm)}</span>}
          {touched.confirmPassword && passwordConfirm && !showMatchError && password === passwordConfirm && (
            <span style={styles.successMatch}>✓ Passwords match</span>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading} 
            style={styles.submitBtn}
          >
            {isLoading ? (
              <span style={styles.btnFlex}>
                <FiLoader style={styles.spinner} />
                Resetting Password...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>

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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#D23A01',
    marginBottom: '12px',
    textAlign: 'center'
  },
  subtitle: {
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '14px'
  },
  errorBanner: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '12px 16px',
    borderRadius: '12px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #fecaca'
  },
  errorClose: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#dc2626',
    marginLeft: 'auto',
    padding: '0 4px'
  },
  inputWrapper: {
    position: 'relative',
    marginBottom: '20px'
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#adb5bd',
    fontSize: '18px'
  },
  input: {
    width: '100%',
    padding: '14px 40px',
    border: '2px solid #e0e4e8',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.2s ease',
    background: '#ffffff',
    color: '#1a1a1a',
    boxSizing: 'border-box'
  },
  inputError: {
    borderColor: '#dc2626',
    background: '#fef2f2'
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
    padding: '4px'
  },
  fieldError: {
    display: 'block',
    fontSize: '11px',
    color: '#dc2626',
    marginTop: '-12px',
    marginBottom: '12px',
    fontWeight: '500'
  },
  successMatch: {
    display: 'block',
    fontSize: '11px',
    color: '#10b981',
    marginTop: '-12px',
    marginBottom: '12px',
    fontWeight: '500'
  },
  strengthContainer: {
    marginBottom: '12px'
  },
  strengthMeter: {
    display: 'flex',
    gap: '6px',
    marginTop: '8px'
  },
  strengthBar: {
    height: '4px',
    flex: 1,
    borderRadius: '2px',
    transition: 'background 0.2s ease'
  },
  checklist: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 20px 0',
    fontSize: '12px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'space-between'
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '8px'
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
  // Success styles
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
    padding: '20px'
  },
  successIcon: {
    marginBottom: '20px'
  },
  successTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '12px',
    textAlign: 'center'
  },
  successMessage: {
    color: '#6c757d',
    marginBottom: '15px',
    textAlign: 'center',
    fontSize: '14px'
  },
  successNote: {
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '20px',
    textAlign: 'center'
  },
  successLink: {
    color: '#D23A01',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '14px'
  }
};

export default ResetPassword;