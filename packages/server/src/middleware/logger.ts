import { Express } from 'express';
import morgan from 'morgan';

export function applyLogging(app: Express) {
  // 'combined' in production includes user-agent, referrer, and response time;
  // 'dev' in development gives colour-coded concise output.
  const format = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
  app.use(morgan(format));
}
