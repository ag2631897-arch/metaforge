/**
 * Config Routes — Handles JSON config validation and parsing
 */

import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { getRequestUser } from '../lib/auth.js';

export async function configRoutes(app: FastifyInstance) {
  // Validate a config without deploying
  app.post('/config/validate', async (request, reply) => {
    const body = request.body as any;

    if (!body || typeof body !== 'object') {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_BODY', message: 'Request body must be a JSON object' },
      });
    }

    const issues: any[] = [];
    let isValid = true;

    // Stage 1: Check basic structure
    if (!body.app?.name) {
      issues.push({ severity: 'warning', path: 'app.name', message: 'App name is missing', code: 'MISSING_FIELD' });
    }

    if (!body.entities || !Array.isArray(body.entities)) {
      issues.push({ severity: 'info', path: 'entities', message: 'No entities defined', code: 'EMPTY_ENTITIES' });
    } else {
      body.entities.forEach((entity: any, i: number) => {
        if (!entity.name) {
          issues.push({ severity: 'error', path: `entities[${i}].name`, message: 'Entity name is required', code: 'MISSING_FIELD' });
          isValid = false;
        }
        if (!entity.fields || entity.fields.length === 0) {
          issues.push({ severity: 'warning', path: `entities[${i}].fields`, message: `Entity "${entity.name || i}" has no fields`, code: 'EMPTY_FIELDS' });
        }
      });
    }

    if (!body.pages || !Array.isArray(body.pages) || body.pages.length === 0) {
      issues.push({ severity: 'warning', path: 'pages', message: 'No pages defined', code: 'EMPTY_PAGES' });
    }

    return {
      success: true,
      data: {
        valid: isValid,
        issues,
        stats: {
          errors: issues.filter((i: any) => i.severity === 'error').length,
          warnings: issues.filter((i: any) => i.severity === 'warning').length,
          infos: issues.filter((i: any) => i.severity === 'info').length,
          entities: body.entities?.length || 0,
          pages: body.pages?.length || 0,
        },
      },
    };
  });

  // Get config for an app
  app.get('/apps/:appId/config', async (request, reply) => {
    const { appId } = request.params as { appId: string };
    const user = getRequestUser(request);

    const found = await prisma.app.findUnique({
      where: { id: appId },
      select: {
        id: true,
        ownerId: true,
        configJson: true,
        updatedAt: true,
        configVersion: true,
      },
    });

    if (!found) {
      return { success: true, data: null };
    }

    if (user.role !== 'admin' && found.ownerId !== user.id) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to this app' },
      });
    }

    return {
      success: true,
      data: {
        config: found.configJson,
        version: found.configVersion,
        updatedAt: found.updatedAt,
      },
    };
  });


}
