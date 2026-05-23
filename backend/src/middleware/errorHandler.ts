import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // Log errors in development
  if (env.NODE_ENV === 'development') {
    console.error('[ErrorHandler]', err);
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // Handle known Error instances
  if (err instanceof Error) {
    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      res.status(401).json({ success: false, message: 'Invalid or expired token.' });
      return;
    }

    // Mongoose duplicate key error
    if ('code' in err && (err as NodeJS.ErrnoException).code === '11000') {
      res.status(409).json({ success: false, message: 'Resource already exists.' });
      return;
    }

    // Mongoose CastError (invalid ObjectId)
    if (err.name === 'CastError') {
      res.status(400).json({ success: false, message: 'Invalid resource ID format.' });
      return;
    }

    const statusCode =
      'statusCode' in err && typeof (err as { statusCode?: number }).statusCode === 'number'
        ? (err as { statusCode: number }).statusCode
        : 500;

    res.status(statusCode).json({
      success: false,
      message: env.NODE_ENV === 'development' ? (err.message || 'Internal server error') : 'Internal server error',
    });
    return;
  }

  // Unknown/non-Error objects
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred',
    errors: env.NODE_ENV === 'development' ? err : undefined,
  });
}
