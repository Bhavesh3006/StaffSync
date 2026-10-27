import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import AuditLog from '../models/AuditLog.js';

// Helper to get normalized start of day (midnight)
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// @desc    Employee Check-in
// @route   POST /api/attendance/check-in
// @access  Private
export const checkIn = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee record found for your user account',
      });
    }

    const todayStart = getStartOfDay();
    const todayEnd = getEndOfDay();

    // Check if duplicate check-in today
    const existing = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in for today',
        attendance: existing,
      });
    }

    const now = new Date();
    // Default work start is 9:30 AM. If after 9:30 AM, mark as late
    const lateThreshold = new Date();
    lateThreshold.setHours(9, 30, 0, 0);
    const status = now > lateThreshold ? 'late' : 'present';

    const attendance = await Attendance.create({
      employeeId: employee._id,
      userId: req.user._id,
      date: todayStart,
      checkIn: now,
      status,
      remarks: req.body.remarks || (status === 'late' ? 'Late check-in' : 'On-time check-in'),
    });

    res.status(201).json({
      success: true,
      message: `Checked in successfully at ${now.toLocaleTimeString()}`,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Employee Check-out
// @route   PATCH /api/attendance/check-out
// @access  Private
export const checkOut = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee record found for your user account',
      });
    }

    const todayStart = getStartOfDay();
    const todayEnd = getEndOfDay();

    const attendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'Cannot check out before checking in for today',
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out for today',
        attendance,
      });
    }

    const now = new Date();
    const diffMs = now - new Date(attendance.checkIn);
    const totalMinutes = Math.max(1, Math.round(diffMs / (1000 * 60)));

    attendance.checkOut = now;
    attendance.totalWorkMinutes = totalMinutes;

    // If worked less than 4 hours (240 mins), mark as half-day
    if (totalMinutes < 240 && attendance.status !== 'late') {
      attendance.status = 'half-day';
    }

    if (req.body.remarks) {
      attendance.remarks = `${attendance.remarks ? attendance.remarks + ' | ' : ''}${req.body.remarks}`;
    }

    await attendance.save();

    res.status(200).json({
      success: true,
      message: `Checked out successfully at ${now.toLocaleTimeString()}`,
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's attendance records & today's status
// @route   GET /api/attendance/me
// @access  Private
export const getMyAttendance = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'No employee record found for your account',
      });
    }

    const { month, year } = req.query;
    let query = { employeeId: employee._id };

    if (month && year) {
      const startDate = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      const endDate = new Date(parseInt(year, 10), parseInt(month, 10), 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(query).sort({ date: -1 }).limit(100);

    // Today's record
    const todayStart = getStartOfDay();
    const todayEnd = getEndOfDay();
    const todayRecord = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    // Summary calculations
    const totalPresent = records.filter((r) => r.status === 'present').length;
    const totalLate = records.filter((r) => r.status === 'late').length;
    const totalHalfDay = records.filter((r) => r.status === 'half-day').length;
    const totalMinutesWorked = records.reduce((acc, curr) => acc + (curr.totalWorkMinutes || 0), 0);
    const avgWorkHours = records.length > 0 ? (totalMinutesWorked / records.length / 60).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      today: todayRecord,
      summary: {
        totalDays: records.length,
        totalPresent,
        totalLate,
        totalHalfDay,
        totalHours: (totalMinutesWorked / 60).toFixed(1),
        avgWorkHours,
      },
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get organization attendance (HR & Managers)
// @route   GET /api/attendance
// @access  Private (HR & Managers)
export const getOrgAttendance = async (req, res, next) => {
  try {
    const { date, department, employeeId } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    const dayStart = getStartOfDay(targetDate);
    const dayEnd = getEndOfDay(targetDate);

    // If manager and requested team view, filter employees under this manager
    let empQuery = {};
    if (req.user.role === 'manager' && req.query.teamOnly === 'true') {
      empQuery.managerId = req.user._id;
    }
    if (department && department !== 'All') {
      empQuery.department = department;
    }

    const employees = await Employee.find(empQuery).populate('userId', 'name email avatar');
    const empIds = employees.map((e) => e._id);

    let attendQuery = {
      date: { $gte: dayStart, $lte: dayEnd },
      employeeId: { $in: empIds },
    };

    if (employeeId) {
      attendQuery.employeeId = employeeId;
    }

    const attendances = await Attendance.find(attendQuery)
      .populate({
        path: 'employeeId',
        populate: { path: 'userId', select: 'name email avatar' },
      })
      .sort({ checkIn: -1 });

    // Find missing check-outs
    const missingCheckouts = attendances.filter((a) => !a.checkOut);

    // Summary
    const presentCount = attendances.length;
    const totalActive = employees.length;
    const absentCount = Math.max(0, totalActive - presentCount);
    const lateCount = attendances.filter((a) => a.status === 'late').length;

    res.status(200).json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      summary: {
        totalEmployees: totalActive,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        missingCheckouts: missingCheckouts.length,
      },
      attendances,
      missingCheckouts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update attendance record (HR Correction)
// @route   PATCH /api/attendance/:id
// @access  Private (HR)
export const updateAttendance = async (req, res, next) => {
  try {
    const { checkIn, checkOut, status, remarks } = req.body;

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    if (checkIn) attendance.checkIn = new Date(checkIn);
    if (checkOut) attendance.checkOut = new Date(checkOut);
    if (status) attendance.status = status;
    if (remarks) attendance.remarks = remarks;

    if (attendance.checkIn && attendance.checkOut) {
      const diffMs = new Date(attendance.checkOut) - new Date(attendance.checkIn);
      attendance.totalWorkMinutes = Math.max(0, Math.round(diffMs / (1000 * 60)));
    }

    await attendance.save();

    // Audit log
    await AuditLog.create({
      action: 'UPDATE_ATTENDANCE',
      performedBy: req.user._id,
      targetEntity: 'Attendance',
      targetId: attendance._id.toString(),
      details: req.body,
      ipAddress: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      attendance,
    });
  } catch (error) {
    next(error);
  }
};

