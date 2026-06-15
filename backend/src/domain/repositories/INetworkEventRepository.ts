import { NetworkEvent, NetworkStatistics } from '../entities/Topology';

export interface INetworkEventRepository {
  findById(id: string): Promise<NetworkEvent | null>;
  findByTopologyId(topologyId: string, limit?: number, offset?: number): Promise<NetworkEvent[]>;
  save(event: NetworkEvent): Promise<NetworkEvent>;
  deleteOldEvents(before: Date): Promise<number>;
  countByTopologyId(topologyId: string): Promise<number>;
}

export interface INetworkStatisticsRepository {
  findByTopologyId(topologyId: string, limit?: number): Promise<NetworkStatistics[]>;
  save(stats: NetworkStatistics): Promise<NetworkStatistics>;
  getLatest(topologyId: string): Promise<NetworkStatistics | null>;
  getAverageLatency(topologyId: string, since: Date): Promise<number>;
  getTotalTraffic(topologyId: string, since: Date): Promise<{ packets: number; bytes: number }>;
}
