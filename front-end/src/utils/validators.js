//utils/validator.js
export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address (e.g., name@example.com)';
  }

  if (email.includes('..')) {
    return 'Email cannot contain consecutive dots';
  }
  if (email.includes(' ')) {
    return 'Email cannot contain spaces';
  }
  
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';

  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  
  if (password.length > 20) {
    return 'Password must not exceed 20 characters';
  }

  const uppercaseCount = (password.match(/[A-Z]/g) || []).length;
  if (uppercaseCount < 2) {
    return 'Password must contain at least 2 uppercase letters';
  }

  const lowercaseCount = (password.match(/[a-z]/g) || []).length;
  if (lowercaseCount < 2) {
    return 'Password must contain at least 2 lowercase letters';
  }

  const numberCount = (password.match(/[0-9]/g) || []).length;
  if (numberCount < 2) {
    return 'Password must contain at least 2 numbers';
  }
  
  const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g;
  const specialCharCount = (password.match(specialCharRegex) || []).length;
  if (specialCharCount < 2) {
    return 'Password must contain at least 2 special characters (!@#$%^&*()_+-=[]{};:,.<>?~)';
  }
  
  if (password.includes(' ')) {
    return 'Password cannot contain spaces';
  }
  
  return null;
};




export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8 && password.length <= 20,
    uppercase: (password.match(/[A-Z]/g) || []).length >= 2,
    lowercase: (password.match(/[a-z]/g) || []).length >= 2,
    number: (password.match(/[0-9]/g) || []).length >= 2,
    special: (password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g) || []).length >= 2,
    noSpace: !password.includes(' ')
  };
  
  const allChecksPassed = Object.values(checks).every(check => check === true);
  const passedCount = Object.values(checks).filter(check => check === true).length;
  const strength = (passedCount / 6) * 100;
  
  let strengthLevel = 'weak';
  if (strength >= 80) strengthLevel = 'strong';
  else if (strength >= 60) strengthLevel = 'good';
  else if (strength >= 40) strengthLevel = 'fair';
  
  return {
    checks,
    strength,
    strengthLevel,
    isValid: allChecksPassed,
    message: allChecksPassed ? 'Password is strong' : getPasswordStrengthMessage(checks)
  };
};


const getPasswordStrengthMessage = (checks) => {
  const missing = [];
  if (!checks.length) missing.push('8-20 characters');
  if (!checks.uppercase) missing.push('2 uppercase letters');
  if (!checks.lowercase) missing.push('2 lowercase letters');
  if (!checks.number) missing.push('2 numbers');
  if (!checks.special) missing.push('2 special characters');
  if (!checks.noSpace) missing.push('no spaces');
  
  if (missing.length === 0) return 'Password is valid';
  return `Password must contain: ${missing.join(', ')}`;
};



export const validatePhone = (phone) => {
  if (!phone) return null; 

  const ethiopianRegex = /^(\+251|0)[9][0-9]{8}$/;
  
  const internationalRegex = /^\+\d{10,15}$/;
  
  if (!ethiopianRegex.test(phone) && !internationalRegex.test(phone)) {
    return 'Please enter a valid phone number (e.g., +251912345678 or 0912345678)';
  }
  
  return null;
};



export const validateName = (name, fieldName = 'Name') => {
  if (!name) return `${fieldName} is required`;
  
  if (name.length < 2) {
    return `${fieldName} must be at least 2 characters`;
  }
  
  if (name.length > 50) {
    return `${fieldName} must not exceed 50 characters`;
  }
  
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name)) {
    return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
  }
  
  return null;
};


export const validateDOB = (dob) => {
  if (!dob) return 'Date of birth is required';
  
  const birthDate = new Date(dob);
  const today = new Date();
  
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < 18) {
    return 'You must be at least 18 years old to register';
  }
  
  if (age > 120) {
    return 'Please enter a valid date of birth';
  }
  
  return null;
};


export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  
  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }
  
  return null;
};


export const isRequired = (value, fieldName = 'This field') => {
  if (!value || value.trim() === '') {
    return `${fieldName} is required`;
  }
  return null;
};


