import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../features/auth/AuthContext';
import * as userService from './services/userService';
import { MeResponse } from './types';

// helpers have been removed; useQuery/useMutation object form below

export function useMe() {
  const { user } = useAuth();

  return useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: userService.getMe,
    enabled: !!user,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<MeResponse, Error, Partial<{ name: string; picture: string }>>({
    mutationFn: userService.updateProfile,
    onSuccess(data) {
      queryClient.setQueryData(['me'], data);
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const { signOut } = useAuth();

  return useMutation<void, Error, void>({
    mutationFn: userService.deleteAccount,
    onSuccess() {
      // `removeQueries` expects a filters object in v4+; provide the queryKey explicitly
      queryClient.removeQueries({ queryKey: ['me'] });
      signOut();
    },
  });
}
