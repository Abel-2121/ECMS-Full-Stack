// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const authMiddleware = {
  protect: catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];

    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to access this resource.', 401));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const currentUser = await User.findById(decoded.id);

      if (!currentUser) {
        return next(new AppError('The user belonging to this token no longer exists.', 401));
      }

      if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password. Please log in again.', 401));
      }

      req.user = currentUser;
      next();
    } catch (err) {
     
      if (err.name === 'TokenExpiredError') {
        return next(new AppError('jwt expired', 401));
      }
      if (err.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token', 401));
      }
      return next(err);
    }
  }),

  authorize: (...allowedRoles) => {
    return (req, res, next) => {
      const { role } = req.user;
      const hasPermission = allowedRoles.includes(role);
      
      if (!hasPermission) {
        return next(new AppError('Forbidden: You do not have permission to perform this action.', 403));
      }
      next();
    };
  },

  isOwner: (model) => {
    return catchAsync(async (req, res, next) => {
      const resourceId = req.params.id;
      const userId = req.user.id;
      const resource = await model.findById(resourceId);
       
      if (!resource) {
        return next(new AppError('Resource not found.', 404));
      }   
      req.resource = resource;
      const { createdBy } = resource;
      
      if (createdBy.toString() !== userId.toString()) {
        return next(new AppError('You do not own this resource.', 401));
      }
      next();
    });
  }
};

module.exports = authMiddleware;