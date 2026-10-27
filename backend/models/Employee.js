import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Please provide an Employee ID'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please provide a department'],
      enum: [
        'Engineering',
        'Human Resources',
        'Marketing',
        'Sales',
        'Finance',
        'Operations',
        'Design',
        'Customer Support',
      ],
    },
    designation: {
      type: String,
      required: [true, 'Please provide a designation/job title'],
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      zip: { type: String, default: '' },
      country: { type: String, default: '' },
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    employmentStatus: {
      type: String,
      enum: ['active', 'on-leave', 'inactive', 'terminated'],
      default: 'active',
    },
    leaveBalance: {
      annual: {
        total: { type: Number, default: 15 },
        used: { type: Number, default: 0 },
      },
      sick: {
        total: { type: Number, default: 10 },
        used: { type: Number, default: 0 },
      },
      casual: {
        total: { type: Number, default: 5 },
        used: { type: Number, default: 0 },
      },
      unpaid: {
        total: { type: Number, default: 0 },
        used: { type: Number, default: 0 },
      },
    },
    salary: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ managerId: 1 });

const Employee = mongoose.model('Employee', EmployeeSchema);
export default Employee;
