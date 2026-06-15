import { INetworkEventRepository, INetworkStatisticsRepository } from '@domain/repositories/INetworkEventRepository';
import { NetworkEvent, NetworkStatistics } from '@domain/entities/Topology';
import { getPrismaClient } from '@infrastructure/database/prisma-client';

export class PrismaNetworkEventRepository implements INetworkEventRepository {
  private get prisma() {
    return getPrismaClient();
  }

  async findById(id: string): Promise<NetworkEvent | null> {
    const record = await this.prisma.networkEvent.findUnique({ where: { id } });
    if (!record) return null;
    return this.mapEvent(record);
  }

  async findByTopologyId(topologyId: string, limit = 100, offset = 0): Promise<NetworkEvent[]> {
    const records = await this.prisma.networkEvent.findMany({
      where: { topologyId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    });
    return records.map((r) => this.mapEvent(r));
  }

  async save(event: NetworkEvent): Promise<NetworkEvent> {
    const record = await this.prisma.networkEvent.create({
      data: {
        id: event.id,
        type: event.type,
        severity: event.severity,
        source: event.source,
        destination: event.destination,
        message: event.message,
        details: event.details,
        topologyId: event.topologyId,
        timestamp: event.timestamp,
      },
    });
    return this.mapEvent(record);
  }

  async deleteOldEvents(before: Date): Promise<number> {
    const result = await this.prisma.networkEvent.deleteMany({
      where: { timestamp: { lt: before } },
    });
    return result.count;
  }

  async countByTopologyId(topologyId: string): Promise<number> {
    return this.prisma.networkEvent.count({ where: { topologyId } });
  }

  private mapEvent(record: Record<string, unknown>): NetworkEvent {
    return {
      id: record.id as string,
      timestamp: record.timestamp as Date,
      type: record.type as NetworkEvent['type'],
      severity: record.severity as NetworkEvent['severity'],
      source: record.source as string,
      destination: record.destination as string,
      message: record.message as string,
      details: record.details as Record<string, unknown>,
      topologyId: record.topologyId as string,
    };
  }
}

export class PrismaNetworkStatisticsRepository implements INetworkStatisticsRepository {
  private get prisma() {
    return getPrismaClient();
  }

  async findByTopologyId(topologyId: string, limit = 60): Promise<NetworkStatistics[]> {
    const records = await this.prisma.networkStatistics.findMany({
      where: { topologyId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
    return records.map((r) => this.mapStats(r));
  }

  async save(stats: NetworkStatistics): Promise<NetworkStatistics> {
    const record = await this.prisma.networkStatistics.create({
      data: {
        id: stats.id,
        totalPackets: stats.totalPackets,
        totalBytes: stats.totalBytes,
        packetsPerSecond: stats.packetsPerSecond,
        bytesPerSecond: stats.bytesPerSecond,
        activeDevices: stats.activeDevices,
        activeConnections: stats.activeConnections,
        packetLoss: stats.packetLoss,
        averageLatency: stats.averageLatency,
        bandwidthUsage: stats.bandwidthUsage,
        topologyId: stats.topologyId,
      },
    });
    return this.mapStats(record);
  }

  async getLatest(topologyId: string): Promise<NetworkStatistics | null> {
    const record = await this.prisma.networkStatistics.findFirst({
      where: { topologyId },
      orderBy: { timestamp: 'desc' },
    });
    if (!record) return null;
    return this.mapStats(record);
  }

  async getAverageLatency(topologyId: string, since: Date): Promise<number> {
    const result = await this.prisma.networkStatistics.aggregate({
      where: { topologyId, timestamp: { gte: since } },
      _avg: { averageLatency: true },
    });
    return result._avg.averageLatency ?? 0;
  }

  async getTotalTraffic(topologyId: string, since: Date): Promise<{ packets: number; bytes: number }> {
    const result = await this.prisma.networkStatistics.aggregate({
      where: { topologyId, timestamp: { gte: since } },
      _sum: { totalPackets: true, totalBytes: true },
    });
    return {
      packets: result._sum.totalPackets ?? 0,
      bytes: result._sum.totalBytes ?? 0,
    };
  }

  private mapStats(record: Record<string, unknown>): NetworkStatistics {
    return {
      id: record.id as string,
      timestamp: record.timestamp as Date,
      totalPackets: record.totalPackets as number,
      totalBytes: record.totalBytes as number,
      packetsPerSecond: record.packetsPerSecond as number,
      bytesPerSecond: record.bytesPerSecond as number,
      activeDevices: record.activeDevices as number,
      activeConnections: record.activeConnections as number,
      packetLoss: record.packetLoss as number,
      averageLatency: record.averageLatency as number,
      bandwidthUsage: record.bandwidthUsage as number,
      topologyId: record.topologyId as string,
    };
  }
}
