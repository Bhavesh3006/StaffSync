import mongoose from 'mongoose';

const TrainingEnrollmentSchema = new mongoose.Schema(
  {
    trainingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Training',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    status: {
      type: String,
      enum: ['enrolled', 'in-progress', 'completed', 'dropped'],
      default: 'enrolled',
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

TrainingEnrollmentSchema.index({ trainingId: 1, userId: 1 }, { unique: true });
TrainingEnrollmentSchema.index({ userId: 1 });
TrainingEnrollmentSchema.index({ employeeId: 1 });

const TrainingEnrollment = mongoose.model('TrainingEnrollment', TrainingEnrollmentSchema);
export default TrainingEnrollment;

