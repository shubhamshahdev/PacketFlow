import { Router } from 'express';
import { TopologyController } from '@interfaces/controllers/TopologyController';
import { authenticate } from '@infrastructure/middleware/authMiddleware';
import { validate } from '@interfaces/middleware/validate';
import {
  createTopologySchema,
  updateTopologySchema,
  pingSchema,
  tracerouteSchema,
  portScanSchema,
} from '@interfaces/validators/topologyValidator';

const router = Router();
const controller = new TopologyController();

// All topology routes require authentication
router.use(authenticate);

/**
 * @openapi
 * /api/topologies:
 *   get:
 *     tags: [Topologies]
 *     summary: List all topologies for current user
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *     responses:
 *       200: { description: List of topologies }
 */
router.get('/', controller.getAll);

/**
 * @openapi
 * /api/topologies/search:
 *   get:
 *     tags: [Topologies]
 *     summary: Search topologies
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Search results }
 */
router.get('/search', controller.search);

/**
 * @openapi
 * /api/topologies:
 *   post:
 *     tags: [Topologies]
 *     summary: Create a new topology
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Topology created }
 */
router.post('/', validate(createTopologySchema), controller.create);

/**
 * @openapi
 * /api/topologies/{id}:
 *   get:
 *     tags: [Topologies]
 *     summary: Get topology by ID
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Topology details }
 *       404: { description: Not found }
 */
router.get('/:id', controller.getById);

/**
 * @openapi
 * /api/topologies/{id}:
 *   put:
 *     tags: [Topologies]
 *     summary: Update topology
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Topology updated }
 */
router.put('/:id', validate(updateTopologySchema), controller.update);

/**
 * @openapi
 * /api/topologies/{id}:
 *   delete:
 *     tags: [Topologies]
 *     summary: Delete topology
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       204: { description: Deleted }
 */
router.delete('/:id', controller.delete);

// Simulation endpoints
router.post('/:id/load', controller.loadForSimulation);
router.post('/:id/ping', validate(pingSchema), controller.ping);
router.post('/:id/traceroute', validate(tracerouteSchema), controller.traceroute);
router.post('/:id/port-scan', validate(portScanSchema), controller.portScan);
router.post('/:id/packet-flow', validate(pingSchema), controller.packetFlow);
router.get('/:id/statistics', controller.getStatistics);
router.get('/:id/events', controller.getEvents);
router.get('/:id/devices/:deviceId/routing-table', controller.routingTable);

export default router;
