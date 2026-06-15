import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { config } from '@config/index';
import routes from '@interfaces/routes/index';
import { errorHandler } from '@infrastructure/middleware/errorHandler';
import { logger } from '@infrastructure/logging/logger';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-Request-Id'],
}));

// Rate limiting
app.use(rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { message: 'Too many requests, please try again later', code: 'RATE_LIMIT_EXCEEDED' } },
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  }));
}

// Request ID
app.use((req, _res, next) => {
  (req as Record<string, unknown>).requestId = crypto.randomUUID();
  next();
});

// Swagger/OpenAPI
if (config.swagger.enabled) {
  const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'PacketFlow API',
        version: '1.0.0',
        description: 'Network Simulation and Packet Analysis Platform API',
        license: { name: 'MIT' },
        contact: { name: 'PacketFlow Team' },
      },
      servers: [
        { url: `http://localhost:${config.port}`, description: 'Development server' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    apis: ['./src/interfaces/routes/*.ts'],
  });

  app.use(config.swagger.path, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'PacketFlow API Documentation',
  }));

  logger.info(`Swagger docs available at ${config.swagger.path}`);
}

// API Routes
app.use('/api', routes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: { message: 'Route not found', code: 'NOT_FOUND' } });
});

// Error handler
app.use(errorHandler);

export default app;
