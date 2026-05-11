// =====================================================
// UC1 - useAuth Custom Hook
// =====================================================
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, ROLE_REDIRECT_MAP } from '../services/authService';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout as logoutAction,
  clearError,
} from '../Js/auth-slice';
import {
  recordFailedAttempt,
  clearAttempts,
  isLockedOut,
  getLockoutRemainingSeconds,
} from '../utils/loginValidators';

// If using Redux — import useDispatch from your store provider
// For now, this hook accepts dispatch as a parameter so it works
// both with and without a Provider wrapping the tree.
const useAuth = (dispatch) => {
  const navigate = useNavigate();

  const login = useCallback(
    async ({ email, password }) => {
      // Check if user is already locked out client-side
      if (isLockedOut()) {
        const remaining = getLockoutRemainingSeconds();
        return {
          success: false,
          error: `Too many failed attempts. Please wait ${remaining} seconds before trying again.`,
          locked: true,
        };
      }

      dispatch(loginStart());

      try {
        const result = await loginUser({ email, password });

        // Successful login — clear failed attempt tracker
        clearAttempts();

        dispatch(loginSuccess({ user: result.user, token: result.token }));

        // UC1 Step 7 — redirect based on role
        const redirectPath = ROLE_REDIRECT_MAP[result.user.role] || '/';
        navigate(redirectPath, { replace: true });

        return { success: true };
      } catch (err) {
        const code = err.message;

        if (code === 'INVALID_CREDENTIALS') {
          // Alternative Flow A — track failed attempt
          const attemptData = recordFailedAttempt();
          const remaining = Math.max(0, 3 - attemptData.count);

          let message = 'Invalid email or password.';
          if (remaining > 0) {
            message += ` ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`;
          } else {
            message = `Account temporarily locked. Please try again in 5 minutes.`;
          }

          dispatch(loginFailure(message));
          return { success: false, error: message, locked: attemptData.locked };
        }

        if (code === 'ACCOUNT_PENDING') {
          // Alternative Flow B — pending approval
          const message = 'Account pending administrator approval. Please check back later.';
          dispatch(loginFailure(message));
          return { success: false, error: message, status: 'pending' };
        }

        if (code === 'ACCOUNT_LOCKED') {
          const message = 'Your account has been locked. Please contact the administrator.';
          dispatch(loginFailure(message));
          return { success: false, error: message, status: 'locked' };
        }

        // Unexpected error
        const fallback = 'An unexpected error occurred. Please try again.';
        dispatch(loginFailure(fallback));
        return { success: false, error: fallback };
      }
    },
    [dispatch, navigate]
  );

  const logout = useCallback(() => {
    clearAttempts();
    dispatch(logoutAction());
    navigate('/', { replace: true });
  }, [dispatch, navigate]);

  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return { login, logout, resetError };
};

export default useAuth;
