import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Training from '../models/Training.js';
import TrainingEnrollment from '../models/TrainingEnrollment.js';
import Announcement from '../models/Announcement.js';

// Helper for start and end of day
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @desc    Get HR Dashboard metrics and analytics
// @route   GET /api/reports/hr
// @access  Private (HR)
export const getHRDashboardStats = async (req, res, next) => {
  try {
    const { start: todayStart, end: todayEnd } = getTodayRange();

    // 1. Employee stats
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ employmentStatus: 'active' });
    const onLeaveEmployees = await Employee.countDocuments({ employmentStatus: 'on-leave' });

    // 2. Department distribution
    const departmentDistribution = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 3. Today's attendance
    const todayAttendances = await Attendance.find({
      date: { $gte: todayStart, $lte: todayEnd },
    });
    const presentCount = todayAttendances.length;
    const lateCount = todayAttendances.filter((a) => a.status === 'late').length;
    const halfDayCount = todayAttendances.filter((a) => a.status === 'half-day').length;
    const absentCount = Math.max(0, activeEmployees - presentCount);

    // 4. Pending leave requests
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

    // 5. Training stats
    const totalTrainings = await Training.countDocuments();
    const activeEnrollments = await TrainingEnrollment.countDocuments({
      status: { $in: ['enrolled', 'in-progress'] },
    });
    const completedEnrollments = await TrainingEnrollment.countDocuments({ status: 'completed' });

    // 6. Recent announcements
    const recentAnnouncements = await Announcement.find({ isArchived: false })
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees,
        activeEmployees,
        onLeaveEmployees,
        attendanceToday: {
          present: presentCount,
          late: lateCount,
          halfDay: halfDayCount,
          absent: absentCount,
          attendanceRate: activeEmployees > 0 ? Math.round((presentCount / activeEmployees) * 100) : 0,
        },
        pendingLeaves,
        training: {
          totalTrainings,
          activeEnrollments,
          completedEnrollments,
        },
        departmentDistribution: departmentDistribution.map((d) => ({
          department: d._id,
          count: d.count,
        })),
        recentAnnouncements,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Manager Dashboard metrics
// @route   GET /api/reports/manager
// @access  Private (Manager & HR)
export const getManagerDashboardStats = async (req, res, next) => {
  try {
    const { start: todayStart, end: todayEnd } = getTodayRange();

    // 1. Team members
    const teamMembers = await Employee.find({ managerId: req.user._id }).populate(
      'userId',
      'name email avatar status'
    );
    const teamIds = teamMembers.map((m) => m._id);

    // 2. Team attendance today
    const teamAttendance = await Attendance.find({
      employeeId: { $in: teamIds },
      date: { $gte: todayStart, $lte: todayEnd },
    });
    const teamPresent = teamAttendance.length;
    const teamLate = teamAttendance.filter((a) => a.status === 'late').length;
    const teamAbsent = Math.max(0, teamMembers.length - teamPresent);

    // 3. Pending team leave requests
    const pendingTeamLeaves = await Leave.countDocuments({
      employeeId: { $in: teamIds },
      status: 'pending',
    });

    // 4. Team training completion
    const teamEnrollments = await TrainingEnrollment.find({
      employeeId: { $in: teamIds },
    });
    const teamCompletedTrainings = teamEnrollments.filter((e) => e.status === 'completed').length;

    res.status(200).json({
      success: true,
      stats: {
        teamSize: teamMembers.length,
        attendanceToday: {
          present: teamPresent,
          absent: teamAbsent,
          late: teamLate,
        },
        pendingLeaves: pendingTeamLeaves,
        training: {
          totalEnrollments: teamEnrollments.length,
          completed: teamCompletedTrainings,
          completionRate:
            teamEnrollments.length > 0
              ? Math.round((teamCompletedTrainings / teamEnrollments.length) * 100)
              : 0,
        },
        teamMembers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee Dashboard metrics
// @route   GET /api/reports/employee
// @access  Private
export const getEmployeeDashboardStats = async (req, res, next) => {
  try {
    const { start: todayStart, end: todayEnd } = getTodayRange();

    const employee = await Employee.findOne({ userId: req.user._id }).populate(
      'managerId',
      'name email'
    );

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee profile not found' });
    }

    // Today's attendance
    const todayAttendance = await Attendance.findOne({
      employeeId: employee._id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    // Recent leaves
    const recentLeaves = await Leave.find({ employeeId: employee._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Active training enrollments
    const activeTrainings = await TrainingEnrollment.find({
      userId: req.user._id,
      status: { $in: ['enrolled', 'in-progress'] },
    }).populate('trainingId');

    // Recent announcements
    const announcements = await Announcement.find({
      isArchived: false,
      targetAudience: { $in: ['all', 'employees'] },
    })
      .sort({ createdAt: -1 })
      .limit(4);

    res.status(200).json({
      success: true,
      stats: {
        employee,
        todayAttendance,
        leaveBalance: employee.leaveBalance,
        recentLeaves,
        activeTrainings,
        announcements,
      },
    });
  } catch (error) {
    next(error);
  }
};

