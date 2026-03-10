import * as userService from './userService';
import axiosInstance from '../axios';

vi.mock('../axios', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: { request: { use: vi.fn() } },
  },
}));

// token store imported dynamically in interceptor test

describe('userService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getMe', () => {
    it('calls GET /me and returns response data', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValue({ data: { uid: 'abc' } });
      const result = await userService.getMe();
      expect(vi.mocked(axiosInstance.get)).toHaveBeenCalled();
      expect(vi.mocked(axiosInstance.get).mock.calls[0][0]).toBe('/me');
      expect(result).toEqual({ uid: 'abc' });
    });
  });

  describe('updateProfile', () => {
    it('calls PUT /me with provided data and returns response', async () => {
      const updated = { uid: 'abc', name: 'New Name' };
      vi.mocked(axiosInstance.put).mockResolvedValue({ data: updated });
      const result = await userService.updateProfile({ name: 'New Name' });
      expect(vi.mocked(axiosInstance.put)).toHaveBeenCalled();
      expect(vi.mocked(axiosInstance.put).mock.calls[0][0]).toBe('/me');
      expect(result).toEqual(updated);
    });
  });

  describe('deleteAccount', () => {
    it('calls DELETE /me', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({ data: {} });
      await userService.deleteAccount();
      expect(vi.mocked(axiosInstance.delete)).toHaveBeenCalled();
      expect(vi.mocked(axiosInstance.delete).mock.calls[0][0]).toBe('/me');
    });
  });
});


