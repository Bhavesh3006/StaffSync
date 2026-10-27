import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getPendingLeaves,
  getAllLeaves,
  reviewLeave,
  cancelLeave,
} from '../controllers/leaveController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', applyLeave);
router.get('/me', getMyLeaves);
router.get('/pending', authorize('hr', 'manager'), getPendingLeaves);
router.get('/', authorize('hr', 'manager'), getAllLeaves);
router.patch('/:id/review', authorize('hr', 'manager'), reviewLeave);
router.patch('/:id/cancel', cancelLeave);

export default router;

