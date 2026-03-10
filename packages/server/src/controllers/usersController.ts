import { Response, NextFunction } from 'express';
import { listUsers } from '../services/userService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

/** GET /api/users — returns all users in database. */
export async function getUsers(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // still require authentication; we may layer an admin check later
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const users = await listUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
}
