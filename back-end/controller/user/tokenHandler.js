
const jwt = require('jsonwebtoken');
const User = require('../../model/userModel');

const signTokens = (id, email) => {
  const accessSecret = process.env.JWT_ACCESS_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  
  if (!accessSecret || !refreshSecret) {
    throw new Error('JWT secrets are not defined in environment variables');
  }

  const accessToken = jwt.sign(
    { id, email },
    accessSecret,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d' }
  );
  
  const refreshToken = jwt.sign(
    { id, email },
    refreshSecret,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

const createSendToken = async (user, res, message, statusCode = 200) => {
  const { _id: id, email } = user;
  const { accessToken, refreshToken } = signTokens(id, email);
  
  
  await User.findByIdAndUpdate(id, { refreshToken });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.cookie('isLoggedIn', true, {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  res.status(statusCode).json({
    status: "success",
    accessToken,
    message,
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        photo: user.photo,
        role: user.role
      }
    }
  });
};
 
module.exports = { signTokens, createSendToken };