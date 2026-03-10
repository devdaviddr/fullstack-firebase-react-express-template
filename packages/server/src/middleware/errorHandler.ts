import { NextFunction, Request, Response } from 'express';
import { AppError } from './AppError';

/** Central error handler – must be the last middleware registered in app.ts. */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  // Structured log: include method + path for quick triage; never log auth tokens.
  const context = `${req.method} ${req.path}`;
  if (err instanceof AppError) {
    // Operational errors are expected — log at warn level, not error.
    console.warn(`[${context}] AppError ${err.statusCode}: ${err.message}`);
  } else {
    console.error(`[${context}] Unhandled error:`, err);
  }

  if (res.headersSent) {
    return;
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal Server Error';
  res.status(statusCode).json({ error: message });
}
