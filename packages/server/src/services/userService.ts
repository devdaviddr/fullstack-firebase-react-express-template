import type { DecodedIdToken } from 'firebase-admin/auth';
import { deleteUser, ensureUser, updateUser, getAllUsers } from '../repositories/userRepository';

/** Shape returned by all /me endpoints. */
export interface UserProfile {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

/**
 * Extracts public profile fields from a decoded Firebase ID token.
 * This is intentionally a pure function so it can be unit tested without
 * touching the database.
 */
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
 * Returns a profile object and also ensures the user exists in the database.
 * The insert is idempotent so it may be called on every request after token
 * validation; SQL uses ON CONFLICT DO NOTHING so existing rows are preserved.
 */
export async function getOrCreateUser(decoded: DecodedIdToken): Promise<UserProfile> {
  const profile = getUserProfile(decoded);
  await ensureUser(profile);
  return profile;
}

/**
 * Applies the update data onto the decoded token profile and persists the
 * changes in the database.  The row is ensured first to handle the rare case
 * where the user has just been created in Auth but wasn't in the table yet.
 */
export async function updateUserProfile(
  decoded: DecodedIdToken,
  data: { name?: string; picture?: string },
): Promise<UserProfile> {
  const profile = applyProfileUpdate(decoded, data);
  await ensureUser(profile);
  await updateUser(profile);
  return profile;
}

/**
 * Administrative helper that lists every user in the database.
 */
export async function listUsers(): Promise<UserProfile[]> {
  return getAllUsers();
}

/**
 * Permanently removes the user from Firebase Auth.
 * Extend this function to purge any database records before the Auth deletion.
 */
export async function deleteUserAccount(uid: string): Promise<void> {
  await deleteUser(uid);
}

