import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@infrastructure/security/auth';
import { PrismaUserRepository } from '@infrastructure/repositories/PrismaUserRepository';
import { createUser } from '@domain/entities/User';
import { AppError } from '@infrastructure/errors/AppError';
import { logger } from '@infrastructure/logging/logger';

export class AuthController {
  private authService = new AuthService();
  private userRepo = new PrismaUserRepository();

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, username, password } = req.body;

      const existingEmail = await this.userRepo.findByEmail(email);
      if (existingEmail) {
        throw AppError.conflict('Email already registered');
      }

      const existingUsername = await this.userRepo.findByUsername(username);
      if (existingUsername) {
        throw AppError.conflict('Username already taken');
      }

      const passwordHash = await this.authService.hashPassword(password);
      const user = createUser({ email, username, passwordHash });
      await this.userRepo.save(user);

      const tokens = this.authService.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      logger.info('User registered', { userId: user.id, email: user.email });

      res.status(201).json({
        user: { id: user.id, email: user.email, username: user.username, role: user.role },
        ...tokens,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      const user = await this.userRepo.findByEmail(email);
      if (!user) {
        throw AppError.unauthorized('Invalid email or password');
      }

      if (!user.isActive) {
        throw AppError.forbidden('Account is deactivated');
      }

      const validPassword = await this.authService.comparePassword(password, user.passwordHash);
      if (!validPassword) {
        throw AppError.unauthorized('Invalid email or password');
      }

      user.lastLogin = new Date();
      await this.userRepo.update(user);

      const tokens = this.authService.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      logger.info('User logged in', { userId: user.id, email: user.email });

      res.json({
        user: { id: user.id, email: user.email, username: user.username, role: user.role },
        ...tokens,
      });
    } catch (error) {
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.userRepo.findById(req.user!.userId);
      if (!user) {
        throw AppError.notFound('User not found');
      }
      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      });
    } catch (error) {
      next(error);
    }
  };
}
