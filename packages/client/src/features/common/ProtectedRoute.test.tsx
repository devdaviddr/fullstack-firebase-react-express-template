import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import * as AuthContext from '../auth/AuthContext';
import type { User } from 'firebase/auth';

const routerProps = { future: { v7_startTransition: true, v7_relativeSplatPath: true } };

const mockUseAuth = (overrides: Partial<ReturnType<typeof AuthContext.useAuth>>) =>
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
    user: null,
    loading: false,
    signInWithGoogle: vi.fn<() => Promise<void>>().mockResolvedValue(),
    signOut: vi.fn<() => Promise<void>>().mockResolvedValue(),
    getIdToken: vi.fn<() => Promise<string>>().mockResolvedValue(''),
    ...overrides,
  });

describe('ProtectedRoute', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows loading spinner while auth is resolving', () => {
    mockUseAuth({ loading: true });
    render(
      <MemoryRouter {...routerProps}>
        <ProtectedRoute><div>protected</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText('protected')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated users — children not rendered', () => {
    mockUseAuth({ user: null, loading: false });
    render(
      <MemoryRouter {...routerProps}>
        <ProtectedRoute><div>protected</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText('protected')).not.toBeInTheDocument();
  });

  it('renders children for authenticated users', () => {
    mockUseAuth({ user: { uid: '123' } as User, loading: false });
    render(
      <MemoryRouter {...routerProps}>
        <ProtectedRoute><div>protected content</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });
});
