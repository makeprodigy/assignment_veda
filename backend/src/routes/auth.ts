import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/authController';
import { validate, loginSchema, registerSchema } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), register);

// POST /api/auth/login
router.post('/login', validate(loginSchema), login);

// GET /api/auth/me
router.get('/me', authenticate, getMe);

// POST /api/auth/logout
router.post('/logout', logout);

export default router;
