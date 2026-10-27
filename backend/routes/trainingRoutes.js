import express from 'express';
import {
  getTrainings,
  createTraining,
  enrollTraining,
  updateEnrollmentProgress,
  assignTraining,
  getTeamTrainings,
} from '../controllers/trainingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getTrainings);
router.post('/', authorize('hr'), createTraining);
router.post('/:id/enroll', enrollTraining);
router.patch('/enrollment/:id', updateEnrollmentProgress);
router.post('/:id/assign', authorize('hr', 'manager'), assignTraining);
router.get('/team', authorize('hr', 'manager'), getTeamTrainings);

export default router;

