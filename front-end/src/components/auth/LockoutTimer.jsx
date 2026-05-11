import { useEffect, useState } from "react";
import {  getLockoutRemainingSeconds } from '../../utils/loginValidators';
export const LockoutTimer = ({ email, onExpire }) => {
    const [seconds, setSeconds] = useState(getLockoutRemainingSeconds(email));
  
    useEffect(() => {
      if (seconds <= 0) {
        onExpire();
        return;
      }
      const interval = setInterval(() => {
        setSeconds(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onExpire();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }, [seconds, onExpire]);
  
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
  
    return (
      <div className="login-lockout-banner">
        <FiClock className="login-banner-icon" />
        <p>
          Account temporarily locked. Try again in{' '}
          <strong>{mins}:{String(secs).padStart(2, '0')}</strong>
        </p>
      </div>
    );
  };
  
