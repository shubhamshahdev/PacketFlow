import { ITopologyRepository } from '@domain/repositories/ITopologyRepository';
import { Topology } from '@domain/entities/Topology';
import { getPrismaClient } from '@infrastructure/database/prisma-client';

export class PrismaTopologyRepository implements ITopologyRepository {
  private get prisma() {
    return getPrismaClient();
  }

  async findById(id: string): Promise<Topology | null> {
    const record = await this.prisma.topology.findUnique({ where: { id } });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async findByUserId(userId: string): Promise<Topology[]> {
    const records = await this.prisma.topology.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async findAll(limit = 50, offset = 0): Promise<Topology[]> {
    const records = await this.prisma.topology.findMany({
      take: limit,
      skip: offset,
      orderBy: { updatedAt: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async save(topology: Topology): Promise<Topology> {
    const record = await this.prisma.topology.create({
      data: {
        id: topology.id,
        name: topology.name,
        description: topology.description,
        devices: JSON.parse(JSON.stringify(topology.devices)),
        connections: JSON.parse(JSON.stringify(topology.connections)),
        userId: topology.userId,
        isPublic: topology.isPublic,
        tags: topology.tags,
      },
    });
    return this.mapToDomain(record);
  }

  async update(topology: Topology): Promise<Topology> {
    const record = await this.prisma.topology.update({
      where: { id: topology.id },
      data: {
        name: topology.name,
        description: topology.description,
        devices: JSON.parse(JSON.stringify(topology.devices)),
        connections: JSON.parse(JSON.stringify(topology.connections)),
        isPublic: topology.isPublic,
        tags: topology.tags,
      },
    });
    return this.mapToDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.topology.delete({ where: { id } });
  }

  async count(): Promise<number> {
    return this.prisma.topology.count();
  }

  async search(query: string): Promise<Topology[]> {
    const records = await this.prisma.topology.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  private mapToDomain(record: Record<string, unknown>): Topology {
    return {
      id: record.id as string,
      name: record.name as string,
      description: record.description as string,
      devices: record.devices as Topology['devices'],
      connections: record.connections as Topology['connections'],
      userId: record.userId as string,
      isPublic: record.isPublic as boolean,
      tags: record.tags as string[],
      createdAt: record.createdAt as Date,
      updatedAt: record.updatedAt as Date,
    };
  }
}
