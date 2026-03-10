import express, { Express } from 'express';
import apiRouter from './routes';
import { applySecurity } from './middleware/security';
import { applyLogging } from './middleware/logger';
import { applyRateLimiting } from './middleware/rateLimiter';
import { applyCors } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';

export function createApp(): Express {
  const app = express();

  // trust first proxy hop so express-rate-limit uses the real client IP
  app.set('trust proxy', 1);

  // apply middleware layers
  applySecurity(app);
  applyLogging(app);
  applyRateLimiting(app, config.rateLimit);
  applyCors(app, config.corsOrigin);

  // built-in middleware — 10 kb cap prevents trivial payload-flood attacks
  app.use(express.json({ limit: '10kb' }));

  // mount API router
  app.use('/api', apiRouter);

  // error handler should come after all routes
  app.use(errorHandler);

  return app;
}
