import { Router } from 'express';
import authRoutes from './authRoutes';
import topologyRoutes from './topologyRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/topologies', topologyRoutes);

// Health check
/**
 * @openapi
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string }
 *                 timestamp: { type: string }
 *                 version: { type: string }
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
  });
});

export default router;
