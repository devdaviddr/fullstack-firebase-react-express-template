import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }): JSX.Element {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading"
        aria-live="polite"
        className="flex h-screen items-center justify-center"
      >
        <span className="text-gray-500">Loading…</span>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
