import { Request, Response, NextFunction } from 'express';
import { PrismaTopologyRepository } from '@infrastructure/repositories/PrismaTopologyRepository';
import { PrismaNetworkEventRepository, PrismaNetworkStatisticsRepository } from '@infrastructure/repositories/PrismaNetworkEventRepository';
import { SimulationEngine } from '@application/services/SimulationEngine';
import { createTopology } from '@domain/entities/Topology';
import { AppError } from '@infrastructure/errors/AppError';
import { logger } from '@infrastructure/logging/logger';

export class TopologyController {
  private repo = new PrismaTopologyRepository();
  private eventRepo = new PrismaNetworkEventRepository();
  private statsRepo = new PrismaNetworkStatisticsRepository();
  private engine = new SimulationEngine();

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const topology = createTopology({
        ...req.body,
        userId: req.user!.userId,
      });
      const saved = await this.repo.save(topology);
      logger.info('Topology created', { topologyId: saved.id, userId: req.user!.userId });
      res.status(201).json(saved);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = (page - 1) * limit;

      const [topologies, total] = await Promise.all([
        this.repo.findByUserId(req.user!.userId),
        this.repo.count(),
      ]);

      res.json({ data: topologies, total, page, limit });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const topology = await this.repo.findById(req.params.id);
      if (!topology) {
        throw AppError.notFound('Topology not found');
      }
      res.json(topology);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const existing = await this.repo.findById(req.params.id);
      if (!existing) {
        throw AppError.notFound('Topology not found');
      }
      if (existing.userId !== req.user!.userId) {
        throw AppError.forbidden('Not authorized to modify this topology');
      }

      const updated = await this.repo.update({
        ...existing,
        ...req.body,
        updatedAt: new Date(),
      });

      this.engine.loadTopology(updated);
      logger.info('Topology updated', { topologyId: updated.id });
      res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const existing = await this.repo.findById(req.params.id);
      if (!existing) {
        throw AppError.notFound('Topology not found');
      }
      if (existing.userId !== req.user!.userId) {
        throw AppError.forbidden('Not authorized to delete this topology');
      }

      await this.repo.delete(req.params.id);
      this.engine.removeTopology(req.params.id);
      logger.info('Topology deleted', { topologyId: req.params.id });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  loadForSimulation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const topology = await this.repo.findById(req.params.id);
      if (!topology) {
        throw AppError.notFound('Topology not found');
      }
      this.engine.loadTopology(topology);
      res.json({ message: 'Topology loaded for simulation', topologyId: topology.id });
    } catch (error) {
      next(error);
    }
  };

  ping = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = this.engine.simulatePing(req.params.id, req.body.sourceId, req.body.destinationId);
      const event = this.engine.generateNetworkEvent(req.params.id, 'PACKET_SENT');
      await this.eventRepo.save(event);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  traceroute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = this.engine.simulateTraceroute(req.params.id, req.body.sourceId, req.body.destinationId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  portScan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = this.engine.simulatePortScan(req.params.id, req.body.targetId, req.body.ports);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  packetFlow = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const packets = this.engine.simulatePacketFlow(req.params.id, req.body.sourceId, req.body.destinationId);
      res.json(packets);
    } catch (error) {
      next(error);
    }
  };

  routingTable = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const table = this.engine.getDeviceRoutingTable(req.params.id, req.params.deviceId);
      res.json(table);
    } catch (error) {
      next(error);
    }
  };

  getStatistics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = this.engine.generateStatistics(req.params.id);
      await this.statsRepo.save(stats);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  getEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const offset = parseInt(req.query.offset as string) || 0;
      const events = await this.eventRepo.findByTopologyId(req.params.id, limit, offset);
      const total = await this.eventRepo.countByTopologyId(req.params.id);
      res.json({ data: events, total, limit, offset });
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = req.query.q as string;
      if (!query) {
        throw AppError.badRequest('Search query is required');
      }
      const results = await this.repo.search(query);
      res.json(results);
    } catch (error) {
      next(error);
    }
  };
}
