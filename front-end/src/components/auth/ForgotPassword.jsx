import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiMail, FiLoader, FiArrowLeft, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { forgotPassword, clearError } from '../../js/auth-slice';
import { securityValidators } from '../../utils/validators';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { isLoading, error, passwordResetSent } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');
  const [touched, setTouched] = useState(false);

  const validateEmail = (emailValue) => {
    const error = securityValidators.isValidEmail(emailValue);
    return error;
  };

  // ✅ Define showEmailError here
  const showEmailError = touched && validateEmail(email);

  const handleEmailChange = (e) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (localError) setLocalError('');
    if (error) dispatch(clearError());
  };

  const handleBlur = () => {
    setTouched(true);
    const emailError = validateEmail(email);
    if (emailError) {
      setLocalError(emailError);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    
    const emailError = validateEmail(email);
    if (emailError) {
      setLocalError(emailError);
      return;
    }
    
    await dispatch(forgotPassword({ email }));
  };

  if (passwordResetSent) {
    return (
      <>
        <FiCheckCircle style={{ fontSize: '64px', color: '#10b981', marginBottom: '20px' }} />
        <h2 style={{ fontSize: '28px', marginBottom: '12px', color: '#333' }}>Check Your Email</h2>
        <p style={{ color: '#666', marginBottom: '8px' }}>We've sent a password reset link to</p>
        <strong style={{ color: '#333' }}>{email}</strong>
        <p style={{ fontSize: '14px', color: '#888', marginTop: '15px', marginBottom: '20px' }}>Click the link in the email to reset your password. The link expires in 10 minutes.</p>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#667eea', textDecoration: 'none' }}>
          <FiArrowLeft /> Back to Login
        </Link>
      </>
    );
  }

  return (
    <>
      <p style={{ color: '#666', textAlign: 'center', marginBottom: '30px' }}>Enter your email address and we'll send you a link to reset your password.</p>

      <form onSubmit={handleSubmit}>
        {(error || localError) && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>{error || localError}</p>
            <button type="button" onClick={() => { dispatch(clearError()); setLocalError(''); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
          </div>
        )}

        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <FiMail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={handleEmailChange}
            onBlur={handleBlur}
            required
            style={{
              width: '100%',
              padding: '14px 40px',
              border: showEmailError ? '1px solid #dc2626' : '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px'
            }}
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !email} 
          style={{
            cursor: (!email || isLoading) ? 'not-allowed' : 'pointer',
            opacity: (!email || isLoading) ? 0.7 : 1,
            marginBottom: '20px'
          }}
          className="btn primary full login-submit-btn"
        >
          {isLoading ? (
            <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FiLoader style={{ animation: 'spin 1s linear infinite' }} />
              Sending...
            </p>
          ) : 'Send Reset Link'}
        </button>

        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color:'#dc2626', textDecoration: 'none', fontSize: '14px' }}>
          <FiArrowLeft /> Back to Login
        </Link>
      </form>
    </>
  );
};

export default ForgotPassword;