import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useMe, useMutationHook } from '../../api/hooks';
import * as userService from '../../api/services/userService';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { data, isLoading, error, refetch } = useMe();

  const apiResult = error ? String(error) : data ? JSON.stringify(data, null, 2) : null;
  const fetching = isLoading;

  const callProtectedEndpoint = () => {
    refetch();
  };

  // example mutation: update profile with dummy name
  const updateMutation = useMutationHook({
    mutationFn: (vars: Partial<{ name: string; picture: string }>) => userService.updateProfile(vars),
  });
  const callUpdate = () => updateMutation.mutate({ name: 'New Name' });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <button
            onClick={signOut}
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
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {fetching ? 'Fetching…' : 'Call /api/me'}
          </button>
          <button
            onClick={callUpdate}
            disabled={updateMutation.isPending}
            className="ml-4 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Updating…' : 'Update name'}
          </button>

          {apiResult && (
            <pre className="mt-4 overflow-x-auto rounded-lg bg-gray-100 p-4 text-xs text-gray-800">
              {apiResult}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
