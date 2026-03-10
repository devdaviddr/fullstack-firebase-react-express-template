import axios from '../axios';
import { MeResponse, UserProfile } from '../types';

/**
 * Helper to build the headers object when an ID token is available.
 *
 * Axios accepts `undefined` headers so callers can omit the token entirely
 * during unit tests or unauthenticated calls.
 */
function makeAuthHeader(token?: string): Record<string, string> | undefined {
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export async function getMe(token?: string): Promise<MeResponse> {
  const res = await axios.get<MeResponse>('/me', {
    headers: makeAuthHeader(token),
  });
  return res.data;
}

export async function updateProfile(
  data: Partial<{ name: string; picture: string }>,
  token?: string,
): Promise<MeResponse> {
  const res = await axios.put<MeResponse>('/me', data, {
    headers: makeAuthHeader(token),
  });
  return res.data;
}

export async function deleteAccount(token?: string): Promise<void> {
  await axios.delete('/me', {
    headers: makeAuthHeader(token),
  });
}

export async function getUsers(token?: string): Promise<UserProfile[]> {
  const res = await axios.get<UserProfile[]>('/users', {
    headers: makeAuthHeader(token),
  });
  return res.data;
}
