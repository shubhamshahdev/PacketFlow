import { Router } from 'express';
import { AuthController } from '@interfaces/controllers/AuthController';
import { authenticate } from '@infrastructure/middleware/authMiddleware';
import { validate } from '@interfaces/middleware/validate';
import { registerSchema, loginSchema } from '@interfaces/validators/authValidator';

const router = Router();
const controller = new AuthController();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password]
 *             properties:
 *               email: { type: string, format: email }
 *               username: { type: string, minLength: 3 }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201: { description: User registered successfully }
 *       409: { description: Email or username already exists }
 */
router.post('/register', validate(registerSchema), controller.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validate(loginSchema), controller.login);

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: User profile }
 *       401: { description: Unauthorized }
 */
router.get('/profile', authenticate, controller.getProfile);

export default router;
