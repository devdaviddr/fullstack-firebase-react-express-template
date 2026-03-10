import { describe, it, expect, vi, beforeEach } from 'vitest';

// mock firebase before importing repository so admin SDK isn't initialized
vi.mock('../../../src/firebase', () => ({ default: {} }));

vi.mock('../../../src/db', () => ({
  query: vi.fn(),
}));

import { findUserByUid, ensureUser, updateUser, getAllUsers } from '../../../src/repositories/userRepository';
import type { UserProfile } from '../../../src/services/userService';
import { query } from '../../../src/db';

const fakeRow = {
  uid: 'uid1',
  email: 'foo@bar.com',
  name: 'Foo',
  picture: 'https://example.com/foo.png',
};

describe('userRepository', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('findUserByUid', () => {
    it('returns null when no row exists', async () => {
      vi.mocked(query).mockResolvedValue({ rows: [] } as any);
      const result = await findUserByUid('uid1');
      expect(result).toBeNull();
      expect(query).toHaveBeenCalledWith(
        'SELECT uid, email, name, picture FROM users WHERE uid=$1',
        ['uid1'],
      );
    });

    it('returns profile when row present', async () => {
      vi.mocked(query).mockResolvedValue({ rows: [fakeRow] } as any);
      const result = await findUserByUid('uid1');
      expect(result).toEqual({
        uid: 'uid1',
        email: 'foo@bar.com',
        name: 'Foo',
        picture: 'https://example.com/foo.png',
      });
    });
  });

  describe('ensureUser', () => {
    it('inserts a new row when none exists', async () => {
      vi.mocked(query).mockResolvedValue({} as any);
      const profile: UserProfile = {
        uid: 'uid1',
        email: 'foo@bar.com',
        name: 'Foo',
        picture: 'https://example.com/foo.png',
      };
      await ensureUser(profile);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        [
          'uid1',
          'foo@bar.com',
          'Foo',
          'https://example.com/foo.png',
        ],
      );
    });

    it('allows nulls when optional fields are missing', async () => {
      vi.mocked(query).mockResolvedValue({} as any);
      const profile: UserProfile = { uid: 'uid2' };
      await ensureUser(profile);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        ['uid2', null, null, null],
      );
    });
  });

  describe('updateUser', () => {
    it('updates any provided fields', async () => {
      vi.mocked(query).mockResolvedValue({} as any);
      await updateUser({ uid: 'uid1', name: 'NewName' });
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        ['uid1', null, 'NewName', null],
      );
    });

    it('updates email and picture when supplied', async () => {
      vi.mocked(query).mockResolvedValue({} as any);
      await updateUser({ uid: 'uid1', email: 'new@bar.com', picture: 'pic' });
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users'),
        ['uid1', 'new@bar.com', null, 'pic'],
      );
    });
  });

  describe('getAllUsers', () => {
    it('returns mapped rows from query', async () => {
      vi.mocked(query).mockResolvedValue({ rows: [fakeRow, { uid: 'uid2' }] } as any);
      const result = await getAllUsers();
      expect(result).toEqual([
        {
          uid: 'uid1',
          email: 'foo@bar.com',
          name: 'Foo',
          picture: 'https://example.com/foo.png',
        },
        { uid: 'uid2', email: undefined, name: undefined, picture: undefined },
      ]);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT uid, email, name, picture FROM users'),
      );
    });
  });
});
