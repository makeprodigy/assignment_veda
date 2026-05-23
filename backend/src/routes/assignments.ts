import { Router } from 'express';
import {
  createAssignment,
  getAssignments,
  getAssignment,
  deleteAssignment,
  seedAssignments,
} from '../controllers/assignmentController';
import { authenticate } from '../middleware/auth';
import { validate, assignmentSchema } from '../middleware/validation';
import { upload } from '../middleware/upload';
import rateLimit from 'express-rate-limit';

const assignmentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/assignments/seed
router.post('/seed', seedAssignments);

// POST /api/assignments
router.post('/', upload.any(), assignmentLimiter, validate(assignmentSchema), createAssignment);

// GET /api/assignments
router.get('/', getAssignments);

// GET /api/assignments/:id
router.get('/:id', getAssignment);

// DELETE /api/assignments/:id
router.delete('/:id', deleteAssignment);

export default router;
