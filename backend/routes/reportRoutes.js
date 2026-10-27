import express from 'express';
import {
  getHRDashboardStats,
  getManagerDashboardStats,
  getEmployeeDashboardStats,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/hr', authorize('hr'), getHRDashboardStats);
router.get('/manager', authorize('manager', 'hr'), getManagerDashboardStats);
router.get('/employee', getEmployeeDashboardStats);

export default router;

