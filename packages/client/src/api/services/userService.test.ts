import * as userService from './userService';
import axiosInstance from '../axios';
import type { UserProfile } from '../types';

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() } },
  },
}));

// service methods now accept an optional `token` argument which is turned into
// an `Authorization` header. The tests only care that the header is passed when
// a token is supplied.

describe('userService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getMe', () => {
    it('calls GET /me with Authorization header when token provided', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { uid: 'abc' } });
      const result = await userService.getMe('my-token');
      expect(vi.mocked(axiosInstance.get)).toHaveBeenCalledWith('/me', {
        headers: { Authorization: 'Bearer my-token' },
      });
      expect(result).toEqual({ uid: 'abc' });
    });

    it('works without token (headers undefined)', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { uid: 'abc' } });
      const result = await userService.getMe();
      expect(vi.mocked(axiosInstance.get)).toHaveBeenCalledWith('/me', {
        headers: undefined,
      });
      expect(result).toEqual({ uid: 'abc' });
    });
  });

  describe('updateProfile', () => {
    it('calls PUT /me with provided data and token header', async () => {
      const updated = { uid: 'abc', name: 'New Name' };
      vi.mocked(axiosInstance.put).mockResolvedValue({ data: updated });
      const result = await userService.updateProfile({ name: 'New Name' }, 'tok');
      expect(vi.mocked(axiosInstance.put)).toHaveBeenCalledWith(
        '/me',
        { name: 'New Name' },
        { headers: { Authorization: 'Bearer tok' } },
      );
      expect(result).toEqual(updated);
    });
  });

  describe('deleteAccount', () => {
    it('calls DELETE /me with token header', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({ data: {} });
      await userService.deleteAccount('xyz');
      expect(vi.mocked(axiosInstance.delete)).toHaveBeenCalledWith('/me', {
        headers: { Authorization: 'Bearer xyz' },
      });
    });
  });

  describe('getUsers', () => {
    it('calls GET /users and returns array', async () => {
      const users: UserProfile[] = [{ uid: 'u1' }, { uid: 'u2' }];
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: users });
      const result = await userService.getUsers('tok');
      expect(vi.mocked(axiosInstance.get)).toHaveBeenCalledWith('/users', {
        headers: { Authorization: 'Bearer tok' },
      });
      expect(result).toEqual(users);
    });

    it('succeeds without token (no headers)', async () => {
      const users: UserProfile[] = [];
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: users });
      const result = await userService.getUsers();
      expect(vi.mocked(axiosInstance.get)).toHaveBeenCalledWith('/users', {
        headers: undefined,
      });
      expect(result).toEqual(users);
    });
  });
});


