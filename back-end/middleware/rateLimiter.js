
require('dotenv').config();

const rateLimit = require('express-rate-limit');
const MongoStore = require('rate-limit-mongo');
const { ipKeyGenerator } = require('express-rate-limit');

const mongoUri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@ecms.0fs4jsc.mongodb.net/ECMS?retryWrites=true&w=majority&appName=ECMS`;

const safeKeyGenerator = (req) => {
  const ip = ipKeyGenerator(req); // Proper IPv6 handling
  const userId = req.user?.id || 'anonymous';
  const email = req.body.email || 'anonymous';
  return `${userId}_${email}_${ip}`;
};

const store = new MongoStore({
  uri: mongoUri,
  collectionName: 'rateLimits',
  expireTimeMs: 15 * 60 * 1000 
});

const loginLimiter = rateLimit({
  store: store,
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  skipSuccessfulRequests: true, 
  message: {
    status: 'fail',
    message: 'Too many login attempts. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: safeKeyGenerator
});

const registerLimiter = rateLimit({
  store: store,
  windowMs: 60 * 60 * 1000, 
  max: 5, 
  message: {
    status: 'fail',
    message: 'Too many registration attempts. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: safeKeyGenerator
});

const otpLimiter = rateLimit({
  store: store,
  windowMs: 10 * 60 * 1000, 
  max: 5, 
  message: {
    status: 'fail',
    message: 'Too many OTP verification attempts. Please try again after 10 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: safeKeyGenerator
});

const otpRequestLimiter = rateLimit({
  store: store,
  windowMs: 5 * 60 * 1000, 
  max: 3, 
  message: {
    status: 'fail',
    message: 'Too many OTP requests. Please wait 5 minutes before requesting again.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: safeKeyGenerator
});

const passwordResetLimiter = rateLimit({
  store: store,
  windowMs: 60 * 60 * 1000, 
  max: 3, 
  message: {
    status: 'fail',
    message: 'Too many password reset attempts. Please try again after an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: safeKeyGenerator
});

const voteLimiter = rateLimit({
  store: store,
  windowMs: 1 * 60 * 1000, 
  max: 1, 
  message: {
    status: 'fail',
    message: 'You have already voted in this election.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    return `vote_${req.user?.id}_${req.body.electionId}_${ip}`;
  }
});

const nominationLimiter = rateLimit({
  store: store,
  windowMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  max: 1, // 1 nomination per election
  message: {
    status: 'fail',
    message: 'You have already submitted a nomination for this election.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    return `nomination_${req.user?.id}_${req.body.electionId}_${ip}`;
  }
});

const voterRegistrationLimiter = rateLimit({
  store: store,
  windowMs: 24 * 60 * 60 * 1000, 
  max: 3, 
  message: {
    status: 'fail',
    message: 'Too many registration attempts for this election. Please try again tomorrow.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
  
    const ip = ipKeyGenerator(req);
    return `voter_reg_${req.body.email}_${req.params.electionId}_${ip}`;
  }
});

const electionCreationLimiter = rateLimit({
  store: store,
  windowMs: 60 * 60 * 1000, 
  max:5, 
  message: {
    status: 'fail',
    message: 'Too many elections created. Please wait an hour before creating more.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    return `election_create_${req.user?.id}_${ip}`;
  }
});

const verifyCredentialLimiter = rateLimit({
  store: store,
  windowMs: 1 * 60 * 1000, 
  max: 5, 
  message: {
    status: 'fail',
    message: 'Too many verify credential attempts. Please try again after 30 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    
    const ip = ipKeyGenerator(req);
    return `verify_credential_${req.body.electionId}_${req.body.voterId}_${ip}`;
  }
});

const strictLimiter = rateLimit({
  store: store,
  windowMs: 5 * 60 * 1000, 
  max: 10, 
  message: {
    status: 'fail',
    message: 'Too many sensitive operations. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: safeKeyGenerator
});

const globalLimiter = rateLimit({
  store: store,
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req);
    return `global_${ip}`;
  }
});

module.exports = {
  globalLimiter,
  loginLimiter,
  registerLimiter,
  otpLimiter,
  otpRequestLimiter,
  passwordResetLimiter,
  voteLimiter,
  nominationLimiter,
  voterRegistrationLimiter,
  electionCreationLimiter,
  strictLimiter,
  verifyCredentialLimiter
};