import express from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deactivateEmployee,
  getManagers,
} from '../controllers/employeeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/managers/list', authorize('hr', 'manager'), getManagers);
router.get('/', authorize('hr', 'manager'), getEmployees);
router.post('/', authorize('hr'), createEmployee);
router.get('/:id', getEmployeeById);
router.patch('/:id', authorize('hr'), updateEmployee);
router.patch('/:id/deactivate', authorize('hr'), deactivateEmployee);

export default router;

