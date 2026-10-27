import Training from '../models/Training.js';
import TrainingEnrollment from '../models/TrainingEnrollment.js';
import Employee from '../models/Employee.js';
import Notification from '../models/Notification.js';

// @desc    Get all training programs with current user enrollment status
// @route   GET /api/trainings
// @access  Private
export const getTrainings = async (req, res, next) => {
  try {
    const trainings = await Training.find().sort({ startDate: 1 });

    // Find current user's enrollments
    const myEnrollments = await TrainingEnrollment.find({ userId: req.user._id });
    const enrollmentMap = {};
    myEnrollments.forEach((e) => {
      enrollmentMap[e.trainingId.toString()] = e;
    });

    const trainingsWithStatus = trainings.map((t) => ({
      ...t.toObject(),
      myEnrollment: enrollmentMap[t._id.toString()] || null,
    }));

    res.status(200).json({
      success: true,
      count: trainings.length,
      trainings: trainingsWithStatus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a training program (HR)
// @route   POST /api/trainings
// @access  Private (HR)
export const createTraining = async (req, res, next) => {
  try {
    const {
      title,
      description,
      trainer,
      category,
      startDate,
      endDate,
      maxCapacity,
      location,
    } = req.body;

    if (!title || !description || !trainer || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, trainer, and start/end dates',
      });
    }

    const training = await Training.create({
      title,
      description,
      trainer,
      category: category || 'Professional Development',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      maxCapacity: maxCapacity || 25,
      location: location || 'Online Workshop',
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Training program created successfully',
      training,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Enroll in training (Employee self-enroll)
// @route   POST /api/trainings/:id/enroll
// @access  Private
export const enrollTraining = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training program not found' });
    }

    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee record not found' });
    }

    const existingEnrollment = await TrainingEnrollment.findOne({
      trainingId: training._id,
      userId: req.user._id,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this training program',
        enrollment: existingEnrollment,
      });
    }

    if (training.enrolledCount >= training.maxCapacity) {
      return res.status(400).json({
        success: false,
        message: 'This training program has reached maximum enrollment capacity',
      });
    }

    const enrollment = await TrainingEnrollment.create({
      trainingId: training._id,
      userId: req.user._id,
      employeeId: employee._id,
      status: 'enrolled',
      progress: 0,
    });

    training.enrolledCount += 1;
    await training.save();

    res.status(201).json({
      success: true,
      message: 'Enrolled in training program successfully',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update progress or complete training
// @route   PATCH /api/trainings/enrollment/:id
// @access  Private
export const updateEnrollmentProgress = async (req, res, next) => {
  try {
    const { progress, status, feedback } = req.body;

    const enrollment = await TrainingEnrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found' });
    }

    if (progress !== undefined) {
      enrollment.progress = Math.min(100, Math.max(0, Number(progress)));
      if (enrollment.progress === 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
      } else if (enrollment.progress > 0) {
        enrollment.status = 'in-progress';
      }
    }

    if (status) enrollment.status = status;
    if (feedback) enrollment.feedback = feedback;

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: 'Training progress updated successfully',
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manager assigns training to team member
// @route   POST /api/trainings/:id/assign
// @access  Private (Manager & HR)
export const assignTraining = async (req, res, next) => {
  try {
    const { employeeId } = req.body;

    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training not found' });
    }

    const employee = await Employee.findById(employeeId).populate('userId');
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const existing = await TrainingEnrollment.findOne({
      trainingId: training._id,
      userId: employee.userId._id,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Employee is already enrolled in this training',
      });
    }

    const enrollment = await TrainingEnrollment.create({
      trainingId: training._id,
      userId: employee.userId._id,
      employeeId: employee._id,
      assignedBy: req.user._id,
      status: 'enrolled',
    });

    training.enrolledCount += 1;
    await training.save();

    // Notify employee
    await Notification.create({
      recipient: employee.userId._id,
      title: 'New Training Assigned',
      message: `${req.user.name} assigned you to the training program "${training.title}".`,
      type: 'training',
      link: '/trainings',
    });

    res.status(201).json({
      success: true,
      message: `Training successfully assigned to ${employee.userId.name}`,
      enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get team training participation (Manager & HR)
// @route   GET /api/trainings/team
// @access  Private (Manager & HR)
export const getTeamTrainings = async (req, res, next) => {
  try {
    let empQuery = {};
    if (req.user.role === 'manager') {
      empQuery.managerId = req.user._id;
    }

    const teamEmployees = await Employee.find(empQuery).select('_id');
    const empIds = teamEmployees.map((e) => e._id);

    const enrollments = await TrainingEnrollment.find({ employeeId: { $in: empIds } })
      .populate('trainingId')
      .populate('userId', 'name email avatar')
      .populate({ path: 'employeeId', select: 'employeeId department designation' });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    next(error);
  }
};

