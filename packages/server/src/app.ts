import express from 'express';
import apiRouter from './routes';
import { applySecurity } from './middleware/security';
import { applyLogging } from './middleware/logger';
import { applyRateLimiting } from './middleware/rateLimiter';
import { applyCors } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { config } from './config';

export function createApp() {
  const app = express();

  // apply middleware layers
  applySecurity(app);
  applyLogging(app);
  applyRateLimiting(app, config.rateLimit);
  applyCors(app, config.corsOrigin);

  // built-in middleware
  app.use(express.json());

  // mount API router
  app.use('/api', apiRouter);

  // error handler should come after all routes
  app.use(errorHandler);

  return app;
}
