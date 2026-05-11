import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../Js/auth-slice';

const Logout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. Dispatch logout to Redux store
    dispatch(logout());

    // 2. Clear local storage
    localStorage.removeItem('userRole');
    localStorage.removeItem('userToken');

    // 3. Redirect to login page after a brief delay for UX
    const timer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 1500);

    return () => clearTimeout(timer);
  }, [dispatch, navigate]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'var(--color-bg)'
    }}>
      <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-3)' }}>
        <div className="spinner" style={{ marginBottom: '1.5rem', marginInline: 'auto' }}></div>
        <h2 style={{ marginBottom: '0.5rem' }}>Logging out...</h2>
        <p style={{ color: 'var(--color-gray-500)' }}>Securing your session and redirecting you to login.</p>
      </div>
    </div>
  );
};

export default Logout;