import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an announcement title'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide announcement content'],
    },
    category: {
      type: String,
      enum: [
        'Company News',
        'Holidays',
        'Policy Updates',
        'Events',
        'Important Notices',
      ],
      default: 'Company News',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    targetAudience: {
      type: String,
      enum: ['all', 'employees', 'managers', 'hr'],
      default: 'all',
    },
    department: {
      type: String,
      default: 'All',
    },
    publishedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

AnnouncementSchema.index({ publishDate: -1 });
AnnouncementSchema.index({ category: 1 });
AnnouncementSchema.index({ isArchived: 1 });

const Announcement = mongoose.model('Announcement', AnnouncementSchema);
export default Announcement;

