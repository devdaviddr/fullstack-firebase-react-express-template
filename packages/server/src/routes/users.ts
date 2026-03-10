import { Router } from 'express';
import { getUsers } from '../controllers/usersController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// returns array of profiles
router.get('/', authMiddleware, getUsers);

export default router;
