import mongoose from 'mongoose';

const TrainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a training title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a training description'],
    },
    trainer: {
      type: String,
      required: [true, 'Please specify the trainer / organization'],
    },
    category: {
      type: String,
      default: 'Professional Development',
    },
    startDate: {
      type: Date,
      required: [true, 'Please provide a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Please provide an end date'],
    },
    maxCapacity: {
      type: Number,
      default: 25,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['upcoming', 'in-progress', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    location: {
      type: String,
      default: 'Online / Conference Room A',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

TrainingSchema.index({ status: 1 });
TrainingSchema.index({ startDate: 1 });

const Training = mongoose.model('Training', TrainingSchema);
export default Training;

