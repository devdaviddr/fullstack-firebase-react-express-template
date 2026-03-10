import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { getUserProfile, applyProfileUpdate, deleteUserAccount } from '../services/userService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  picture: z.string().url().optional(),
});

/**
 * Guards that req.user is populated (set by authMiddleware).
 * Returns true and sends 401 when the guard fails, allowing callers to early-return.
 */
function requireUser(
  req: AuthenticatedRequest,
  res: Response,
): req is AuthenticatedRequest & { user: NonNullable<AuthenticatedRequest['user']> } {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
}

/** GET /api/me — returns the authenticated user's profile. */
export async function getMe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!requireUser(req, res)) return;
    res.json(getUserProfile(req.user));
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
    if (!requireUser(req, res)) return;
    const parsed = UpdateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid request body' });
      return;
    }
    res.json(applyProfileUpdate(req.user, parsed.data));
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/me — revokes Firebase sessions and permanently deletes the account. */
export async function deleteMe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!requireUser(req, res)) return;
    await deleteUserAccount(req.user.uid);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

