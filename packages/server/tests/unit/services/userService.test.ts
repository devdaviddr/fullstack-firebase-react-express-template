import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/repositories/userRepository', () => ({
  deleteUser: vi.fn(),
  ensureUser: vi.fn(),
  updateUser: vi.fn(),
  getAllUsers: vi.fn(),
}));

import { getUserProfile, applyProfileUpdate, deleteUserAccount, getOrCreateUser, updateUserProfile, listUsers } from '../../../src/services/userService';
import { deleteUser, ensureUser, updateUser, getAllUsers } from '../../../src/repositories/userRepository';
import type { DecodedIdToken } from 'firebase-admin/auth';

const fakeToken = {
  uid: 'uid-1',
  email: 'alice@example.com',
  name: 'Alice',
  picture: 'https://example.com/alice.jpg',
} as unknown as DecodedIdToken;

describe('getUserProfile', () => {
  it('extracts the expected fields from a decoded token', () => {
    expect(getUserProfile(fakeToken)).toEqual({
      uid: 'uid-1',
      email: 'alice@example.com',
      name: 'Alice',
      picture: 'https://example.com/alice.jpg',
    });
  });

  it('omits fields that are undefined on the token', () => {
    const sparse = { uid: 'uid-2' } as unknown as DecodedIdToken;
    const profile = getUserProfile(sparse);
    expect(profile.uid).toBe('uid-2');
    expect(profile.email).toBeUndefined();
  });
});

describe('getOrCreateUser', () => {
  it('returns the profile and calls ensureUser', async () => {
    vi.mocked(ensureUser).mockResolvedValue();
    const result = await getOrCreateUser(fakeToken);
    expect(result).toEqual({
      uid: 'uid-1',
      email: 'alice@example.com',
      name: 'Alice',
      picture: 'https://example.com/alice.jpg',
    });
    expect(ensureUser).toHaveBeenCalledWith(result);
  });
});

describe('applyProfileUpdate', () => {
  it('merges update data onto the base profile', () => {
    const result = applyProfileUpdate(fakeToken, { name: 'Bob' });
    expect(result).toEqual({
      uid: 'uid-1',
      email: 'alice@example.com',
      name: 'Bob',
      picture: 'https://example.com/alice.jpg',
    });
  });

  it('does not mutate update data; missing keys leave original values intact', () => {
    const result = applyProfileUpdate(fakeToken, {});
    expect(result.name).toBe('Alice');
  });
});

describe('updateUserProfile', () => {
  it('merges and persists the data', async () => {
    vi.mocked(ensureUser).mockResolvedValue();
    vi.mocked(updateUser).mockResolvedValue();
    const result = await updateUserProfile(fakeToken, { name: 'Bob' });
    expect(result).toEqual({
      uid: 'uid-1',
      email: 'alice@example.com',
      name: 'Bob',
      picture: 'https://example.com/alice.jpg',
    });
    expect(ensureUser).toHaveBeenCalledWith(result);
    expect(updateUser).toHaveBeenCalledWith(result);
  });
});

describe('listUsers', () => {
  it('delegates to repository and returns array', async () => {
    const rows = [
      { uid: 'u1', email: 'a@b.com' },
      { uid: 'u2' },
    ];
    vi.mocked(getAllUsers).mockResolvedValue(rows as any);
    const result = await listUsers();
    expect(result).toEqual(rows);
    expect(getAllUsers).toHaveBeenCalledOnce();
  });
});

describe('deleteUserAccount', () => {
  beforeEach(() => vi.resetAllMocks());

  it('delegates to the userRepository deleteUser with the correct uid', async () => {
    vi.mocked(deleteUser).mockResolvedValue();
    await deleteUserAccount('uid-1');
    expect(deleteUser).toHaveBeenCalledOnce();
    expect(deleteUser).toHaveBeenCalledWith('uid-1');
  });

  it('propagates errors thrown by the repository', async () => {
    vi.mocked(deleteUser).mockRejectedValue(new Error('Firebase error'));
    await expect(deleteUserAccount('uid-1')).rejects.toThrow('Firebase error');
  });
});
