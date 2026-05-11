const crypto = require('crypto');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateSecureOTP = () => {
  const randomBytes = crypto.randomBytes(3);
  const otp = (randomBytes.readUIntBE(0, 3) % 1000000).toString().padStart(6, '0');
  return otp;
};

module.exports = { generateOTP, generateSecureOTP };