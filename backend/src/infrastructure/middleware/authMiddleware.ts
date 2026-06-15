import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@infrastructure/security/auth';
import { AppError } from '@infrastructure/errors/AppError';
import { JwtPayload, UserRole } from '@domain/entities/User';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.unauthorized('Missing or invalid authorization header');
    }
    const token = authHeader.substring(7);
    const authService = new AuthService();
    const payload = authService.verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(AppError.unauthorized('Invalid or expired token'));
    }
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(AppError.unauthorized());
      return;
    }
    if (!roles.includes(req.user.role)) {
      next(AppError.forbidden('Insufficient permissions'));
      return;
    }
    next();
  };
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const authService = new AuthService();
      req.user = authService.verifyToken(token);
    }
  } catch {
    // Ignore auth errors for optional auth
  }
  next();
}
