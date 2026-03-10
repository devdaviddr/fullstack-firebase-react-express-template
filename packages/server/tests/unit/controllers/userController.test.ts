/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../src/services/userService', () => ({
  getUserProfile: vi.fn(),
  applyProfileUpdate: vi.fn(),
  deleteUserAccount: vi.fn(),
}));

import { getMe, updateMe, deleteMe } from '../../../src/controllers/userController';
import { getUserProfile, applyProfileUpdate, deleteUserAccount } from '../../../src/services/userService';

const fakeDecoded: any = { uid: 'abc', email: 'test@example.com', name: 'Test User', picture: undefined };

describe('userController.getMe', () => {
  it('responds with profile JSON', async () => {
    const fakeProfile = { uid: 'abc', email: 'test@example.com', name: 'Test User', picture: undefined };
    vi.mocked(getUserProfile).mockReturnValue(fakeProfile);

    const req: any = { user: fakeDecoded };
    const res: any = { json: vi.fn() };
    const next = vi.fn();

    await getMe(req, res, next);
    expect(getUserProfile).toHaveBeenCalledWith(fakeDecoded);
    expect(res.json).toHaveBeenCalledWith(fakeProfile);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('userController.updateMe', () => {
  it('returns 400 when body is invalid', async () => {
    const req: any = { user: fakeDecoded, body: { picture: 'not-a-url' } };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const next = vi.fn();

    await updateMe(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  it('returns updated profile on valid body', async () => {
    const updated = { uid: 'abc', name: 'New Name' };
    vi.mocked(applyProfileUpdate).mockReturnValue(updated as any);

    const req: any = { user: fakeDecoded, body: { name: 'New Name' } };
    const res: any = { json: vi.fn() };
    const next = vi.fn();

    await updateMe(req, res, next);
    expect(applyProfileUpdate).toHaveBeenCalledWith(fakeDecoded, { name: 'New Name' });
    expect(res.json).toHaveBeenCalledWith(updated);
  });
});

describe('userController.deleteMe', () => {
  it('returns 204 with no body', async () => {
    vi.mocked(deleteUserAccount).mockResolvedValue();
    const req: any = { user: fakeDecoded };
    const res: any = { status: vi.fn().mockReturnThis(), send: vi.fn() };
    const next = vi.fn();

    await deleteMe(req, res, next);
    expect(deleteUserAccount).toHaveBeenCalledWith(fakeDecoded.uid);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
