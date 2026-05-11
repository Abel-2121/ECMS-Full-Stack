import Forgotpassword from '../components/auth/ForgotPassword';
import './Login.css'
function ForgotPassword() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ebebeb',  
      padding: '20px'
    }}>
     <div className="login-inner-form-container">
        <h2 className="login-form-title">Forgot Password?</h2>
        
        <Forgotpassword/>
      </div>
    </div>
  );
}

export default ForgotPassword


