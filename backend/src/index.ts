import 'reflect-metadata';
import app from './app';
import { config } from '@config/index';
import { logger } from '@infrastructure/logging/logger';
import { disconnectPrisma } from '@infrastructure/database/prisma-client';

const server = app.listen(config.port, () => {
  logger.info(`PacketFlow API server running on port ${config.port}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Swagger docs: http://localhost:${config.port}${config.swagger.path}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    await disconnectPrisma();
    logger.info('Server shut down complete');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(async () => {
    await disconnectPrisma();
    logger.info('Server shut down complete');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

export default server;
