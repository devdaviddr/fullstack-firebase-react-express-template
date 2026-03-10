import type { DecodedIdToken } from 'firebase-admin/auth';
import { deleteUser } from '../repositories/userRepository';

/** Shape returned by all /me endpoints. */
export interface UserProfile {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

/** Extracts public profile fields from a decoded Firebase ID token. */
export function getUserProfile(decoded: DecodedIdToken): UserProfile {
  const { uid, email, name, picture } = decoded;
  return { uid, email, name, picture };
}

/**
 * Merges validated update data onto the token-derived profile.
 * Replace with a real persistence call once a database is added.
 */
export function applyProfileUpdate(
  decoded: DecodedIdToken,
  data: { name?: string; picture?: string },
): UserProfile {
  return { ...getUserProfile(decoded), ...data };
}

/**
 * Permanently removes the user from Firebase Auth.
 * Extend this function to purge any database records before the Auth deletion.
 */
export async function deleteUserAccount(uid: string): Promise<void> {
  await deleteUser(uid);
}

