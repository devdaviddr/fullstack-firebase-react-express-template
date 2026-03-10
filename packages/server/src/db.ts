import { Pool } from 'pg';
import { config } from './config';

// the pool will throw if connectionString is empty, so we create lazily
// to avoid errors when the database isn't used (e.g. during unit tests where
// the repo functions are mocked).
let _pool: Pool | null = null;

function getPool(): Pool {
  if (_pool) return _pool;
  if (!config.databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }
  _pool = new Pool({ connectionString: config.databaseUrl });
  return _pool;
}

/**
 * Ensures that the database has all required tables. Call once at startup.
 */
export async function initDb(): Promise<void> {
  if (!config.databaseUrl) {
    // when running unit tests the database is not configured and repositories
    // are mocked; avoid throwing so tests that createApp() don't fail.
    return;
  }
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      uid TEXT PRIMARY KEY,
      email TEXT,
      name TEXT,
      picture TEXT
    );
  `);
}

export function query<
  T extends import('pg').QueryResultRow = Record<string, unknown>,
>(text: string, params?: unknown[]): Promise<import('pg').QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(text, params);
}
