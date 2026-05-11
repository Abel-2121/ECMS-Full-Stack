import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
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
        <h2 className="login-form-title">Login</h2>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;