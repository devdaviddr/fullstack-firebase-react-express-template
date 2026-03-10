import { render, screen, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import type { User } from 'firebase/auth';

// firebase/auth functions are mocked here; src/firebase (auth, googleProvider) is
// mocked globally in setupTests.ts.
const mockOnAuthStateChanged = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockFirebaseSignOut = vi.fn();

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: (
    _auth: unknown,
    callback: (user: User | null) => void,
  ) => {
    mockOnAuthStateChanged.mockImplementation(callback);
    return vi.fn(); // unsubscribe
  },
  signInWithPopup: (...args: unknown[]) => mockSignInWithPopup(...args),
  signOut: (...args: unknown[]) => mockFirebaseSignOut(...args),
  GoogleAuthProvider: class {},
}));

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

/** Helper component that reads auth context and renders key state as text. */
function AuthConsumer() {
  const { user, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="uid">{user?.uid ?? 'none'}</span>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFirebaseSignOut.mockResolvedValue(undefined);
  });

  it('is loading initially before onAuthStateChanged fires', () => {
    // Don't invoke the callback — simulates the async resolution window.
    mockOnAuthStateChanged.mockImplementation(() => vi.fn());
    render(<AuthConsumer />, { wrapper });
    expect(screen.getByTestId('loading').textContent).toBe('true');
    expect(screen.getByTestId('uid').textContent).toBe('none');
  });

  it('sets user and loading=false when onAuthStateChanged provides a user', async () => {
    const fakeUser = { uid: 'u1' } as User;
    render(<AuthConsumer />, { wrapper });
    act(() => mockOnAuthStateChanged(fakeUser));
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('uid').textContent).toBe('u1');
  });

  it('sets user=null and loading=false when onAuthStateChanged fires with null', async () => {
    render(<AuthConsumer />, { wrapper });
    act(() => mockOnAuthStateChanged(null));
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('uid').textContent).toBe('none');
  });

  it('signInWithGoogle delegates to signInWithPopup', async () => {
    mockSignInWithPopup.mockResolvedValue({});

    let capturedCtx!: ReturnType<typeof useAuth>;
    function CtxCapture() {
      capturedCtx = useAuth();
      return null;
    }
    render(<CtxCapture />, { wrapper });
    await act(() => capturedCtx.signInWithGoogle());
    expect(mockSignInWithPopup).toHaveBeenCalled();
  });

  it('getIdToken throws when no user is logged in', async () => {
    render(<AuthConsumer />, { wrapper });
    act(() => mockOnAuthStateChanged(null));

    let capturedCtx!: ReturnType<typeof useAuth>;
    function CtxCapture() {
      capturedCtx = useAuth();
      return null;
    }
    render(<CtxCapture />, { wrapper });
    await act(() => mockOnAuthStateChanged(null));
    await expect(capturedCtx.getIdToken()).rejects.toThrow('Not authenticated');
  });
});

describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    // Suppress expected React error boundary noise
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      render(
        <QueryClientProvider client={new QueryClient()}>
          <AuthConsumer />
        </QueryClientProvider>,
      ),
    ).toThrow('useAuth must be used inside <AuthProvider>');
  });
});