export const validateRegisterForm = (formData) => {
  const errors = {
    firstName: validateName(formData.firstName, 'First name'),
    lastName: validateName(formData.lastName, 'Last name'),
    email: validateEmail(formData.email),
    password: validatePassword(formData.password),
    confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword),
    dob: validateDOB(formData.dob)
  };
  
  // Remove null/undefined errors
  Object.keys(errors).forEach(key => {
    if (!errors[key]) delete errors[key];
  });
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};


export const validateRegisterField = (field, value, formData) => {
  switch (field) {
    case 'firstName':
      return validateName(value, 'First name');
    case 'lastName':
      return validateName(value, 'Last name');
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    case 'confirmPassword':
      return validateConfirmPassword(formData.password, value);
    case 'dob':
      return validateDOB(value);
    default:
      return null;
  }
};


export const getPasswordStrengthColor = (strengthLevel) => {
  switch (strengthLevel) {
    case 'strong':
      return { bg: '#48bb78', text: 'Strong password' };
    case 'good':
      return { bg: '#4299e1', text: 'Good password' };
    case 'fair':
      return { bg: '#ed8936', text: 'Fair password' };
    default:
      return { bg: '#e53e3e', text: 'Weak password' };
  }
};


export const isEmailValidFormat = (email) => {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const securityValidators = {

  
  sanitizeInput: (input) => {
    if (!input) return '';
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  },

  isSafeQuery: (input) => {
    if (!input) return true;
    const dangerous = /[\$'";`\\%--]|(\/\*)|(\*\/)|(union)|(select)|(insert)|(update)|(delete)|(drop)|(where)|(exec)|(or)|(and)/i;
    return !dangerous.test(input);
  },

  escapeSpecialChars: (input) => {
    if (!input) return '';
    return input
      .replace(/[\\$'"]/g, '\\$&')
      .replace(/\0/g, '\\0')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\x1a/g, '\\Z');
  },


  // ==================== BASIC FIELD VALIDATION ====================
  
  isRequired: (value, fieldName = 'This field') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} is required`;
    }
    if (Array.isArray(value) && value.length === 0) {
      return `${fieldName} is required`;
    }
    return null;
  },

  isValidLength: (value, min, max, fieldName = 'This field') => {
    if (!value) return null;
    const length = typeof value === 'string' ? value.length : String(value).length;
    if (length < min) return `${fieldName} must be at least ${min} characters`;
    if (length > max) return `${fieldName} must not exceed ${max} characters`;
    return null;
  },

 
  
  isValidName: (name, fieldName = 'Name') => {
    if (!name) return `${fieldName} is required`;
    if (name.length < 2) return `${fieldName} must be at least 2 characters`;
    if (name.length > 50) return `${fieldName} must not exceed 50 characters`;
    if (/[0-9]/.test(name)) return `${fieldName} cannot contain numbers`;
    
    const nameRegex = /^[a-zA-Z\s\-'\.]+$/;
    if (!nameRegex.test(name)) {
      return `${fieldName} can only contain letters, spaces, hyphens, apostrophes, and dots`;
    }
    return null;
  },

  // ==================== EMAIL VALIDATION ====================
  
  isValidEmail: (email) => {
    if (!email) return 'Email is required';
    if (email.length > 254) return 'Email is too long';
    if (email.includes(' ')) return 'Email cannot contain spaces';
    if (email.includes('..')) return 'Email cannot contain consecutive dots';
    if (email.includes('@') && email.split('@').length > 2) return 'Email cannot contain multiple @ symbols';
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const blockedPattern = /['"`;\\%--]|(<)|(>)/;
    
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    if (blockedPattern.test(email)) return 'Email contains invalid characters';
    
    const domain = email.split('@')[1];
    if (domain && !domain.includes('.')) return 'Invalid email domain';
    
    return null;
  },

  // ==================== PASSWORD VALIDATION ====================
  
  isStrongPassword: (password, email = '', username = '') => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password.length > 128) return 'Password must not exceed 128 characters';
    if (password.includes(' ')) return 'Password cannot contain spaces';
    if (password === password.toLowerCase()) return 'Password must contain uppercase letters';
    if (password === password.toUpperCase()) return 'Password must contain lowercase letters';
    
    if (email && password === email) return 'Password cannot be the same as email';
    if (username && password === username) return 'Password cannot be the same as username';
    if (password.toLowerCase().includes('password')) return 'Password contains common word "password"';
    
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    
    if (!hasUpper) return 'Password must contain at least 1 uppercase letter';
    if (!hasLower) return 'Password must contain at least 1 lowercase letter';
    if (!hasNumber) return 'Password must contain at least 1 number';
    if (!hasSpecial) return 'Password must contain at least 1 special character';
    
    return null;
  },

  isCommonPassword: (password) => {
    const commonPasswords = [
      'password123', 'admin123', '12345678', 'qwerty123',
      'password', '123456789', 'letmein123', 'welcome123',
      'Admin@123', 'Pass@123', 'User@123', 'Test@123',
      'P@ssw0rd', 'Admin@2024', 'User@2024'
    ];
    return commonPasswords.includes(password.toLowerCase());
  },

  doPasswordsMatch: (password, confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  },

  // ==================== PHONE VALIDATION ====================
  
  isValidPhone: (phone) => {
    if (!phone) return null;
    if (phone.length < 10) return 'Phone number is too short';
    if (phone.length > 15) return 'Phone number is too long';
    
    const ethiopianRegex = /^(\+251|0)[9][0-9]{8}$/;
    const internationalRegex = /^\+\d{10,15}$/;
    
    if (/[a-zA-Z]/.test(phone)) return 'Phone number cannot contain letters';
    if (!ethiopianRegex.test(phone) && !internationalRegex.test(phone)) {
      return 'Enter a valid phone number (+251XXXXXXXXX or 09XXXXXXXX)';
    }
    return null;
  },

  // ==================== INSTITUTION VALIDATION ====================
  
  isValidInstitutionName: (name) => {
    if (!name) return 'Institution name is required';
    if (name.length < 3) return 'Institution name must be at least 3 characters';
    if (name.length > 100) return 'Institution name must not exceed 100 characters';
    
    const nameRegex = /^[a-zA-Z0-9\s\-'\.&]+$/;
    if (!nameRegex.test(name)) return 'Institution name contains invalid characters';
    return null;
  },

  isValidInstitutionCode: (code) => {
    if (!code) return 'Institution code is required';
    if (code.length < 2) return 'Code must be at least 2 characters';
    if (code.length > 20) return 'Code must not exceed 20 characters';
    if (!/^[A-Z0-9_-]+$/.test(code)) {
      return 'Code can only contain uppercase letters, numbers, underscores, and hyphens';
    }
    return null;
  },

  isValidInstitutionAddress: (address) => {
    if (!address) return null;
    if (address.length > 200) return 'Address must not exceed 200 characters';
    if (/<[^>]*>/.test(address)) return 'Address cannot contain HTML tags';
    return null;
  },
  isValidInstitutionDesc:(about)=>{
    if (!about) return null; // About is optional
    if (about.length < 20) return 'About institution should be at least 20 characters';
    if (about.length > 500) return 'About institution must not exceed 500 characters';
    if (/<[^>]*>/.test(about)) return 'About institution cannot contain HTML tags';
    return null;
  },
  isValidInstitutionWebsite: (website) => {
    if (!website) return null;
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (!urlRegex.test(website)) return 'Enter a valid website URL';
    return null;
  },

  // ==================== NOMINATION VALIDATION ====================
  
  isValidManifesto: (manifesto) => {
    if (!manifesto) return 'Manifesto is required';
    if (manifesto.length < 100) return 'Manifesto must be at least 100 characters';
    if (manifesto.length > 5000) return 'Manifesto must not exceed 5000 characters';
    
    const wordCount = securityValidators.getWordCount(manifesto);
    if (wordCount < 15) return 'Manifesto must be at least 15 words';
    if (wordCount > 1000) return 'Manifesto must not exceed 1000 words';
    
    const upperCount = (manifesto.match(/[A-Z]/g) || []).length;
    if (upperCount / manifesto.length > 0.5) return 'Manifesto has too many uppercase letters';
    
    return null;
  },

  isValidBiography: (biography) => {
    if (!biography) return 'Biography is required';
    if (biography.length < 50) return 'Biography must be at least 50 characters';
    if (biography.length > 2000) return 'Biography must not exceed 2000 characters';
    
    const wordCount = securityValidators.getWordCount(biography);
    if (wordCount < 10) return 'Biography must be at least 10 words';
    if (wordCount > 300) return 'Biography must not exceed 300 words';
    
    return null;
  },

  isValidSlogan: (slogan) => {
    if (!slogan) return null;
    if (slogan.length < 5) return 'Slogan must be at least 5 characters';
    if (slogan.length > 200) return 'Slogan must not exceed 200 characters';
    
    const wordCount = securityValidators.getWordCount(slogan);
    if (wordCount < 3) return 'Slogan must be at least 2 words';
    if (wordCount > 15) return 'Slogan must not exceed 5 words';
    
    return null;
  },

  isValidPositionId: (positionId) => {
    if (!positionId) return 'Position ID is required';
    if (!/^[A-Z0-9-]+$/i.test(positionId)) return 'Invalid position ID format';
    return null;
  },

  // ==================== ELECTION VALIDATION ====================
  
  isValidElectionTitle: (title) => {
    if (!title) return 'Election title is required';
    if (title.length < 5) return 'Title must be at least 5 characters';
    if (title.length > 100) return 'Title must not exceed 100 characters';
    
    const blockedPattern = /[<>'";`$]/;
    if (blockedPattern.test(title)) return 'Title contains invalid characters';
    return null;
  },

  isValidElectionDescription: (description) => {
    if (!description) return null;
    if (description.length < 20) return 'Description must be at least 20 characters';
    if (description.length > 1000) return 'Description must not exceed 1000 characters';
    
    const wordCount = securityValidators.getWordCount(description);
    if (wordCount < 5) return 'Description must be at least 5 words';
    if (wordCount > 150) return 'Description must not exceed 150 words';
    
    return null;
  },

  // ==================== ELECTION TIMELINE VALIDATION ====================
  
  isValidElectionTimeline: (timeline) => {
    const errors = {};
    const now = new Date();
   
    //
    if (!timeline.registrationStart || !timeline.registrationEnd) {
      errors.registration = 'Registration dates are required';
    } else {
      const regStart = new Date(timeline.registrationStart);
      const regEnd = new Date(timeline.registrationEnd);
      
      if (regEnd <= regStart) {
        errors.registration = 'Registration end must be after start';
      }
      if (regStart < now) {
        errors.registration = 'Registration start must be in the future';
      }
      if (regEnd <= now) {
        errors.registration = 'Registration end must be in the future';
      }
    }
    
    // Nomination Dates Validation
    if (!timeline.nominationStart || !timeline.nominationEnd) {
      errors.nomination = 'Nomination dates are required';
    } else {
      const nomStart = new Date(timeline.nominationStart);
      const nomEnd = new Date(timeline.nominationEnd);
      const registrationEnd = new Date(timeline.registrationEnd);
      
      if (nomEnd <= nomStart) {
        errors.nomination = 'Nomination end must be after start';
      }
      if (nomStart <= registrationEnd) {
        errors.nomination = 'Nomination must start after registration ends';
      }
      if (nomStart < now) {
        errors.nomination = 'Nomination start must be in the future';
      }
    }
    
    // Voting Dates Validation
    if (!timeline.votingStart || !timeline.votingEnd) {
      errors.voting = 'Voting dates are required';
    } else {
      const voteStart = new Date(timeline.votingStart);
      const voteEnd = new Date(timeline.votingEnd);
      const nominationEnd = new Date(timeline.nominationEnd);
      
      if (voteEnd <= voteStart) {
        errors.voting = 'Voting end must be after start';
      }
      if (voteStart <= nominationEnd) {
        errors.voting = 'Voting must start after nomination ends';
      }
      if (voteStart < now) {
        errors.voting = 'Voting start must be in the future';
      }
    }
    
    // Results Publication Date Validation
    if (timeline.resultPublicationDate) {
      const resultDate = new Date(timeline.resultPublicationDate);
      const votingEnd = new Date(timeline.votingEnd);
      
      if (resultDate <= votingEnd) {
        errors.result = 'Results must be published after voting ends';
      }
      if (resultDate < now) {
        errors.result = 'Results publication date must be in the future';
      }
    }
    
    // Logical Order Validation (cascading timeline)
    if (timeline.registrationEnd && timeline.nominationStart) {
      const regEnd = new Date(timeline.registrationEnd);
      const nomStart = new Date(timeline.nominationStart);
      
      if (nomStart <= regEnd) {
        errors.order = 'Timeline order error: Nomination must start after Registration ends';
      }
    }
    
    if (timeline.nominationEnd && timeline.votingStart) {
      const nomEnd = new Date(timeline.nominationEnd);
      const voteStart = new Date(timeline.votingStart);
      
      if (voteStart <= nomEnd) {
        errors.order = 'Timeline order error: Voting must start after Nomination ends';
      }
    }
    
    if (timeline.votingEnd && timeline.resultPublicationDate) {
      const voteEnd = new Date(timeline.votingEnd);
      const resultDate = new Date(timeline.resultPublicationDate);
      
      if (resultDate <= voteEnd) {
        errors.order = 'Timeline order error: Results must be published after Voting ends';
      }
    }
    
    return errors;
  },

  isValidPositionName: (name) => {
    if (!name) return 'Position name is required';
    if (name.length < 2) return 'Position name must be at least 2 characters';
    if (name.length > 50) return 'Position name must not exceed 50 characters';
    
    const nameRegex = /^[a-zA-Z0-9\s\-'&]+$/;
    if (!nameRegex.test(name)) return 'Position name contains invalid characters';
    return null;
  },

  isValidTotalSeats: (seats) => {
    const num = Number(seats);
    if (isNaN(num)) return 'Total seats must be a number';
    if (!Number.isInteger(num)) return 'Total seats must be an integer';
    if (num < 1) return 'Total seats must be at least 1';
    if (num > 20) return 'Total seats cannot exceed 20';
    return null;
  },

  isValidMaxCandidates: (maxCandidates, totalSeats) => {
    const num = Number(maxCandidates);
    if (isNaN(num)) return 'Max candidates must be a number';
    if (num < totalSeats) return `Max candidates must be at least ${totalSeats}`;
    if (num > 50) return 'Max candidates cannot exceed 50';
    return null;
  },

  // ==================== ID VALIDATION WITH PATTERNS ====================
  
  /**
   * Election ID Validation
   * Format: ELEC-YYYY-NNNN (e.g., ELEC-2024-6838)
   * - YYYY: 4-digit year (2000 to current year + 5)
   * - NNNN: 4-6 digit sequential number
   */
  isValidElectionId: (electionId) => {
    if (!electionId) return 'Election ID is required';
    
    const pattern = /^ELEC-\d{4}-\d{4,6}$/;
    
    if (!pattern.test(electionId)) {
      return 'Election ID must follow format: ELEC-YYYY-NNNN (e.g., ELEC-2024-6838)';
    }
    
    const year = parseInt(electionId.split('-')[1]);
    const currentYear = new Date().getFullYear();
    
    if (year < 2000 || year > currentYear + 5) {
      return `Invalid election year. Must be between 2000 and ${currentYear + 5}`;
    }
    
    return null;
  },

  /**
   * Voter ID Validation
   * Format: VOTER-XXXXX-XXXXXX-X (e.g., VOTER-abrsh-ywqwh3-3)
   * - First segment: 4-6 lowercase letters
   * - Second segment: 5-8 alphanumeric characters
   * - Third segment: 1-2 digit number
   */
  isValidVoterId: (voterId) => {
    if (!voterId) return 'Voter ID is required';
    
    const pattern = /^VOTER-[a-z]{4,6}-[a-z0-9]{5,8}-\d{1,2}$/i;
    
    if (!pattern.test(voterId)) {
      return 'Voter ID must follow format: VOTER-XXXXX-XXXXXX-X (e.g., VOTER-abrsh-ywqwh3-3)';
    }
    
    const parts = voterId.split('-');
    if (parts.length !== 4) return 'Invalid Voter ID format';
    
    const firstSegment = parts[1];
    const secondSegment = parts[2];
    const thirdSegment = parts[3];
    
    // Validate first segment (must be all letters)
    if (firstSegment.length < 4 || firstSegment.length > 6) {
      return 'First segment must be 4-6 characters';
    }
    if (!/^[a-zA-Z]+$/.test(firstSegment)) {
      return 'First segment must contain only letters';
    }
    
    // Validate second segment
    if (secondSegment.length < 5 || secondSegment.length > 8) {
      return 'Second segment must be 5-8 characters';
    }
    if (!/^[a-zA-Z0-9]+$/.test(secondSegment)) {
      return 'Second segment must contain only letters and numbers';
    }
    
    // Validate third segment (must be numeric)
    if (!/^\d+$/.test(thirdSegment)) {
      return 'Last segment must be numeric';
    }
    
    const numValue = parseInt(thirdSegment);
    if (numValue < 1 || numValue > 99) {
      return 'Last segment must be between 1 and 99';
    }
    
    return null;
  },

  // Simple ObjectId validation (24 hex chars)
  isValidObjectId: (id) => {
    if (!id) return false;
    return /^[0-9a-fA-F]{24}$/.test(id);
  },

  isValidElectionCode: (code) => {
    if (!code) return 'Election code is required';
    if (code.length < 5) return 'Election code is invalid';
    if (code.length > 30) return 'Election code too long';
    
    const codeRegex = /^[A-Z0-9-]+$/i;
    if (!codeRegex.test(code)) return 'Election code contains invalid characters';
    return null;
  },

  isValidVoterCode: (code) => {
    if (!code) return 'Voter code is required';
    if (code.length < 5) return 'Voter code is invalid';
    if (code.length > 30) return 'Voter code too long';
    
    const codeRegex = /^[A-Z0-9-]+$/i;
    if (!codeRegex.test(code)) return 'Voter code contains invalid characters';
    return null;
  },

  // ==================== ID GENERATION HELPERS ====================
  
  generateElectionId: () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `ELEC-${year}-${random}`;
  },

  generateVoterId: () => {
    const firstSegment = Math.random().toString(36).substring(2, 8).toLowerCase();
    const secondSegment = Math.random().toString(36).substring(2, 10).toLowerCase();
    const thirdSegment = Math.floor(Math.random() * 99) + 1;
    return `VOTER-${firstSegment}-${secondSegment}-${thirdSegment}`;
  },

  generateReadableVoterId: (firstName = '', lastName = '') => {
    const prefix1 = firstName ? firstName.substring(0, 3).toLowerCase() : 'xxx';
    const prefix2 = lastName ? lastName.substring(0, 3).toLowerCase() : 'xxx';
    const random = Math.random().toString(36).substring(2, 6);
    const num = Math.floor(Math.random() * 99) + 1;
    return `VOTER-${prefix1}${prefix2}-${random}-${num}`;
  },

  normalizeElectionId: (electionId) => {
    if (!electionId) return null;
    let normalized = electionId.toUpperCase();
    if (!normalized.startsWith('ELEC-')) {
      normalized = `ELEC-${normalized}`;
    }
    return normalized;
  },

  normalizeVoterId: (voterId) => {
    if (!voterId) return null;
    let normalized = voterId;
    if (!normalized.toUpperCase().startsWith('VOTER-')) {
      normalized = `VOTER-${normalized}`;
    }
    return normalized;
  },

  // ==================== VOTING VALIDATION ====================
  
  isValidVoteSelection: (selections, positions, requireAll = true) => {
    const errors = {};
    
    if (requireAll) {
      for (const position of positions) {
        if (!selections[position.positionId]) {
          errors[position.positionId] = `Please vote for ${position.positionName}`;
        }
      }
    }
    
    const votedPositions = Object.keys(selections);
    if (votedPositions.length !== new Set(votedPositions).size) {
      errors.duplicate = 'Cannot vote for same position multiple times';
    }
    
    return {
      errors,
      isValid: Object.keys(errors).length === 0
    };
  },

  isValidRankedVote: (rankings, totalSeats) => {
    if (!rankings || !Array.isArray(rankings)) return 'Rankings are required';
    if (rankings.length !== totalSeats) return `Please rank exactly ${totalSeats} candidates`;
    
    const uniqueRanks = new Set(rankings);
    if (uniqueRanks.size !== rankings.length) return 'Duplicate ranks are not allowed';
    
    for (const rank of rankings) {
      if (rank < 1 || rank > totalSeats) return `Invalid rank number: ${rank}`;
    }
    
    return null;
  },

  // ==================== CODE & OTP VALIDATION ====================
  
  isValidOTP: (otp) => {
    if (!otp) return 'OTP is required';
    if (!/^\d{6}$/.test(otp)) return 'OTP must be 6 digits';
    return null;
  },

  isValidReferralCode: (code) => {
    if (!code) return null;
    if (code.length !== 8) return 'Referral code must be 8 characters';
    if (!/^[A-Z0-9]{8}$/.test(code)) return 'Referral code must contain only uppercase letters and numbers';
    return null;
  },

  // ==================== FILE VALIDATION ====================
  
  isValidImageFile: (file, maxSizeMB = 5) => {
    if (!file) return null;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    const maxSize = maxSizeMB * 1024 * 1024;
    
    if (!allowedTypes.includes(file.type)) {
      return `Only ${allowedTypes.map(t => t.split('/')[1].toUpperCase()).join(', ')} images are allowed`;
    }
    if (file.size > maxSize) {
      return `Image must be less than ${maxSizeMB}MB`;
    }
    return null;
  },

  isValidDocumentFile: (file, maxSizeMB = 10) => {
    if (!file) return null;
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    const maxSize = maxSizeMB * 1024 * 1024;
    
    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF, DOC, and DOCX files are allowed';
    }
    if (file.size > maxSize) {
      return `Document must be less than ${maxSizeMB}MB`;
    }
    return null;
  },

  isValidVoterListFile: (file) => {
    if (!file) return 'Voter list file is required';
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const maxSize = 5 * 1024 * 1024;
    
    if (!allowedTypes.includes(file.type)) {
      return 'Only CSV and Excel files are allowed';
    }
    if (file.size > maxSize) {
      return 'File must be less than 5MB';
    }
    return null;
  },

  // ==================== TEXT & CONTENT VALIDATION ====================
  
  getWordCount: (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  },

  isValidWordCount: (text, min, max) => {
    if (!text) return min === 0;
    const count = securityValidators.getWordCount(text);
    return count >= min && count <= max;
  },

  isValidSlug: (slug) => {
    if (!slug) return false;
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  },

  isValidUrl: (url) => {
    if (!url) return true;
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  },

  // ==================== DECLARATION VALIDATION ====================
  
  isValidDeclaration: (declarations, requiredDeclarations = ['codeOfConduct', 'spendingLimit', 'truthfulness']) => {
    const missing = [];
    for (const decl of requiredDeclarations) {
      if (!declarations[decl]) {
        missing.push(decl);
      }
    }
    if (missing.length > 0) {
      return `Please accept all declarations: ${missing.join(', ')}`;
    }
    return null;
  },

  // ==================== DATE VALIDATION ====================
  
  isFutureDate: (date, fieldName = 'Date') => {
    if (!date) return `${fieldName} is required`;
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return `${fieldName} is invalid`;
    if (dateObj <= new Date()) return `${fieldName} must be in the future`;
    return null;
  },

  isPastDate: (date, fieldName = 'Date') => {
    if (!date) return `${fieldName} is required`;
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return `${fieldName} is invalid`;
    if (dateObj >= new Date()) return `${fieldName} must be in the past`;
    return null;
  },

  isValidAge: (dob, minAge = 18) => {
    if (!dob) return 'Date of birth is required';
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return 'Invalid date of birth';
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    if (age < minAge) return `You must be at least ${minAge} years old`;
    if (age > 120) return 'Please enter a valid date of birth';
    return null;
  },

  // ==================== NUMBER VALIDATION ====================
  
  isValidNumberInRange: (value, min, max, fieldName = 'Value') => {
    if (value === undefined || value === null) return `${fieldName} is required`;
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a number`;
    if (num < min) return `${fieldName} must be at least ${min}`;
    if (num > max) return `${fieldName} must not exceed ${max}`;
    return null;
  },

  isPositiveInteger: (value, fieldName = 'Value') => {
    if (value === undefined || value === null) return `${fieldName} is required`;
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a number`;
    if (!Number.isInteger(num)) return `${fieldName} must be an integer`;
    if (num <= 0) return `${fieldName} must be a positive number`;
    return null;
  },

  isValidPercentage: (value, fieldName = 'Percentage') => {
    if (value === undefined || value === null) return null;
    const num = Number(value);
    if (isNaN(num)) return `${fieldName} must be a number`;
    if (num < 0) return `${fieldName} cannot be negative`;
    if (num > 100) return `${fieldName} cannot exceed 100`;
    return null;
  },

  // ==================== ARRAY VALIDATION ====================
  
  isNonEmptyArray: (arr, fieldName = 'Array') => {
    if (!arr || !Array.isArray(arr)) return `${fieldName} is required`;
    if (arr.length === 0) return `${fieldName} cannot be empty`;
    return null;
  },

  isArrayMaxLength: (arr, max, fieldName = 'Array') => {
    if (!arr || !Array.isArray(arr)) return null;
    if (arr.length > max) return `${fieldName} cannot have more than ${max} items`;
    return null;
  },

  hasUniqueValues: (arr, fieldName = 'Array') => {
    if (!arr || !Array.isArray(arr)) return null;
    const unique = new Set(arr);
    if (unique.size !== arr.length) return `${fieldName} contains duplicate values`;
    return null;
  }
};

