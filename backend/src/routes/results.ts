import { Router } from 'express';
import { getResult, regenerate } from '../controllers/resultController';
import { downloadPDF } from '../controllers/pdfController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/results/:jobId
router.get('/:jobId', getResult);

// POST /api/results/:jobId/regenerate
router.post('/:jobId/regenerate', regenerate);

// GET /api/results/:jobId/pdf
router.get('/:jobId/pdf', downloadPDF);

export default router;
