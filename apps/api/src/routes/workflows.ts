/**
 * Workflow Automation Routes
 * 
 * API endpoints for managing and executing workflows for MetaForge apps.
 * Connects to the WorkflowEngine for event-driven processing.
 */

import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { getRequestUser } from '../lib/auth.js';
import { createUserNotification } from '../lib/notifications.js';
import { workflowEngine, type WorkflowDefinition, type WorkflowEvent } from '../workflow/engine.js';

export async function workflowRoutes(app: FastifyInstance) {

  // GET /api/v1/apps/:appId/workflows — List workflows defined in app config
  app.get('/apps/:appId/workflows', async (request, reply) => {
    const { appId } = request.params as { appId: string };
    const user = getRequestUser(request);

    const found = await prisma.app.findUnique({ where: { id: appId } });
    if (!found) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'App not found' },
      });
    }
    if (user.role !== 'admin' && found.ownerId !== user.id) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }

    const config = found.configJson as any;
    const workflows = Array.isArray(config?.workflows) ? config.workflows : [];

    return {
      success: true,
      data: workflows,
      meta: {
        total: workflows.length,
        enabled: workflows.filter((w: any) => w.enabled).length,
      },
    };
  });

  // PUT /api/v1/apps/:appId/workflows — Update all workflows in app config
  app.put('/apps/:appId/workflows', async (request, reply) => {
    const { appId } = request.params as { appId: string };
    const body = request.body as { workflows: any[] };
    const user = getRequestUser(request);

    const found = await prisma.app.findUnique({ where: { id: appId } });
    if (!found) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'App not found' },
      });
    }
    if (user.role !== 'admin' && found.ownerId !== user.id) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }

    const config = (found.configJson && typeof found.configJson === 'object') ? { ...(found.configJson as any) } : {};
    config.workflows = body.workflows || [];

    await prisma.app.update({
      where: { id: appId },
      data: { configJson: config },
    });

    // Reload workflows in engine
    const workflowDefs: WorkflowDefinition[] = (config.workflows || []).map((w: any) => ({
      ...w,
      appId,
    }));
    workflowEngine.loadWorkflows(workflowDefs);

    return {
      success: true,
      data: config.workflows,
      meta: {
        total: config.workflows.length,
        enabled: config.workflows.filter((w: any) => w.enabled).length,
      },
    };
  });

  // POST /api/v1/apps/:appId/workflows/trigger — Manually trigger a workflow event
  app.post('/apps/:appId/workflows/trigger', async (request, reply) => {
    const { appId } = request.params as { appId: string };
    const body = request.body as {
      eventType: string;
      entity?: string;
      record?: Record<string, any>;
    };
    const user = getRequestUser(request);

    const found = await prisma.app.findUnique({ where: { id: appId } });
    if (!found) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'App not found' },
      });
    }
    if (user.role !== 'admin' && found.ownerId !== user.id) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }

    if (!body.eventType) {
      return reply.status(400).send({
        success: false,
        error: { code: 'MISSING_EVENT', message: 'eventType is required' },
      });
    }

    // Load workflows from app config
    const config = found.configJson as any;
    const workflows: WorkflowDefinition[] = ((config?.workflows || []) as any[])
      .filter((w: any) => w.enabled)
      .map((w: any) => ({ ...w, appId }));

    workflowEngine.loadWorkflows(workflows);

    const event: WorkflowEvent = {
      type: body.eventType,
      entity: body.entity,
      record: body.record,
      user: { id: user.id, email: user.email, roles: [user.role] },
      timestamp: new Date().toISOString(),
    };

    const jobIds = await workflowEngine.processEvent(event);

    await createUserNotification({
      userId: found.ownerId,
      type: 'workflow_triggered',
      title: `Workflow triggered: ${body.eventType}`,
      message: `${jobIds.length} workflow(s) matched and enqueued for "${body.eventType}" on ${body.entity || 'app'}.`,
      appId: found.id,
      metadata: { eventType: body.eventType, entity: body.entity, jobIds },
    });

    return {
      success: true,
      data: {
        event: body.eventType,
        matchedWorkflows: jobIds.length,
        jobIds,
      },
    };
  });

  // GET /api/v1/apps/:appId/workflows/executions — Execution history
  app.get('/apps/:appId/workflows/executions', async (request, reply) => {
    const { appId } = request.params as { appId: string };
    const query = request.query as { limit?: string; status?: string };
    const user = getRequestUser(request);

    const found = await prisma.app.findUnique({ where: { id: appId } });
    if (!found) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'App not found' },
      });
    }
    if (user.role !== 'admin' && found.ownerId !== user.id) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }

    const limit = parseInt(query.limit || '50', 10);
    const where: any = { appId };
    if (query.status) where.status = query.status;

    const [executions, total] = await Promise.all([
      prisma.workflowExecution.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        take: limit,
      }),
      prisma.workflowExecution.count({ where }),
    ]);

    return {
      success: true,
      data: executions,
      meta: { total, returned: executions.length },
    };
  });

  // GET /api/v1/apps/:appId/workflows/stats — Workflow statistics
  app.get('/apps/:appId/workflows/stats', async (request, reply) => {
    const { appId } = request.params as { appId: string };
    const user = getRequestUser(request);

    const found = await prisma.app.findUnique({ where: { id: appId } });
    if (!found) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'App not found' },
      });
    }
    if (user.role !== 'admin' && found.ownerId !== user.id) {
      return reply.status(403).send({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
    }

    const config = found.configJson as any;
    const workflows = Array.isArray(config?.workflows) ? config.workflows : [];

    const [total, success, failed, partial] = await Promise.all([
      prisma.workflowExecution.count({ where: { appId } }),
      prisma.workflowExecution.count({ where: { appId, status: 'success' } }),
      prisma.workflowExecution.count({ where: { appId, status: 'failed' } }),
      prisma.workflowExecution.count({ where: { appId, status: 'partial' } }),
    ]);

    return {
      success: true,
      data: {
        definedWorkflows: workflows.length,
        enabledWorkflows: workflows.filter((w: any) => w.enabled).length,
        totalExecutions: total,
        successExecutions: success,
        failedExecutions: failed,
        partialExecutions: partial,
        successRate: total > 0 ? Math.round((success / total) * 100) : 100,
      },
    };
  });
}
