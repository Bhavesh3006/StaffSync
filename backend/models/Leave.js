import mongoose from 'mongoose';

const LeaveSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    leaveType: {
      type: String,
      required: [true, 'Please select a leave type'],
      enum: ['annual', 'sick', 'casual', 'maternity', 'paternity', 'unpaid'],
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide end date'],
    },
    daysCount: {
      type: Number,
      default: 1,
      min: 0.5,
    },
    reason: {
      type: String,
      required: [true, 'Please provide a reason for leave'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewComment: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

LeaveSchema.index({ employeeId: 1, status: 1 });
LeaveSchema.index({ startDate: 1, endDate: 1 });
LeaveSchema.index({ userId: 1 });

const Leave = mongoose.model('Leave', LeaveSchema);
export default Leave;

