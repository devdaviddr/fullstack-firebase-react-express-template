import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import * as AuthContext from '../auth/AuthContext';
import type { User } from 'firebase/auth';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function renderLogin(authOverrides: Partial<ReturnType<typeof AuthContext.useAuth>> = {}) {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
    user: null,
    loading: false,
    signInWithGoogle: vi.fn<() => Promise<void>>().mockResolvedValue(),
    signOut: vi.fn<() => Promise<void>>().mockResolvedValue(),
    getIdToken: vi.fn<() => Promise<string>>().mockResolvedValue(''),
    ...authOverrides,
  });

  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

describe('Login', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders the sign-in button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('redirects to / when user is already authenticated', () => {
    renderLogin({ user: { uid: '1' } as User });
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('calls signInWithGoogle when the button is clicked', async () => {
    const signInWithGoogle = vi.fn<() => Promise<void>>().mockResolvedValue();
    renderLogin({ signInWithGoogle });
    await userEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    expect(signInWithGoogle).toHaveBeenCalledOnce();
  });

  it('displays the error message when sign-in throws an Error', async () => {
    const signInWithGoogle = vi
      .fn<() => Promise<void>>()
      .mockRejectedValue(new Error('popup-closed'));
    renderLogin({ signInWithGoogle });
    await userEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    await waitFor(() =>
      expect(screen.getByText('popup-closed')).toBeInTheDocument(),
    );
  });

  it('shows a fallback message when sign-in throws a non-Error value', async () => {
    const signInWithGoogle = vi.fn<() => Promise<void>>().mockRejectedValue('unexpected');
    renderLogin({ signInWithGoogle });
    await userEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    await waitFor(() =>
      expect(screen.getByText('Authentication failed')).toBeInTheDocument(),
    );
  });
});
