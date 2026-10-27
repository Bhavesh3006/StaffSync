import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';

// Calculate days between two dates inclusive
const calculateDays = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = Math.abs(e - s);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private
export const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leave type, start date, end date, and reason',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee record not found for your account',
      });
    }

    const daysCount = calculateDays(start, end);

    // Check leave balance (if leaveType is tracked, e.g. annual, sick, casual)
    if (['annual', 'sick', 'casual'].includes(leaveType)) {
      const balance = employee.leaveBalance[leaveType];
      if (balance) {
        const remaining = (balance.total || 0) - (balance.used || 0);
        if (daysCount > remaining) {
          return res.status(400).json({
            success: false,
            message: `Insufficient ${leaveType} leave balance. Remaining: ${remaining} days, requested: ${daysCount} days.`,
          });
        }
      }
    }

    // Check for overlapping pending or approved leave
    const overlap = await Leave.findOne({
      employeeId: employee._id,
      status: { $in: ['pending', 'approved'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlap) {
      return res.status(400).json({
        success: false,
        message: 'You already have an existing leave request that overlaps with these dates',
      });
    }

    const leave = await Leave.create({
      employeeId: employee._id,
      userId: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      daysCount,
      reason,
      status: 'pending',
    });

    // Notify manager or HR
    const notifyTarget = employee.managerId || null;
    if (notifyTarget) {
      await Notification.create({
        recipient: notifyTarget,
        title: 'New Leave Request',
        message: `${req.user.name} submitted a ${leaveType} leave request for ${daysCount} day(s).`,
        type: 'leave',
        link: '/leaves',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's own leave requests & balances
// @route   GET /api/leaves/me
// @access  Private
export const getMyLeaves = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found',
      });
    }

    const leaves = await Leave.find({ employeeId: employee._id })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      leaveBalance: employee.leaveBalance,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending leave requests (Managers & HR)
// @route   GET /api/leaves/pending
// @access  Private (Manager & HR)
export const getPendingLeaves = async (req, res, next) => {
  try {
    let query = { status: 'pending' };

    // If manager, only their team
    if (req.user.role === 'manager') {
      const teamEmployees = await Employee.find({ managerId: req.user._id }).select('_id');
      const teamEmpIds = teamEmployees.map((e) => e._id);
      query.employeeId = { $in: teamEmpIds };
    }

    const pendingLeaves = await Leave.find(query)
      .populate({
        path: 'employeeId',
        populate: { path: 'userId', select: 'name email avatar' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: pendingLeaves.length,
      leaves: pendingLeaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leave requests (with filters)
// @route   GET /api/leaves
// @access  Private (Manager & HR)
export const getAllLeaves = async (req, res, next) => {
  try {
    const { status, leaveType } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (leaveType && leaveType !== 'all') {
      query.leaveType = leaveType;
    }

    // Manager restrictions
    if (req.user.role === 'manager') {
      const teamEmployees = await Employee.find({ managerId: req.user._id }).select('_id');
      const teamEmpIds = teamEmployees.map((e) => e._id);
      query.employeeId = { $in: teamEmpIds };
    }

    const leaves = await Leave.find(query)
      .populate({
        path: 'employeeId',
        populate: { path: 'userId', select: 'name email avatar department' },
      })
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Review leave request (Approve or Reject)
// @route   PATCH /api/leaves/:id/review
// @access  Private (Manager & HR)
export const reviewLeave = async (req, res, next) => {
  try {
    const { status, reviewComment } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Review status must be approved or rejected',
      });
    }

    const leave = await Leave.findById(req.params.id).populate('employeeId');
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Leave request has already been ${leave.status}`,
      });
    }

    // Role authorization check: Managers can only approve their team members
    if (req.user.role === 'manager') {
      const employee = await Employee.findById(leave.employeeId._id);
      if (!employee || employee.managerId?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to review leave requests for employees outside your team',
        });
      }
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewComment = reviewComment || '';
    leave.reviewedAt = new Date();

    // If approved, update employee leave balance
    if (status === 'approved') {
      const employee = await Employee.findById(leave.employeeId._id);
      if (employee && employee.leaveBalance[leave.leaveType]) {
        employee.leaveBalance[leave.leaveType].used =
          (employee.leaveBalance[leave.leaveType].used || 0) + leave.daysCount;
        await employee.save();
      }
    }

    await leave.save();

    // Create In-App Notification for employee
    await Notification.create({
      recipient: leave.userId,
      title: `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: `Your ${leave.leaveType} leave request for ${leave.daysCount} day(s) was ${status}${reviewComment ? ': ' + reviewComment : '.'}`,
      type: 'leave',
      link: '/leaves',
    });

    // Audit log
    await AuditLog.create({
      action: `REVIEW_LEAVE_${status.toUpperCase()}`,
      performedBy: req.user._id,
      targetEntity: 'Leave',
      targetId: leave._id.toString(),
      details: { status, reviewComment, leaveType: leave.leaveType, daysCount: leave.daysCount },
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: `Leave request has been ${status}`,
      leave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel pending leave request (Employee)
// @route   PATCH /api/leaves/:id/cancel
// @access  Private
export const cancelLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leave.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own leave requests',
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel leave request that is already ${leave.status}`,
      });
    }

    leave.status = 'cancelled';
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully',
      leave,
    });
  } catch (error) {
    next(error);
  }
};

