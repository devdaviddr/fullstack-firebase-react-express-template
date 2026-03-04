import { Response } from 'express';
import { getUserProfile } from '../services/userService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// controller layer handles express req/res and delegates to service
export async function getMe(req: AuthenticatedRequest, res: Response) {
  const decoded = req.user!;
  const profile = getUserProfile(decoded);
  res.json(profile);
}
