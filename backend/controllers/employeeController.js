import User from '../models/User.js';
import Employee from '../models/Employee.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Get all employees with pagination, search, filter
// @route   GET /api/employees
// @access  Private (HR and Managers)
export const getEmployees = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (status && status !== 'All') {
      query.employmentStatus = status;
    }

    // If Manager, they can view their assigned team, or all employees if permitted
    if (req.user.role === 'manager' && req.query.teamOnly === 'true') {
      query.managerId = req.user._id;
    }

    let employeesQuery = Employee.find(query)
      .populate('userId', 'name email role status avatar')
      .populate('managerId', 'name email')
      .sort(sort);

    let employees = await employeesQuery;

    // Filter by search keyword (name, email, or employeeId)
    if (search) {
      const term = search.toLowerCase();
      employees = employees.filter((emp) => {
        const empIdMatch = emp.employeeId?.toLowerCase().includes(term);
        const nameMatch = emp.userId?.name?.toLowerCase().includes(term);
        const emailMatch = emp.userId?.email?.toLowerCase().includes(term);
        const designationMatch = emp.designation?.toLowerCase().includes(term);
        return empIdMatch || nameMatch || emailMatch || designationMatch;
      });
    }

    const total = employees.length;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedEmployees = employees.slice(startIndex, startIndex + limitNum);

    res.status(200).json({
      success: true,
      count: paginatedEmployees.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      employees: paginatedEmployees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee by ID
// @route   GET /api/employees/:id
// @access  Private
export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'name email role status avatar createdAt')
      .populate('managerId', 'name email');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Role check: employees can only view their own profile, managers their team or self, HR can view all
    if (
      req.user.role === 'employee' &&
      employee.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this employee profile',
      });
    }

    res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee (HR only)
// @route   POST /api/employees
// @access  Private (HR)
export const createEmployee = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password = 'Password123!',
      role = 'employee',
      department,
      designation,
      phone,
      address,
      managerId,
      salary,
      joiningDate,
    } = req.body;

    if (!name || !email || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, department, and designation',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
    });

    const count = await Employee.countDocuments();
    const employeeId = `EMP-${1000 + count + 1}`;

    const employee = await Employee.create({
      userId: user._id,
      employeeId,
      department,
      designation,
      phone: phone || '',
      address: address || {},
      managerId: managerId || null,
      salary: salary || 0,
      joiningDate: joiningDate || Date.now(),
    });

    // Audit log
    await AuditLog.create({
      action: 'CREATE_EMPLOYEE',
      performedBy: req.user._id,
      targetEntity: 'Employee',
      targetId: employee._id.toString(),
      details: { name, email, employeeId, department, designation },
      ipAddress: req.ip,
    });

    const populatedEmployee = await Employee.findById(employee._id)
      .populate('userId', 'name email role status avatar')
      .populate('managerId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      employee: populatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee (HR or Manager limited)
// @route   PATCH /api/employees/:id
// @access  Private (HR)
export const updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    const {
      name,
      email,
      role,
      department,
      designation,
      phone,
      address,
      managerId,
      employmentStatus,
      salary,
      leaveBalance,
    } = req.body;

    // Update user details if provided
    if (name || email || role || employmentStatus) {
      const user = await User.findById(employee.userId);
      if (user) {
        if (name) user.name = name;
        if (email) user.email = email;
        if (role && req.user.role === 'hr') user.role = role;
        if (employmentStatus) {
          user.status = employmentStatus === 'inactive' || employmentStatus === 'terminated' ? 'inactive' : 'active';
        }
        await user.save();
      }
    }

    // Update employee fields
    if (department) employee.department = department;
    if (designation) employee.designation = designation;
    if (phone !== undefined) employee.phone = phone;
    if (address) employee.address = address;
    if (managerId !== undefined) employee.managerId = managerId || null;
    if (employmentStatus) employee.employmentStatus = employmentStatus;
    if (salary !== undefined && req.user.role === 'hr') employee.salary = salary;
    if (leaveBalance) {
      employee.leaveBalance = {
        ...employee.leaveBalance,
        ...leaveBalance,
      };
    }

    await employee.save();

    // Audit log
    await AuditLog.create({
      action: 'UPDATE_EMPLOYEE',
      performedBy: req.user._id,
      targetEntity: 'Employee',
      targetId: employee._id.toString(),
      details: req.body,
      ipAddress: req.ip,
    });

    const updatedEmployee = await Employee.findById(employee._id)
      .populate('userId', 'name email role status avatar')
      .populate('managerId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      employee: updatedEmployee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate employee account
// @route   PATCH /api/employees/:id/deactivate
// @access  Private (HR)
export const deactivateEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const newStatus = employee.employmentStatus === 'inactive' ? 'active' : 'inactive';
    employee.employmentStatus = newStatus;
    await employee.save();

    const user = await User.findById(employee.userId);
    if (user) {
      user.status = newStatus;
      await user.save();
    }

    // Audit log
    await AuditLog.create({
      action: 'DEACTIVATE_EMPLOYEE',
      performedBy: req.user._id,
      targetEntity: 'Employee',
      targetId: employee._id.toString(),
      details: { status: newStatus },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Employee account marked as ${newStatus}`,
      employmentStatus: newStatus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all managers for assignment
// @route   GET /api/employees/managers/list
// @access  Private (HR and Managers)
export const getManagers = async (req, res, next) => {
  try {
    const managers = await User.find({
      role: { $in: ['manager', 'hr'] },
      status: 'active',
    }).select('name email role');

    res.status(200).json({
      success: true,
      managers,
    });
  } catch (error) {
    next(error);
  }
};

