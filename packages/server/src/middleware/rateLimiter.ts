import { Express } from 'express';
import rateLimit from 'express-rate-limit';

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export function applyRateLimiting(app: Express, opts: RateLimitOptions): void {
  const limiter = rateLimit(opts);
  app.use(limiter);
}
