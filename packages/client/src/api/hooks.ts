import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../features/auth/AuthContext';
import * as userService from './services/userService';
import { MeResponse } from './types';

// helpers have been removed; useQuery/useMutation object form below

export function useMe() {
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

export function useUpdateProfile() {
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

export function useDeleteAccount() {
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
