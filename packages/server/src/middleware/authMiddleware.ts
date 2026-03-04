import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { verifyIdToken } from '../repositories/userRepository';

export interface AuthenticatedRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
