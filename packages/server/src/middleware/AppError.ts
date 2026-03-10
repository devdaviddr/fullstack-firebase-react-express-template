/**
 * Typed application error that carries an HTTP status code so the central
 * errorHandler can forward the correct status instead of always returning 500.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
    // Restore prototype chain for `instanceof` checks across transpilation targets.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
