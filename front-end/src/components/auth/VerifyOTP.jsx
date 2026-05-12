import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLoader, FiAlertCircle, FiClock } from 'react-icons/fi';
import { verifyOTP, resendOTP, clearError, decrementResendCooldown, startResendCooldown } from '../../js/auth-slice';
import { securityValidators } from '../../utils/validators';

const VerifyOTP = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isLoading, error, otpResendCooldown } = useSelector((state) => state.auth);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const userEmail = location.state?.email;
    if (userEmail) {
      setEmail(userEmail);
    } else {
      navigate('/register');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (otpResendCooldown > 0) {
      const interval = setInterval(() => {
        dispatch(decrementResendCooldown());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpResendCooldown, dispatch]);

  const validateOtpCode = (otpArray) => {
    const otpCode = otpArray.join('');
    const error = securityValidators.isValidOTP(otpCode);
    return error;
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (localError) setLocalError('');
    if (error) dispatch(clearError());
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleBlur = () => {
    setTouched(true);
    const otpError = validateOtpCode(otp);
    if (otpError) {
      setLocalError(otpError);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    
    const otpError = validateOtpCode(otp);
    if (otpError) {
      setLocalError(otpError);
      return;
    }
    
    const otpCode = otp.join('');
    const result = await dispatch(verifyOTP({ email, otp: otpCode }));
    if (result.meta.requestStatus === 'fulfilled') {
      navigate('/elections');
    }
  };

  const handleResendOTP = async () => {
    if (otpResendCooldown > 0) return;
    dispatch(startResendCooldown());
    setOtp(['', '', '', '', '', '']);
    setLocalError('');
    await dispatch(resendOTP({ email }));
  };

  const showOtpError = touched && validateOtpCode(otp);
  const otpComplete = otp.join('').length === 6;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.headerIconWrapper}>
            <FiMail size={48} style={styles.headerIcon} />
          </div>
          <h2 style={styles.title}>Verify Your Email</h2>
          <p style={styles.subtitle}>We've sent a 6-digit verification code to</p>
          <strong style={styles.emailText}>{email}</strong>
        </div>

        <form onSubmit={handleSubmit}>
          {(error || localError) && (
            <div style={styles.errorBanner}>
              <FiAlertCircle size={18} />
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

          <div style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onBlur={handleBlur}
                autoFocus={index === 0}
                style={{
                  ...styles.otpInput,
                  borderColor: digit ? '#D23A01' : (showOtpError ? '#dc2626' : '#e5e7eb'),
                  borderWidth: '2px',
                  borderStyle: 'solid'
                }}
              />
            ))}
          </div>

          <button 
            type="submit" 
            disabled={isLoading || !otpComplete} 
            style={{
              ...styles.submitBtn,
              opacity: (!otpComplete || isLoading) ? 0.6 : 1,
              cursor: (!otpComplete || isLoading) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? (
              <span style={styles.btnFlex}>
                <FiLoader size={18} style={styles.spinner} />
                Verifying...
              </span>
            ) : 'Verify Account'}
          </button>

          <div style={styles.resendContainer}>
            <p style={styles.resendText}>Didn't receive the code?</p>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={otpResendCooldown > 0 || isLoading}
              style={{
                ...styles.resendBtn,
                opacity: (otpResendCooldown > 0 || isLoading) ? 0.5 : 1,
                cursor: (otpResendCooldown > 0 || isLoading) ? 'not-allowed' : 'pointer'
              }}
            >
              {otpResendCooldown > 0 ? (
                <span style={styles.resendTimer}>
                  <FiClock size={14} /> Resend in {otpResendCooldown}s
                </span>
              ) : 'Resend Code'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 640px) {
          .otp-input {
            width: 44px !important;
            height: 50px !important;
            font-size: 20px !important;
          }
          .otp-container {
            gap: 8px !important;
          }
          .card {
            padding: 28px !important;
          }
          .title {
            font-size: 24px !important;
          }
        }
        
        @media (max-width: 480px) {
          .otp-input {
            width: 38px !important;
            height: 45px !important;
            font-size: 18px !important;
          }
          .otp-container {
            gap: 6px !important;
          }
          .card {
            padding: 20px !important;
          }
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
    padding: 'clamp(16px, 4vw, 24px)',

  },
  card: {
    background: 'white',
    borderRadius: '28px',
    padding: 'clamp(32px, 5vw, 48px)',
    maxWidth: '800px',
    width: '100%',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb'
  },
  header: {
    textAlign: 'center',
    marginBottom: 'clamp(24px, 5vw, 32px)'
  },
  headerIconWrapper: {
    width: '80px',
    height: '80px',
    background: '#FEF3F0',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px'
  },
  headerIcon: {
    color: '#D23A01'
  },
  title: {
    fontSize: 'clamp(24px, 5vw, 28px)',
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: '12px',

  },
  subtitle: {
    color: '#6b7280',
    marginBottom: '8px',
    fontSize: '14px',
   
  },
  emailText: {
    color: '#D23A01',
    fontSize: '16px',
    fontWeight: '600',
    display: 'inline-block',
    marginTop: '4px'
  },
  errorBanner: {
    background: '#fee2e2',
    color: '#dc2626',
    padding: '14px 18px',
    borderRadius: '14px',
    marginBottom: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    fontWeight: '500',
    border: '1px solid #fecaca',
  
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
  otpContainer: {
    display: 'flex',
    gap: 'clamp(10px, 3vw, 14px)',
    justifyContent: 'center',
    marginBottom: 'clamp(28px, 5vw, 36px)',
    flexWrap: 'wrap'
  },
  otpInput: {
    width: 'clamp(50px, 10vw, 60px)',
    height: 'clamp(55px, 10vw, 65px)',
    textAlign: 'center',
    fontSize: 'clamp(22px, 5vw, 26px)',
    fontWeight: '800',
    borderRadius: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    background: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  submitBtn: {
    width: '100%',
    padding: 'clamp(14px, 3vw, 16px)',
    background: '#D23A01',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    fontSize: 'clamp(15px, 3vw, 16px)',
    fontWeight: '700',
    transition: 'all 0.2s ease',
    marginBottom: '24px',
   
    cursor: 'pointer'
  },
  btnFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  spinner: {
    animation: 'spin 1s linear infinite'
  },
  resendContainer: {
    textAlign: 'center'
  },
  resendText: {
    color: '#6b7280',
    marginBottom: '8px',
    fontSize: '14px',
    
  },
  resendBtn: {
    background: 'none',
    border: 'none',
    color: '#D23A01',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
  
    transition: 'all 0.2s ease'
  },
  resendTimer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    fontWeight: '600',
   
  }
};

export default VerifyOTP;