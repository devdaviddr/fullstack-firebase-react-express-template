import axios from '../axios';
import { MeResponse } from '../types';

export async function getMe() {
  const res = await axios.get<MeResponse>('/me');
  return res.data;
}

export async function updateProfile(data: Partial<{ name: string; picture: string }>) {
  const res = await axios.put<MeResponse>('/me', data);
  return res.data;
}

export async function deleteAccount() {
  await axios.delete('/me');
}
