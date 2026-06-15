import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import { getPrismaClient } from '@infrastructure/database/prisma-client';

export class PrismaUserRepository implements IUserRepository {
  private get prisma() {
    return getPrismaClient();
  }

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { id } });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { email } });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async findByUsername(username: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { username } });
    if (!record) return null;
    return this.mapToDomain(record);
  }

  async save(user: User): Promise<User> {
    const record = await this.prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        username: user.username,
        passwordHash: user.passwordHash,
        role: user.role,
        isActive: user.isActive,
      },
    });
    return this.mapToDomain(record);
  }

  async update(user: User): Promise<User> {
    const record = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        username: user.username,
        passwordHash: user.passwordHash,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
      },
    });
    return this.mapToDomain(record);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async findAll(limit = 50, offset = 0): Promise<User[]> {
    const records = await this.prisma.user.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    });
    return records.map((r) => this.mapToDomain(r));
  }

  async count(): Promise<number> {
    return this.prisma.user.count();
  }

  private mapToDomain(record: Record<string, unknown>): User {
    return {
      id: record.id as string,
      email: record.email as string,
      username: record.username as string,
      passwordHash: record.passwordHash as string,
      role: record.role as User['role'],
      isActive: record.isActive as boolean,
      lastLogin: record.lastLogin as Date | null,
      createdAt: record.createdAt as Date,
      updatedAt: record.updatedAt as Date,
    };
  }
}
