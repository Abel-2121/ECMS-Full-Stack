import Resetpassword from '../components/auth/ResetPassword';
import './Login.css'
function ResetPassword() {
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
          <h2 className="login-form-title">Reset Password</h2>
          
          <Resetpassword/>
        </div>
    </div>
  )
}

export default ResetPassword
