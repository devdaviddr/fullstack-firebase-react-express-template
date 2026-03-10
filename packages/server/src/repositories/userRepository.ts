import admin from '../firebase';

// data access layer – wraps firebase-admin calls so they can be mocked or
// replaced with a different data source later.
export function verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  return admin.auth().verifyIdToken(idToken);
}

/**
 * Revokes all refresh tokens and permanently deletes the Firebase Auth user.
 * Must be called before any database cleanup in the service layer.
 */
export async function deleteUser(uid: string): Promise<void> {
  await admin.auth().revokeRefreshTokens(uid);
  await admin.auth().deleteUser(uid);
}

