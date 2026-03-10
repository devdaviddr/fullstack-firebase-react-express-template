import * as userService from './userService';
import axiosInstance from '../axios';

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('userService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getMe', () => {
    it('sends Authorization header with the provided token', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { uid: 'abc' } });
      const result = await userService.getMe('my-token');
      expect(axiosInstance.get).toHaveBeenCalledWith('/me', {
        headers: { Authorization: 'Bearer my-token' },
      });
      expect(result).toEqual({ uid: 'abc' });
    });
  });

  describe('updateProfile', () => {
    it('calls PUT /me with data and Authorization header', async () => {
      const updated = { uid: 'abc', name: 'New Name' };
      vi.mocked(axiosInstance.put).mockResolvedValue({ data: updated });
      const result = await userService.updateProfile({ name: 'New Name' }, 'my-token');
      expect(axiosInstance.put).toHaveBeenCalledWith('/me', { name: 'New Name' }, {
        headers: { Authorization: 'Bearer my-token' },
      });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteAccount', () => {
    it('calls DELETE /me with Authorization header', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({ data: {} });
      await userService.deleteAccount('my-token');
      expect(axiosInstance.delete).toHaveBeenCalledWith('/me', {
        headers: { Authorization: 'Bearer my-token' },
      });
    });
  });
});
