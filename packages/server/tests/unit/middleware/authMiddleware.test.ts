import { expect, describe, it, vi, beforeEach } from 'vitest';
import type { Response, NextFunction } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';

vi.mock('../../../src/repositories/userRepository', () => ({
  verifyIdToken: vi.fn(),
}));

import { authMiddleware, AuthenticatedRequest } from '../../../src/middleware/authMiddleware';
import { verifyIdToken } from '../../../src/repositories/userRepository';

describe('authMiddleware', () => {
  let req: Partial<AuthenticatedRequest>;
  let res: Partial<Response>;
  let next: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    next = vi.fn();
  });

  it('returns 401 if header missing', async () => {
    await authMiddleware(req as AuthenticatedRequest, res as Response, next as unknown as NextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing or invalid Authorization header' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 if token invalid', async () => {
    req.headers = { authorization: 'Bearer bad' };
    vi.mocked(verifyIdToken).mockRejectedValue(new Error('invalid'));
    await authMiddleware(req as AuthenticatedRequest, res as Response, next as unknown as NextFunction);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches decoded token and calls next on success', async () => {
    const decoded = { uid: '123' } as unknown as DecodedIdToken;
    req.headers = { authorization: 'Bearer good' };
    vi.mocked(verifyIdToken).mockResolvedValue(decoded);

    await authMiddleware(req as AuthenticatedRequest, res as Response, next as unknown as NextFunction);
    expect(req.user).toBe(decoded);
    expect(next).toHaveBeenCalled();
  });
});
