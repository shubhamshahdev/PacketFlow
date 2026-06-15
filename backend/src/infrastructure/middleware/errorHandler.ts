import { Request, Response, NextFunction } from 'express';
import { AppError } from '@infrastructure/errors/AppError';
import { logger } from '@infrastructure/logging/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn('Operational error', {
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      details: err.details,
    });
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        details: err.details,
      },
    });
    return;
  }

  logger.error('Unexpected error', {
    message: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    error: {
      message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      code: 'INTERNAL_ERROR',
    },
  });
}
