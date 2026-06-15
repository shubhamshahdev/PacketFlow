import { v4 as uuidv4 } from 'uuid';

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER',
}

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export function createUser(overrides: Partial<User> = {}): User {
  const now = new Date();
  return {
    id: uuidv4(),
    email: '',
    username: '',
    passwordHash: '',
    role: UserRole.USER,
    isActive: true,
    lastLogin: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
