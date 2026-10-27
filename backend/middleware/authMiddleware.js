import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'staffsync_fallback_secret_key_12345'
    );

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact HR.',
      });
    }

    req.user = user;

    // Attach employee profile if available
    const employee = await Employee.findOne({ userId: user._id });
    if (employee) {
      req.employee = employee;
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Invalid token.',
    });
  }
};

