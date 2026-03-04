import { NextFunction, Request, Response } from 'express';

// central error handler – should be the last middleware registered
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  if (res.headersSent) {
    return;
  }

  // customize further based on error type if desired
  res.status(500).json({ error: 'Internal Server Error' });
}
