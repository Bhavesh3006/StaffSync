import express from 'express';
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getOrgAttendance,
  updateAttendance,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/check-in', checkIn);
router.patch('/check-out', checkOut);
router.get('/me', getMyAttendance);
router.get('/', authorize('hr', 'manager'), getOrgAttendance);
router.patch('/:id', authorize('hr'), updateAttendance);

export default router;

