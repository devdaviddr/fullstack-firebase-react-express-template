import { describe, it, expect, vi } from 'vitest';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { Request, Response, NextFunction } from 'express';

vi.mock('../../../src/services/userService', () => ({
  listUsers: vi.fn(),
}));

import { getUsers } from '../../../src/controllers/usersController';
import { listUsers } from '../../../src/services/userService';

const fakeDecoded = { uid: 'abc' } as unknown as DecodedIdToken;

const makeReq = (user?: DecodedIdToken) => ({ user } as unknown as Request & { user?: DecodedIdToken });
const makeRes = () => {
  const res: Partial<Response> = {};
  res.json = vi.fn().mockReturnThis();
  res.status = vi.fn().mockReturnThis();
  return res as Response;
};

describe('usersController.getUsers', () => {
  it('returns 401 when no user is present', async () => {
    const req = makeReq();
    const res = makeRes();
    const next = vi.fn();

    await getUsers(req as any, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(listUsers).not.toHaveBeenCalled();
  });

  it('returns user list when authenticated', async () => {
    const fakeUsers = [{ uid: 'u1' }, { uid: 'u2' }];
    vi.mocked(listUsers).mockResolvedValue(fakeUsers as any);
    const req = makeReq(fakeDecoded);
    const res = makeRes();
    const next = vi.fn();

    await getUsers(req as any, res, next);
    expect(listUsers).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(fakeUsers);
  });

  it('forwards errors to next()', async () => {
    const err = new Error('db');
    vi.mocked(listUsers).mockRejectedValue(err);
    const req = makeReq(fakeDecoded);
    const res = makeRes();
    const next = vi.fn();

    await getUsers(req as any, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
