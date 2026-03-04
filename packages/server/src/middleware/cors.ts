import { Express } from 'express';
import cors from 'cors';

export function applyCors(app: Express, origin: string) {
  app.use(cors({ origin, credentials: true }));
}
