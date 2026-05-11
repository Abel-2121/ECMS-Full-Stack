
import Verifyotp from '../components/auth/VerifyOTP'
import './Login.css'
function VerifyOTP() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#ebebeb',  
      padding: '20px'
    }}>
    
          
          <Verifyotp/>
       
    </div>
  )
}


export default VerifyOTP;
