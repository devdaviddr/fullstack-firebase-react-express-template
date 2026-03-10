import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { useAuth } from '../features/auth/AuthContext';
import * as userService from './services/userService';
import { MeResponse, UserProfile } from './types';

// helpers have been removed; useQuery/useMutation object form below

export function useMe(): UseQueryResult<MeResponse, Error> {
  const { user, getIdToken } = useAuth();

  return useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: async () => {
      const token = await getIdToken();
      return userService.getMe(token);
    },
    enabled: !!user,
  });
}

export function useUpdateProfile(): UseMutationResult<MeResponse, Error, Partial<{ name: string; picture: string }>> {
  const queryClient = useQueryClient();
  const { getIdToken } = useAuth();

  return useMutation<MeResponse, Error, Partial<{ name: string; picture: string }>>({
    mutationFn: async (data) => {
      const token = await getIdToken();
      return userService.updateProfile(data, token);
    },
    onSuccess(data) {
      queryClient.setQueryData(['me'], data);
    },
  });
}

export function useDeleteAccount(): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();
  const { signOut, getIdToken } = useAuth();

  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const token = await getIdToken();
      return userService.deleteAccount(token);
    },
    onSuccess() {
      // `removeQueries` expects a filters object in v4+; provide the queryKey explicitly
      queryClient.removeQueries({ queryKey: ['me'] });
      signOut();
    },
  });
}

export function useUsers(): UseQueryResult<UserProfile[], Error> {
  const { user, getIdToken } = useAuth();
  return useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const token = await getIdToken();
      return userService.getUsers(token);
    },
    enabled: !!user,
  });
}
