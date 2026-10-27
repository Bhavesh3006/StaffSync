import Announcement from '../models/Announcement.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get all active announcements
// @route   GET /api/announcements
// @access  Private
export const getAnnouncements = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    let query = { isArchived: false };

    // Audience filtering based on role
    if (req.user.role === 'employee') {
      query.targetAudience = { $in: ['all', 'employees'] };
    } else if (req.user.role === 'manager') {
      query.targetAudience = { $in: ['all', 'employees', 'managers'] };
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    let announcements = await Announcement.find(query)
      .populate('publishedBy', 'name role avatar')
      .sort({ createdAt: -1 });

    if (search) {
      const term = search.toLowerCase();
      announcements = announcements.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.content.toLowerCase().includes(term) ||
          a.category.toLowerCase().includes(term)
      );
    }

    res.status(200).json({
      success: true,
      count: announcements.length,
      announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create announcement (HR or Manager)
// @route   POST /api/announcements
// @access  Private (HR and Manager)
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, priority, targetAudience, department } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide announcement title and content',
      });
    }

    const announcement = await Announcement.create({
      title,
      content,
      category: category || 'Company News',
      priority: priority || 'medium',
      targetAudience: targetAudience || 'all',
      department: department || 'All',
      publishedBy: req.user._id,
    });

    // Create notifications for all active users
    let userQuery = { status: 'active' };
    if (targetAudience === 'employees') userQuery.role = 'employee';
    if (targetAudience === 'managers') userQuery.role = 'manager';

    const usersToNotify = await User.find(userQuery).select('_id');
    const notificationDocs = usersToNotify.map((u) => ({
      recipient: u._id,
      title: `Announcement: ${title}`,
      message: `${title} (${category || 'General'})`,
      type: 'announcement',
      link: '/announcements',
    }));

    if (notificationDocs.length > 0) {
      await Notification.insertMany(notificationDocs);
    }

    const populatedAnnouncement = await Announcement.findById(announcement._id).populate(
      'publishedBy',
      'name role avatar'
    );

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      announcement: populatedAnnouncement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PATCH /api/announcements/:id
// @access  Private (HR)
export const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const { title, content, category, priority, targetAudience, department, isArchived } = req.body;

    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (category) announcement.category = category;
    if (priority) announcement.priority = priority;
    if (targetAudience) announcement.targetAudience = targetAudience;
    if (department) announcement.department = department;
    if (isArchived !== undefined) announcement.isArchived = isArchived;

    await announcement.save();

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      announcement,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (HR)
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await announcement.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

