/**
 * MetaForge API Server
 * 
 * Fastify-based backend that handles:
 * - Config validation and app deployment
 * - Dynamic CRUD API generation per entity
 * - Workflow execution
 * - CSV import/export
 * - GitHub export
 * - Multi-language (i18n) support
 * - Email notifications via Nodemailer
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { configRoutes } from './routes/config.js';
import { appsRoutes } from './routes/apps.js';
import { healthRoutes } from './routes/health.js';
import { deployRoutes } from './routes/deploy.js';
import { exportRoutes } from './routes/export.js';
import { notificationRoutes } from './routes/notifications.js';
import { authRoutes } from './routes/auth.js';
import { deployHistoryRoutes } from './routes/deploy-history.js';
import { generateRoutes } from './routes/generate.js';
import { githubRoutes } from './routes/github.js';
import { csvRoutes } from './routes/csv.js';
import { workflowRoutes } from './routes/workflows.js';
import { i18nRoutes } from './routes/i18n.js';
import { registerAuth } from './lib/auth.js';

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function buildServer() {
  const app = Fastify({
    logger: {
      level: 'info',
      transport: {
        target: 'pino-pretty',
        options: { translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
      },
    },
  });

  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }

  // Plugins
  await app.register(cors, {
    origin: allowedOrigins,
    credentials: true,
  });

  const { initSocket } = await import('./lib/socket.js');
  initSocket(app);

  registerAuth(app);

  // Routes
  await app.register(healthRoutes, { prefix: '/api/v1' });
  await app.register(configRoutes, { prefix: '/api/v1' });
  await app.register(appsRoutes, { prefix: '/api/v1' });
  await app.register(deployRoutes, { prefix: '/api/v1' });
  await app.register(exportRoutes, { prefix: '/api/v1' });
  await app.register(notificationRoutes, { prefix: '/api/v1' });
  await app.register(authRoutes, { prefix: '/api/v1' });
  await app.register(deployHistoryRoutes, { prefix: '/api/v1' });
  await app.register(generateRoutes, { prefix: '/api/v1' });
  await app.register(githubRoutes, { prefix: '/api/v1' });
  await app.register(csvRoutes, { prefix: '/api/v1' });
  await app.register(workflowRoutes, { prefix: '/api/v1' });
  await app.register(i18nRoutes, { prefix: '/api/v1' });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    reply.status(error.statusCode || 500).send({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred',
      },
    });
  });

  return app;
}

async function start() {
  try {
    const app = await buildServer();
    await app.listen({ port: PORT, host: HOST });
    console.log(`\n⚡ MetaForge API running at http://localhost:${PORT}\n`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

export { buildServer };
