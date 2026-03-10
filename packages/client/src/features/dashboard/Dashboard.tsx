import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useMe, useUpdateProfile, useDeleteAccount } from '../../api/hooks';

export default function Dashboard(): JSX.Element {
  const { user, signOut } = useAuth();
  const { data, isLoading, error, refetch } = useMe();
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const updateMutation = useUpdateProfile();
  const deleteMutation = useDeleteAccount();

  const apiResult = error ? String(error) : data ? JSON.stringify(data, null, 2) : null;
  const fetching = isLoading;

  const callProtectedEndpoint = () => {
    refetch();
  };

  const callUpdate = () => {
    setUpdateSuccess(false);
    updateMutation.mutate(
      { name: 'New Name' },
      { onSuccess: () => setUpdateSuccess(true) },
    );
  };

  const handleDeleteAccount = () => {
    if (!window.confirm('Are you sure? This will permanently delete your account.')) return;
    deleteMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <button
            onClick={signOut}
            aria-label="Sign out"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-md">
          <div className="flex items-center gap-4">
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt="avatar"
                referrerPolicy="no-referrer"
                className="h-12 w-12 rounded-full"
              />
            )}
            <div>
              <p className="font-semibold text-gray-800">{user?.displayName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-md">
          <h2 className="mb-3 font-semibold text-gray-800">Protected API Demo</h2>
          <p className="mb-4 text-sm text-gray-500">
            Calls <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">GET /api/me</code> with
            your Firebase ID token as a Bearer token.
          </p>
          <button
            onClick={callProtectedEndpoint}
            disabled={fetching}
            aria-busy={fetching}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {fetching ? 'Fetching…' : 'Call /api/me'}
          </button>
          <button
            onClick={callUpdate}
            disabled={updateMutation.isPending}
            aria-busy={updateMutation.isPending}
            className="ml-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Updating…' : 'Update name'}
          </button>

          {updateSuccess && (
            <p role="status" className="mt-3 text-sm font-medium text-green-700">
              Profile updated successfully.
            </p>
          )}

          {apiResult && (
            <pre className="mt-4 overflow-x-auto rounded-lg bg-gray-100 p-4 text-xs text-gray-800">
              {apiResult}
            </pre>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-red-200 bg-white p-6 shadow-md">
          <h2 className="mb-3 font-semibold text-red-700">Danger Zone</h2>
          <p className="mb-4 text-sm text-gray-500">
            Permanently deletes your account and revokes all active sessions. This cannot be undone.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleteMutation.isPending}
            aria-busy={deleteMutation.isPending}
            aria-label="Delete your account permanently"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete account'}
          </button>
        </div>
      </div>
    </div>
  );
}
