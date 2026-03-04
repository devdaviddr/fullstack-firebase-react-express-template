import { Router } from 'express';
import healthRouter from './health';
import userRouter from './user';

const router = Router();

// mount individual feature routers under /api
router.use('/health', healthRouter);
router.use('/me', userRouter);

export default router;
