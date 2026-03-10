import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './features/login/Login';
import * as AuthContext from './features/auth/AuthContext';

const routerProps = { future: { v7_startTransition: true, v7_relativeSplatPath: true } };

describe('Login screen', () => {
  // wrapping App usage doesn't change these behaviors
  let signInWithGoogle: () => Promise<void>;

  beforeEach(() => {
    signInWithGoogle = vi.fn<() => Promise<void>>().mockResolvedValue();
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle,
      signOut: vi.fn<() => Promise<void>>().mockResolvedValue(),
      getIdToken: vi.fn<() => Promise<string>>().mockResolvedValue(''),
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('shows the sign-in prompt when no user exists', () => {
    render(
      <MemoryRouter {...routerProps}>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByText(/sign in to continue/i)).toBeInTheDocument();
  });

  it('calls signInWithGoogle when the button is clicked', async () => {
    render(
      <MemoryRouter {...routerProps}>
        <Login />
      </MemoryRouter>
    );
    await userEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    expect(signInWithGoogle).toHaveBeenCalledOnce();
  });

  it('displays an error message when sign-in fails', async () => {
    const error = new Error('popup closed');
    signInWithGoogle = vi.fn<() => Promise<void>>().mockRejectedValue(error);
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle,
      signOut: vi.fn<() => Promise<void>>().mockResolvedValue(),
      getIdToken: vi.fn<() => Promise<string>>().mockResolvedValue(''),
    });

    render(
      <MemoryRouter {...routerProps}>
        <Login />
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    expect(signInWithGoogle).toHaveBeenCalledOnce();
    expect(await screen.findByText(/popup closed/i)).toBeInTheDocument();
  });
});
