import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiEye, FiEyeOff, FiMail, FiLock, FiAlertCircle, FiClock, FiLoader } from 'react-icons/fi';
import { login } from '../../js/auth-slice';
import { validateLoginForm, isLockedOut, getLockoutRemainingSeconds } from '../../utils/loginValidators';
import { LockoutTimer } from './LockoutTimer';

const getDashboardPath = (role) => {
  switch (role) {
    case 'superAdmin':
      return '/superAdmin';
    case 'electionAdmin':
      return '/electionAdmin';
    case 'candidate':
      return '/candidate';
    case 'voter':
      return '/voter';
    default:
      return '/elections';
  }
};

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const from = location.state?.from?.pathname || null;

  useEffect(() => {
    if (email) setLocked(isLockedOut(email));
  }, [email]);

  const validateFields = (emailVal, passwordVal) => {
    const errors = validateLoginForm({ email: emailVal, password: passwordVal });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setLocked(isLockedOut(newEmail));
    // Clear error when user starts typing again
    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: null }));
    if (serverError) setServerError(null);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateFields(email, password);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (locked) return;

  setTouched({ email: true, password: true });
  const isValid = validateFields(email, password);
  if (!isValid) return;

  setLoading(true);
  setServerError(null);

  try {
    const result = await dispatch(login({ email, password })).unwrap();
    
    const userRole = result?.data?.user?.role;
    if (userRole) {
      const dashboardPath = getDashboardPath(userRole);
      navigate(from || dashboardPath, { replace: true });
    } else {
      navigate(from || '/', { replace: true });
    }
  } catch (err) {
    setServerError(err || 'Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const showEmailError = touched.email && fieldErrors.email;
  const showPasswordError = touched.password && fieldErrors.password;

  return (
    <form className="login-form" onSubmit={handleSubmit} noValidate>
      {locked && <LockoutTimer email={email} onExpire={() => setLocked(false)} />}

      {!locked && serverError && (
        <div className="login-error-banner" role="alert">
          <FiAlertCircle className="login-banner-icon" />
          <span>{serverError}</span>
          <button 
            type="button" 
            className="login-banner-close" 
            onClick={() => setServerError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Email Field */}
      <div className={`login-field-group ${showEmailError ? 'has-error' : ''}`}>
        <label htmlFor="login-email" className="login-label">Email Address</label>
        <div className="login-input-wrapper">
          <FiMail className="login-input-icon" />
          <input
            id="login-email"
            type="email"
            name="email"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => handleBlur('email')}
            placeholder="Enter your email"
            className="login-input"
            autoComplete="email"
            disabled={loading || locked}
            style={{color:'black'}}
          />
        </div>
        {showEmailError && <span className="login-field-error">{fieldErrors.email}</span>}
      </div>

      {/* Password Field */}
      <div className={`login-field-group ${showPasswordError ? 'has-error' : ''}`}>
        <label htmlFor="login-password" className="login-label">Password</label>
        <div className="login-input-wrapper">
          <FiLock className="login-input-icon" />
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={password}
            onChange={handlePasswordChange}
            onBlur={() => handleBlur('password')}
            placeholder="Enter your password"
            className="login-input"
            autoComplete="current-password"
            disabled={loading || locked}
            style={{color:'black'}}
          />
          <button
            type="button"
            className="login-toggle-password"
            onClick={() => setShowPassword(prev => !prev)}
            disabled={loading || locked}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        {showPasswordError && <span className="login-field-error">{fieldErrors.password}</span>}
      </div>

      <div className="login-extras-row" style={{ justifyContent: 'flex-end' }}>
        <Link to="/forgot-password" className="login-forgot-link">Forgot password?</Link>
      </div>

      <button type="submit" className="btn primary full login-submit-btn" disabled={loading || locked}>
        {loading ? (
          <span className="login-spinner-row">
            <FiLoader className="login-spinner-icon" />
            Signing in…
          </span>
        ) : (
          'Sign In'
        )}
      </button>

      <p className="login-register-link">
        Don&apos;t have an account? <Link to="/register">Create account</Link>
      </p>
    </form>
  );
};

export default LoginForm;