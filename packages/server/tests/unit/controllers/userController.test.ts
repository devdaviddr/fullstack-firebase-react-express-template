import { describe, it, expect, vi } from 'vitest';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { Request, Response, NextFunction } from 'express';

vi.mock('../../../src/services/userService', () => ({
  getOrCreateUser: vi.fn(),
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  deleteUserAccount: vi.fn(),
}));

import { getMe, updateMe, deleteMe } from '../../../src/controllers/userController';
import { getOrCreateUser, getUserProfile, updateUserProfile, deleteUserAccount } from '../../../src/services/userService';

const fakeDecoded = { uid: 'abc', email: 'test@example.com', name: 'Test User', picture: undefined } as unknown as DecodedIdToken;

describe('userController.getMe', () => {
  it('responds with profile JSON and ensures user exists', async () => {
    const fakeProfile = { uid: 'abc', email: 'test@example.com', name: 'Test User', picture: undefined };
    vi.mocked(getOrCreateUser).mockResolvedValue(fakeProfile as unknown as ReturnType<typeof getOrCreateUser> extends Promise<infer U> ? U : never);

    const req = { user: fakeDecoded } as unknown as Request & { user: DecodedIdToken };
    const res = { json: vi.fn() } as unknown as Response;
    const next = vi.fn();

    await getMe(req, res, next as unknown as NextFunction);
    expect(getOrCreateUser).toHaveBeenCalledWith(fakeDecoded);
    expect(res.json).toHaveBeenCalledWith(fakeProfile);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('userController.updateMe', () => {
  it('returns 400 when body is invalid', async () => {
    const req = { user: fakeDecoded, body: { picture: 'not-a-url' } } as unknown as Request & { user: DecodedIdToken };
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn();

    await updateMe(req, res, next as unknown as NextFunction);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  it('returns updated profile on valid body', async () => {
    const updated = { uid: 'abc', name: 'New Name' };
    vi.mocked(updateUserProfile).mockResolvedValue(updated as unknown as ReturnType<typeof updateUserProfile> extends Promise<infer U> ? U : never);

    const req = { user: fakeDecoded, body: { name: 'New Name' } } as unknown as Request & { user: DecodedIdToken };
    const res = { json: vi.fn() } as unknown as Response;
    const next = vi.fn();

    await updateMe(req, res, next as unknown as NextFunction);
    expect(updateUserProfile).toHaveBeenCalledWith(fakeDecoded, { name: 'New Name' });
    expect(res.json).toHaveBeenCalledWith(updated);
  });
});

describe('userController.deleteMe', () => {
  it('returns 204 with no body', async () => {
    vi.mocked(deleteUserAccount).mockResolvedValue();
    const req = { user: fakeDecoded } as unknown as Request & { user: DecodedIdToken };
    const res = { status: vi.fn().mockReturnThis(), send: vi.fn() } as unknown as Response;
    const next = vi.fn();

    await deleteMe(req, res, next as unknown as NextFunction);
    expect(deleteUserAccount).toHaveBeenCalledWith(fakeDecoded.uid);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
