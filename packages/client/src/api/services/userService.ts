import axios from '../axios';
import { MeResponse } from '../types';

export async function getMe(token?: string) {
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const res = await axios.get<MeResponse>('/me', { headers });
  return res.data;
}

export async function updateProfile(data: Partial<{name:string;picture:string}>) {
  const res = await axios.put('/me', data);
  return res.data;
}

export async function deleteAccount() {
  const res = await axios.delete('/me');
  return res.data;
}
