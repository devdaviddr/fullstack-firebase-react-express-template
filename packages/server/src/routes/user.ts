import { Router } from 'express';
import { getMe, updateMe, deleteMe } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authMiddleware, getMe);     // GET  /api/me
router.put('/', authMiddleware, updateMe);  // PUT  /api/me
router.delete('/', authMiddleware, deleteMe); // DELETE /api/me

export default router;
