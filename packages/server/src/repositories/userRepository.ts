import admin from '../firebase';

// data access layer – wraps firebase-admin calls so they can be mocked or
// replaced with a different data source later.
export function verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
  return admin.auth().verifyIdToken(idToken);
}
