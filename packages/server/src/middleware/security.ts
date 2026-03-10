import { Express } from 'express';
import helmet from 'helmet';

export function applySecurity(app: Express): void {
  // set various HTTP headers to secure the app
  app.use(helmet());
}
