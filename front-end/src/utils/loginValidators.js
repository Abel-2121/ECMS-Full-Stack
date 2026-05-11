// =====================================================
// UC1 - Login Validators
// =====================================================

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.trim() === '') {
    return 'Email address is required.';
  }
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return null;
};

/**
 * Validate password
 */
export const validatePassword = (password) => {
  if (!password || password === '') {
    return 'Password is required.';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  return null;
};

/**
 * Validate the entire login form — returns object of errors
 */
export const validateLoginForm = ({ email, password }) => {
  const errors = {};
  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  if (emailError) errors.email = emailError;
  if (passwordError) errors.password = passwordError;
  return errors;
};

/**
 * Attempt tracker — stored in localStorage
 * Max 3 attempts within 5 minutes (300 seconds)
 */
const ATTEMPT_KEY = 'ecms_login_attempts_v2';
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

/**
 * Get the full attempts map from storage
 */
const getFullAttemptMap = () => {
  try {
    const raw = localStorage.getItem(ATTEMPT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

/**
 * Save the full attempts map to storage
 */
const saveFullAttemptMap = (map) => {
  localStorage.setItem(ATTEMPT_KEY, JSON.stringify(map));
};

export const getAttemptData = (email) => {
  if (!email) return { count: 0, lockExpires: null, locked: false };
  const normalizedEmail = email.trim().toLowerCase();
  const map = getFullAttemptMap();
  const data = map[normalizedEmail] || { count: 0, lockExpires: null, locked: false };

  // Check if lock has expired
  if (data.lockExpires && Date.now() > data.lockExpires) {
    data.locked = false;
    data.lockExpires = null;
    data.count = 0;
    // Update map since we modified the object
    map[normalizedEmail] = data;
    saveFullAttemptMap(map);
  }

  return data;
};

export const recordFailedAttempt = (email) => {
  if (!email) return { count: 0, locked: false };
  const normalizedEmail = email.trim().toLowerCase();
  const map = getFullAttemptMap();
  const now = Date.now();
  
  const current = map[normalizedEmail] || { count: 0, lockExpires: null, locked: false };
  
  // If they were locked but it expired, this becomes attempt #1
  if (current.lockExpires && now > current.lockExpires) {
    current.count = 1;
    current.lockExpires = null;
    current.locked = false;
  } else {
    current.count = (current.count || 0) + 1;
  }

  if (current.count >= MAX_ATTEMPTS) {
    current.locked = true;
    current.lockExpires = now + LOCKOUT_DURATION_MS;
  }

  map[normalizedEmail] = current;
  saveFullAttemptMap(map);
  return current;
};

export const isLockedOut = (email) => {
  if (!email) return false;
  const data = getAttemptData(email);
  return !!data.locked;
};

export const getLockoutRemainingSeconds = (email) => {
  if (!email) return 0;
  const data = getAttemptData(email);
  if (!data.locked || !data.lockExpires) return 0;
  
  const remaining = data.lockExpires - Date.now();
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
};

export const clearAttempts = (email) => {
  if (!email) return;
  const normalizedEmail = email.trim().toLowerCase();
  const map = getFullAttemptMap();
  delete map[normalizedEmail];
  saveFullAttemptMap(map);
};

export const getRemainingAttempts = (email) => {
  if (!email) return MAX_ATTEMPTS;
  const data = getAttemptData(email);
  return Math.max(0, MAX_ATTEMPTS - (data.count || 0));
};

