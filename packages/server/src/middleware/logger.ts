import { Express } from 'express';
import morgan from 'morgan';

export function applyLogging(app: Express) {
  // simple request logger using morgan
  app.use(morgan('tiny'));
}
