import axios from '../axios';
import { MeResponse } from '../types';

export async function getMe(token: string) {
  const res = await axios.get<MeResponse>('/me', { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}

export async function updateProfile(
  data: Partial<{ name: string; picture: string }>,
  token: string,
) {
  const res = await axios.put<MeResponse>('/me', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function deleteAccount(token: string) {
  await axios.delete('/me', { headers: { Authorization: `Bearer ${token}` } });
}
