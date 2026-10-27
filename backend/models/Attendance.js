import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['present', 'late', 'half-day', 'absent'],
      default: 'present',
    },
    totalWorkMinutes: {
      type: Number,
      default: 0,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance records for the same employee on the same date
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ userId: 1 });

const Attendance = mongoose.model('Attendance', AttendanceSchema);
export default Attendance;

