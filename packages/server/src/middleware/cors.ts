import { Express } from 'express';
import cors from 'cors';

/**
 * Applies CORS middleware. Accepts a single origin string or an array so that
 * comma-separated values from CORS_ORIGIN env var can be forwarded directly.
 */
export function applyCors(app: Express, origin: string | string[]): void {
  app.use(cors({ origin, credentials: true }));
}
