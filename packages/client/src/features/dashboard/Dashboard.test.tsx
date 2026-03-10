import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import Dashboard from './Dashboard';
import * as AuthContext from '../auth/AuthContext';
import * as hooks from '../../api/hooks';
import type { User } from 'firebase/auth';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import type { MeResponse, UserProfile } from '../../api/types';

vi.mock('../../api/hooks', () => ({
  useMe: vi.fn(),
  useUsers: vi.fn(),
  useUpdateProfile: vi.fn(),
  useDeleteAccount: vi.fn(),
}));

const mockUser = {
  uid: '123',
  displayName: 'Test User',
  email: 'test@example.com',
  photoURL: null,
} as unknown as User;

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('Dashboard', () => {
  beforeEach(() => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockUser,
      loading: false,
      signInWithGoogle: vi.fn<() => Promise<void>>().mockResolvedValue(),
      signOut: vi.fn<() => Promise<void>>().mockResolvedValue(),
      getIdToken: vi.fn<() => Promise<string>>().mockResolvedValue(''),
    });
    vi.mocked(hooks.useMe).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<MeResponse, Error>);
    vi.mocked(hooks.useUsers).mockReturnValue({ data: undefined, isLoading: false, error: null } as unknown as UseQueryResult<UserProfile[], Error>);
    vi.mocked(hooks.useUpdateProfile).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<MeResponse, Error, Partial<{ name: string; picture: string }>>);
    vi.mocked(hooks.useDeleteAccount).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as UseMutationResult<void, Error, void>);
  });

  afterEach(() => vi.restoreAllMocks());

  it('renders the user display name and email', () => {
    render(<Dashboard />, { wrapper });
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows the Call /api/me button in idle state', () => {
    render(<Dashboard />, { wrapper });
    expect(screen.getByRole('button', { name: /call \/api\/me/i })).toBeInTheDocument();
  });

  it('shows "Fetching…" on the button while loading', () => {
    vi.mocked(hooks.useMe).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<MeResponse, Error>);
    render(<Dashboard />, { wrapper });
    expect(screen.getByRole('button', { name: /fetching/i })).toBeInTheDocument();
  });

  it('displays API response data when available', () => {
    vi.mocked(hooks.useMe).mockReturnValue({
      data: { uid: '123', email: 'test@example.com' } as MeResponse,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<MeResponse, Error>);
    vi.mocked(hooks.useUsers).mockReturnValue({ data: [], isLoading: false, error: null } as unknown as UseQueryResult<UserProfile[], Error>);
    render(<Dashboard />, { wrapper });
    expect(screen.getByText(/"uid": "123"/)).toBeInTheDocument();
  });

  it('displays error message when the request fails', () => {
    vi.mocked(hooks.useMe).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Unauthorized'),
      refetch: vi.fn(),
    } as unknown as UseQueryResult<MeResponse, Error>);
    render(<Dashboard />, { wrapper });
    expect(screen.getByText(/unauthorized/i)).toBeInTheDocument();
  });

  it('calls refetch when Call /api/me is clicked', async () => {
    const refetch = vi.fn();
    vi.mocked(hooks.useMe).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch,
    } as unknown as UseQueryResult<MeResponse, Error>);
    vi.mocked(hooks.useUsers).mockReturnValue({ data: [], isLoading: false, error: null } as unknown as UseQueryResult<UserProfile[], Error>);
    render(<Dashboard />, { wrapper });
    await userEvent.click(screen.getByRole('button', { name: /call \/api\/me/i }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it('allows editing profile fields and submits update', async () => {
    // updated response object not directly asserted here
    vi.mocked(hooks.useMe).mockReturnValue({
      data: { uid: '123', name: 'Orig', picture: '' } as MeResponse,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<MeResponse, Error>);
    vi.mocked(hooks.useUsers).mockReturnValue({ data: [], isLoading: false, error: null } as unknown as UseQueryResult<UserProfile[], Error>);
    const mutate = vi.fn();
    vi.mocked(hooks.useUpdateProfile).mockReturnValue({ mutate, isPending: false } as unknown as UseMutationResult<MeResponse, Error, Partial<{ name: string; picture: string }>>);

    render(<Dashboard />, { wrapper });
    const nameInput = screen.getByLabelText(/name/i);
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, 'Hello');
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(mutate).toHaveBeenCalledWith({ name: 'Hello', picture: undefined }, expect.any(Object));
  });

  it('shows users list when present', () => {
    vi.mocked(hooks.useMe).mockReturnValue({
      data: { uid: '123', email: 'a@b.com' } as MeResponse,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as unknown as UseQueryResult<MeResponse, Error>);
    vi.mocked(hooks.useUsers).mockReturnValue({ data: [{ uid: 'u1', name: 'U1' }], isLoading: false, error: null } as unknown as UseQueryResult<UserProfile[], Error>);
    render(<Dashboard />, { wrapper });
    expect(screen.getByText(/all users/i)).toBeInTheDocument();
    expect(screen.getByText(/u1/i)).toBeInTheDocument();
  });

  it('calls signOut when Sign out is clicked', async () => {
    const signOut = vi.fn<() => Promise<void>>().mockResolvedValue();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: mockUser,
      loading: false,
      signInWithGoogle: vi.fn<() => Promise<void>>().mockResolvedValue(),
      signOut,
      getIdToken: vi.fn<() => Promise<string>>().mockResolvedValue(''),
    });
      vi.mocked(hooks.useUsers).mockReturnValue({ data: [], isLoading: false, error: null } as unknown as UseQueryResult<UserProfile[], Error>);
    render(<Dashboard />, { wrapper });
    await userEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(signOut).toHaveBeenCalledOnce();
  });
});
