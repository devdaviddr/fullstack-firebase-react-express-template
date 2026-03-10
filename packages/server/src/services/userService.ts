import type { DecodedIdToken } from 'firebase-admin/auth';

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
