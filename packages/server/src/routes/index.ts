import { Router } from 'express';
import healthRouter from './health';
import userRouter from './user';
import usersRouter from './users';

const router = Router();

// mount individual feature routers under /api
router.use('/health', healthRouter);
router.use('/me', userRouter);
router.use('/users', usersRouter);

export default router;
