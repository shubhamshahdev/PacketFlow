import { Topology } from '../entities/Topology';

export interface ITopologyRepository {
  findById(id: string): Promise<Topology | null>;
  findByUserId(userId: string): Promise<Topology[]>;
  findAll(limit?: number, offset?: number): Promise<Topology[]>;
  save(topology: Topology): Promise<Topology>;
  update(topology: Topology): Promise<Topology>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
  search(query: string): Promise<Topology[]>;
}