// ==================== HELPER FUNCTION ====================

export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  for (const [field, rules] of Object.entries(validationRules)) {
    const value = formData[field];
    
    for (const rule of rules) {
      const error = rule(value, formData);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

// ==================== PRE-BUILT VALIDATION RULE SETS ====================

export const validationRules = {
  // User Registration
  register: {
    firstName: [(v) => securityValidators.isRequired(v, 'First name'), (v) => securityValidators.isValidName(v, 'First name')],
    lastName: [(v) => securityValidators.isRequired(v, 'Last name'), (v) => securityValidators.isValidName(v, 'Last name')],
    email: [securityValidators.isValidEmail],
    phone: [securityValidators.isValidPhone],
    dob: [securityValidators.isValidAge],
    password: [securityValidators.isStrongPassword],
    confirmPassword: [(v, form) => securityValidators.doPasswordsMatch(form?.password, v)]
  },
  
  // Login
  login: {
    email: [securityValidators.isValidEmail],
    password: [securityValidators.isRequired]
  },
  
  // Election Creation
  createElection: {
    title: [securityValidators.isValidElectionTitle],
    description: [securityValidators.isValidElectionDescription],
    positions: [securityValidators.isNonEmptyArray],
    timeline: [(v) => {
      const errors = securityValidators.isValidElectionTimeline(v);
      return Object.keys(errors).length > 0 ? Object.values(errors)[0] : null;
    }]
  },
  
  // Position Creation
  createPosition: {
    positionName: [securityValidators.isValidPositionName],
    totalSeats: [securityValidators.isValidTotalSeats],
    electionType: [securityValidators.isRequired],
    positionDescription: [(v) => securityValidators.isValidLength(v, 10, 500, 'Position description')]
  },
  
  // Nomination Submission
  submitNomination: {
    electionId: [securityValidators.isRequired],
    positionId: [securityValidators.isValidPositionId],
    manifesto: [securityValidators.isValidManifesto],
    biography: [securityValidators.isValidBiography],
    slogan: [securityValidators.isValidSlogan],
    campaignPhoto: [securityValidators.isValidImageFile],
    declarations: [securityValidators.isValidDeclaration]
  },
  
  // Institution Creation
  createInstitution: {
    name: [securityValidators.isValidInstitutionName],
    code: [securityValidators.isValidInstitutionCode],
    email: [securityValidators.isValidEmail],
    phone: [securityValidators.isValidPhone],
    address: [securityValidators.isValidInstitutionAddress],
    website: [securityValidators.isValidInstitutionWebsite]
  },
  
  // Election ID Validation
  electionId: {
    id: [securityValidators.isValidElectionId]
  },
  
  // Voter ID Validation
  voterId: {
    id: [securityValidators.isValidVoterId]
  },
  
  // Verification Credentials
  verifyCredentials: {
    electionCode: [securityValidators.isValidElectionCode],
    voterCode: [securityValidators.isValidVoterCode]
  },
  
  // OTP Verification
  verifyOTP: {
    email: [securityValidators.isValidEmail],
    otp: [securityValidators.isValidOTP]
  },
  
  // Password Reset
  resetPassword: {
    password: [securityValidators.isStrongPassword],
    confirmPassword: [(v, form) => securityValidators.doPasswordsMatch(form?.password, v)]
  },
  
  // Voting
  castVote: {
    selections: [(v, form) => {
      const result = securityValidators.isValidVoteSelection(v, form?.positions, form?.requireAll);
      return result.isValid ? null : Object.values(result.errors)[0];
    }],
    electionId: [securityValidators.isValidElectionId]
  }
};

export default securityValidators;