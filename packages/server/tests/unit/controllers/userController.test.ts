/// <reference types="vitest" />
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../src/services/userService', () => ({
  getUserProfile: vi.fn(),
}));

import { getMe } from '../../../src/controllers/userController';
import { getUserProfile } from '../../../src/services/userService';

describe('userController.getMe', () => {
  it('responds with profile JSON', async () => {
    const fakeReq: any = { user: { uid: 'abc', email: 'test@example.com', name: 'Test User', picture: undefined } };
    const fakeProfile = { uid: 'abc', email: 'test@example.com', name: 'Test User', picture: undefined };
    vi.mocked(getUserProfile).mockReturnValue(fakeProfile);

    const res: any = { json: vi.fn() };
    await getMe(fakeReq, res);
    expect(getUserProfile).toHaveBeenCalledWith(fakeReq.user);
    expect(res.json).toHaveBeenCalledWith(fakeProfile);
  });
});
