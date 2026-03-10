import admin from '../firebase';
import type { UserProfile } from '../services/userService';
import { query } from '../db';

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

// ----------- database-backed user helpers -------------------------------

/**
 * Finds a user row by uid. Returns null if it doesn't exist.
 */
export async function findUserByUid(uid: string): Promise<UserProfile | null> {
  type Row = { uid: string; email: string | null; name: string | null; picture: string | null };
  const res = await query<Row>('SELECT uid, email, name, picture FROM users WHERE uid=$1', [uid]);
  if (res.rows.length === 0) return null;
  const row = res.rows[0];
  return {
    uid: row.uid,
    email: row.email ?? undefined,
    name: row.name ?? undefined,
    picture: row.picture ?? undefined,
  };
}

/**
 * Retrieves every user profile in the users table. This is a simple
 * admin-style list endpoint; callers should be cautious about volume in a
 * production system.
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const res = await query<{ uid: string; email: string | null; name: string | null; picture: string | null }>(
    'SELECT uid, email, name, picture FROM users',
  );
  return res.rows.map((row) => ({
    uid: row.uid,
    email: row.email ?? undefined,
    name: row.name ?? undefined,
    picture: row.picture ?? undefined,
  }));
}

/**
 * Inserts a user record unless one already exists. This is a no-op when the
 * row already exists, so it is safe to call on every login.
 */
export async function ensureUser(profile: UserProfile): Promise<void> {
  await query(
    `INSERT INTO users (uid, email, name, picture)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (uid) DO NOTHING`,
    [profile.uid, profile.email ?? null, profile.name ?? null, profile.picture ?? null],
  );
}

/**
 * Updates an existing user row with any provided fields. Fields not passed
 * remain unchanged. The caller should guarantee that a row exists (e.g. via
 * `ensureUser`) before invoking this.
 */
export async function updateUser(profile: Partial<UserProfile> & { uid: string }): Promise<void> {
  const { uid, email, name, picture } = profile;
  await query(
    `UPDATE users
       SET email   = COALESCE($2, email),
           name    = COALESCE($3, name),
           picture = COALESCE($4, picture)
     WHERE uid = $1`,
    [uid, email ?? null, name ?? null, picture ?? null],
  );
}

