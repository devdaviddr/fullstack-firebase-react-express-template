import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useMe, useUpdateProfile, useDeleteAccount } from './hooks';
import * as AuthContext from '../features/auth/AuthContext';
import * as userService from './services/userService';
import type { User } from 'firebase/auth';

vi.mock('./services/userService');

const makeWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

const mockUseAuth = (overrides: Partial<ReturnType<typeof AuthContext.useAuth>> = {}) =>
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
    user: { uid: '123' } as User,
    loading: false,
    signInWithGoogle: vi.fn<() => Promise<void>>().mockResolvedValue(),
    signOut: vi.fn<() => Promise<void>>().mockResolvedValue(),
    getIdToken: vi.fn<() => Promise<string>>().mockResolvedValue('test-token'),
    ...overrides,
  });

describe('useMe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => vi.restoreAllMocks());

  it('calls getIdToken then passes the token to getMe', async () => {
    const getIdToken = vi.fn<() => Promise<string>>().mockResolvedValue('test-token');
    mockUseAuth({ getIdToken });
    const mockData = { uid: '123', email: 'test@example.com' };
    vi.mocked(userService.getMe).mockResolvedValue(mockData);

    const { result } = renderHook(() => useMe(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getIdToken).toHaveBeenCalled();
    expect(userService.getMe).toHaveBeenCalledWith('test-token');
    expect(result.current.data).toEqual(mockData);
  });

  it('does not call the service when there is no authenticated user', () => {
    mockUseAuth({ user: null });
    const { result } = renderHook(() => useMe(), { wrapper: makeWrapper() });
    expect(userService.getMe).not.toHaveBeenCalled();
    // query should not be in error state either
    expect(result.current.isError).toBe(false);
  });

  it('exposes isLoading true before the query resolves', () => {
    const getIdToken = vi.fn<() => Promise<string>>().mockResolvedValue('foo');
    mockUseAuth({ getIdToken });
    // never resolves — keeps the hook in loading state
    vi.mocked(userService.getMe).mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useMe(), { wrapper: makeWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it('exposes error when getMe rejects', async () => {
    const getIdToken = vi.fn<() => Promise<string>>().mockResolvedValue('foo');
    mockUseAuth({ getIdToken });
    vi.mocked(userService.getMe).mockRejectedValue(new Error('network error'));

    const { result } = renderHook(() => useMe(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error).message).toBe('network error');
  });
});

// additional hook tests for token-handling mutations

describe('useUpdateProfile', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches token and calls updateProfile, then updates cache', async () => {
    const getIdToken = vi.fn<() => Promise<string>>().mockResolvedValue('up-token');
    mockUseAuth({ getIdToken });
    const updated = { uid: 'abc', name: 'New Name' };
    vi.mocked(userService.updateProfile).mockResolvedValue(updated);
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useUpdateProfile(), { wrapper });

    await act(async () => {
      result.current.mutateAsync({ name: 'New Name' });
    });

    expect(getIdToken).toHaveBeenCalled();
    expect(userService.updateProfile).toHaveBeenCalledWith({ name: 'New Name' }, 'up-token');
    // cache populated via onSuccess
    expect(queryClient.getQueryData(['me'])).toEqual(updated);
  });
});

describe('useDeleteAccount', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches token and calls deleteAccount, then clears cache and signs out', async () => {
    const getIdToken = vi.fn<() => Promise<string>>().mockResolvedValue('del-token');
    const signOut = vi.fn<() => Promise<void>>().mockResolvedValue();
    mockUseAuth({ getIdToken, signOut });
    vi.mocked(userService.deleteAccount).mockResolvedValue(undefined);

    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useDeleteAccount(), { wrapper });

    await act(async () => {
      result.current.mutateAsync();
    });

    expect(getIdToken).toHaveBeenCalled();
    expect(userService.deleteAccount).toHaveBeenCalledWith('del-token');
    expect(queryClient.getQueryData(['me'])).toBeUndefined();
    expect(signOut).toHaveBeenCalled();
  });
});
