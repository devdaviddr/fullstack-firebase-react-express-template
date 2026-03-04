import { Router } from 'express';
import { getMe } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// `GET /api/me`
router.get('/', authMiddleware, getMe);

export default router;
