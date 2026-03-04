import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="text-gray-500">Loading…</span>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
