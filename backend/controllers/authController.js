import User from '../models/User.js';
import Employee from '../models/Employee.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, designation, phone } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    // Security rule: Public registration cannot create HR accounts
    let assignedRole = 'employee';
    if (role === 'manager') {
      assignedRole = 'manager';
    } else if (role === 'hr') {
      // Allow only if no users exist in the database (initial setup)
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        assignedRole = 'hr';
      } else {
        return res.status(403).json({
          success: false,
          message: 'HR accounts cannot be created via public registration. Contact your HR administrator.',
        });
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
    });

    // Generate unique employee ID e.g. EMP-1001
    const count = await Employee.countDocuments();
    const employeeId = `EMP-${1000 + count + 1}`;

    // Create employee record
    const employee = await Employee.create({
      userId: user._id,
      employeeId,
      department: department || (assignedRole === 'hr' ? 'Human Resources' : 'Engineering'),
      designation: designation || (assignedRole === 'hr' ? 'HR Manager' : assignedRole === 'manager' ? 'Team Lead' : 'Software Engineer'),
      phone: phone || '',
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact HR.',
      });
    }

    const employee = await Employee.findOne({ userId: user._id }).populate('managerId', 'name email');

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      },
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user & employee profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const employee = await Employee.findOne({ userId: req.user.id }).populate('managerId', 'name email');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      },
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update personal profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    await user.save();

    let employee = await Employee.findOne({ userId: req.user.id });
    if (employee) {
      if (phone !== undefined) employee.phone = phone;
      if (address !== undefined) {
        employee.address = {
          street: address.street || employee.address?.street || '',
          city: address.city || employee.address?.city || '',
          state: address.state || employee.address?.state || '',
          zip: address.zip || employee.address?.zip || '',
          country: address.country || employee.address?.country || '',
        };
      }
      await employee.save();
      employee = await Employee.findOne({ userId: req.user.id }).populate('managerId', 'name email');
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      },
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User logged out successfully',
  });
};

