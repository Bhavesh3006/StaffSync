import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAnnouncements);
router.post('/', authorize('hr', 'manager'), createAnnouncement);
router.patch('/:id', authorize('hr'), updateAnnouncement);
router.delete('/:id', authorize('hr'), deleteAnnouncement);

export default router;

