import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Login(): JSX.Element {
  const { user, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google sign-in failed', err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">Welcome</h1>
        <p className="mb-6 text-center text-sm text-gray-500">Sign in to continue</p>
        <button
          onClick={handleSignIn}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.86l6.09-6.09A23.8 23.8 0 0 0 24 0C14.82 0 6.96 5.38 3.07 13.22l7.08 5.5C11.99 13.04 17.54 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.5c0-1.6-.14-3.14-.4-4.63H24v8.76h12.92c-.56 2.99-2.26 5.53-4.82 7.24l7.38 5.73C43.99 37.28 46.98 31.34 46.98 24.5z"/>
            <path fill="#FBBC05" d="M10.15 28.72A14.5 14.5 0 0 1 9.5 24c0-1.64.28-3.23.77-4.72l-7.08-5.5A23.93 23.93 0 0 0 0 24c0 3.86.92 7.51 2.54 10.74l7.61-6.02z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.92-2.15 15.9-5.85l-7.38-5.73c-2.15 1.45-4.92 2.3-8.52 2.3-6.46 0-12.01-3.54-13.85-8.72l-7.61 6.02C6.96 42.62 14.82 48 24 48z"/>
          </svg>
          Sign in with Google
        </button>
        {error && (
          <p className="mt-4 text-red-600 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}
