import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { getUserProfile, applyProfileUpdate } from '../services/userService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  picture: z.string().url().optional(),
});

/** GET /api/me — returns the authenticated user's profile. */
export async function getMe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    res.json(getUserProfile(req.user!));
  } catch (err) {
    next(err);
  }
}

/** PUT /api/me — merges validated fields onto the current profile. */
export async function updateMe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = UpdateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid request body' });
      return;
    }
    res.json(applyProfileUpdate(req.user!, parsed.data));
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/me — removes the authenticated user's account. */
export async function deleteMe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // In production: revoke Firebase session + delete from database here.
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
