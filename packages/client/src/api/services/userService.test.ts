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
    it('sends Authorization header when a token is provided', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { uid: 'abc' } });
      const result = await userService.getMe('my-token');
      expect(axiosInstance.get).toHaveBeenCalledWith('/me', {
        headers: { Authorization: 'Bearer my-token' },
      });
      expect(result).toEqual({ uid: 'abc' });
    });

    it('omits the Authorization header when no token is provided', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { uid: 'abc' } });
      await userService.getMe();
      expect(axiosInstance.get).toHaveBeenCalledWith('/me', { headers: undefined });
    });
  });

  describe('updateProfile', () => {
    it('calls PUT /me with the provided data and returns the response', async () => {
      const updated = { uid: 'abc', name: 'New Name' };
      vi.mocked(axiosInstance.put).mockResolvedValue({ data: updated });
      const result = await userService.updateProfile({ name: 'New Name' });
      expect(axiosInstance.put).toHaveBeenCalledWith('/me', { name: 'New Name' });
      expect(result).toEqual(updated);
    });
  });

  describe('deleteAccount', () => {
    it('calls DELETE /me', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({ data: {} });
      await userService.deleteAccount();
      expect(axiosInstance.delete).toHaveBeenCalledWith('/me');
    });
  });
});
