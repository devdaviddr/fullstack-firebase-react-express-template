import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useAuth } from '../features/auth/AuthContext';
import * as userService from './services/userService';
import { MeResponse } from './types';

// generic fetch hook
export function useFetch<TData, TError = Error>(
  options: UseQueryOptions<TData, TError, TData, readonly unknown[]>,
) {
  return useQuery(options);
}

// generic mutation hook
export function useMutationHook<TData, TVariables = void, TError = Error>(
  options: UseMutationOptions<TData, TError, TVariables>,
): UseMutationResult<TData, TError, TVariables, unknown> {
  return useMutation(options);
}

export function useMe() {
  const { getIdToken } = useAuth();

  return useFetch<MeResponse>({
    queryKey: ['me'],
    queryFn: async () => {
      const token = await getIdToken();
      const res = await userService.getMe(token);
      return res;
    },
  });
}
