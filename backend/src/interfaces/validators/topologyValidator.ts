import { z } from 'zod';

export const createTopologySchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    description: z.string().max(500).default(''),
    devices: z.array(z.any()).default([]),
    connections: z.array(z.any()).default([]),
    isPublic: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
  }),
});

export const updateTopologySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    devices: z.array(z.any()).optional(),
    connections: z.array(z.any()).optional(),
    isPublic: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const ipSchema = z.string().regex(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, 'Invalid IP address');

export const pingSchema = z.object({
  body: z.object({
    sourceId: z.string().uuid('Invalid source device ID'),
    destinationId: z.string().uuid('Invalid destination device ID'),
  }),
});

export const tracerouteSchema = z.object({
  body: z.object({
    sourceId: z.string().uuid('Invalid source device ID'),
    destinationId: z.string().uuid('Invalid destination device ID'),
  }),
});

export const portScanSchema = z.object({
  body: z.object({
    targetId: z.string().uuid('Invalid target device ID'),
    ports: z.array(z.number().min(1).max(65535)).min(1),
  }),
});
