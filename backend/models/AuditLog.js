import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetEntity: {
      type: String,
      required: true,
    },
    targetId: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

AuditLogSchema.index({ performedBy: 1 });
AuditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;

