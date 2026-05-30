/**
 * Apps Routes — CRUD for MetaForge apps
 */

import { FastifyInstance } from 'fastify';
import AdmZip from 'adm-zip';
import { prisma } from '../lib/prisma.js';
import { getRequestUser } from '../lib/auth.js';
import { createUserNotification } from '../lib/notifications.js';
import { generateStandaloneProject } from '../generators/github-export.js';

function getOwnedAppWhere(user: ReturnType<typeof getRequestUser>) {
  return user.role === 'admin' ? {} : { ownerId: user.id };
}

function getTodayStart() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return start;
}

function byteSize(value: unknown) {
  return Buffer.byteLength(JSON.stringify(value ?? ''), 'utf8');
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function exportConfigForApp(found: { name: string; description: string | null; configJson: any }) {
  const config = found.configJson && typeof found.configJson === 'object'
    ? { ...found.configJson }
    : {};

  return {
    ...config,
    app: {
      name: config.app?.name || found.name,
      description: config.app?.description || found.description || 'Generated with MetaForge',
      ...(config.app || {}),
    },
    entities: Array.isArray(config.entities) ? config.entities : [],
    pages: Array.isArray(config.pages) ? config.pages : [],
    workflows: Array.isArray(config.workflows) ? config.workflows : [],
  };
}

export async function appsRoutes(app: FastifyInstance) {
  // List all apps
  app.get('/apps', async (request) => {
    const user = getRequestUser(request);
    const apps = await prisma.app.findMany({
      where: getOwnedAppWhere(user),
      orderBy: { updatedAt: 'desc' },
      include: { owner: true }
    });
    return {
      success: true,
      data: apps,
      meta: { total: apps.length },
    };
  });

  // Dashboard stats derived from real stored app, deploy, and workflow data.
  app.get('/apps/stats', async (request) => {
    const user = getRequestUser(request);
    const appWhere = getOwnedAppWhere(user);
    const todayStart = getTodayStart();

    const [apps, deploysToday, workflowExecutionsToday, deploys] = await Promise.all([
      prisma.app.findMany({
        where: appWhere,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          configJson: true,
          updatedAt: true,
        },
      }),
      prisma.deploy.count({
        where: {
          startedAt: { gte: todayStart },
          ...(user.role === 'admin' ? {} : { app: { ownerId: user.id } }),
        },
      }),
      prisma.workflowExecution.count({
        where: {
          startedAt: { gte: todayStart },
          ...(user.role === 'admin'
            ? {}
            : { appId: { in: await prisma.app.findMany({ where: appWhere, select: { id: true } }).then(rows => rows.map(row => row.id)) } }),
        },
      }),
      prisma.deploy.findMany({
        where: user.role === 'admin' ? {} : { app: { ownerId: user.id } },
        select: { stages: true, buildLog: true, errorMessage: true },
      }),
    ]);

    const appStorage = apps.reduce(
      (sum, item) =>
        sum +
        byteSize({
          name: item.name,
          description: item.description,
          status: item.status,
          configJson: item.configJson,
          updatedAt: item.updatedAt,
        }),
      0,
    );

    const deployStorage = deploys.reduce(
      (sum, item) =>
        sum +
        byteSize({
          stages: item.stages,
          buildLog: item.buildLog,
          errorMessage: item.errorMessage,
        }),
      0,
    );

    return {
      success: true,
      data: {
        totalApps: apps.length,
        liveApps: apps.filter(item => item.status === 'live').length,
        draftApps: apps.filter(item => item.status === 'draft').length,
        deployingApps: apps.filter(item => item.status === 'deploying').length,
        requestsToday: deploysToday + workflowExecutionsToday,
        storageUsedBytes: appStorage + deployStorage,
        storageUsedLabel: formatBytes(appStorage + deployStorage),
      },
    };
  });

  // Get single app
  app.get('/apps/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = getRequestUser(request);
    const found = await prisma.app.findUnique({
      where: { id },
      include: { owner: true }
    });
    if (!found) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'App not found' } });
    if (user.role !== 'admin' && found.ownerId !== user.id) {
      return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have access to this app' } });
    }
    return { success: true, data: found };
  });

  // Create app
  app.post('/apps', async (request) => {
    const body = request.body as any;
    const user = getRequestUser(request);
    
    const configJson = body.config || (body.entities || body.pages || body.workflows ? body : null);
    const appConfig = configJson?.app || body.app || {};
    const name = appConfig.name || body.name || 'Untitled App';
    const description = appConfig.description || body.description;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);

    const newApp = await prisma.app.create({
      data: {
        name,
        description,
        slug,
        status: body.status || 'draft',
        configVersion: 1,
        configJson: configJson || {
          app: { name, description },
          entities: [],
          pages: [],
          workflows: [],
        },
        primaryColor: body.theme?.primary || body.primaryColor,
        ownerId: user.id,
      },
    });

    await prisma.configVersion.create({
      data: {
        appId: newApp.id,
        version: 1,
        configJson: (configJson || {
          app: { name, description },
          entities: [],
          pages: [],
          workflows: [],
        }) as any,
        changeLog: 'Initial app configuration',
      },
    });

    await createUserNotification({
      userId: user.id,
      type: 'app_created',
      title: `${name} was created`,
      message: 'Your app configuration has been saved and is ready to edit, deploy, export, or download.',
      appId: newApp.id,
      metadata: { appName: name, slug },
    });

    return { success: true, data: newApp };
  });

  // Update app config + redeploy
  app.put('/apps/:id/config', async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as any;
    const user = getRequestUser(request);

    let found = await prisma.app.findUnique({ where: { id } });
    if (!found) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'App not found' } });
    if (user.role !== 'admin' && found.ownerId !== user.id) {
      return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have access to this app' } });
    }

    found = await prisma.app.update({
      where: { id },
      data: {
        status: 'deploying',
        configVersion: { increment: 1 },
        configJson: body, // Store the updated config
      }
    });

    // Create a ConfigVersion history record
    await prisma.configVersion.create({
      data: {
        appId: id,
        version: found.configVersion,
        configJson: body || {},
        changeLog: 'Config updated via Studio API',
      }
    });

    // Simulate deploy
    setTimeout(async () => {
      try {
        await prisma.app.update({
          where: { id },
          data: { status: 'live', deployedAt: new Date() }
        });

        await createUserNotification({
          userId: found!.ownerId,
          type: 'deploy_success',
          title: `${found!.name} deployed`,
          message: 'The updated app configuration is live in the preview runtime.',
          appId: id,
          metadata: { version: found!.configVersion, source: 'config-update' },
        });
      } catch (err) {
        request.log.error({ err }, 'Failed to complete simulated app deployment');
      }
    }, 2000);

    return { success: true, data: found };
  });

  // Delete app
  app.delete('/apps/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = getRequestUser(request);
    const found = await prisma.app.findUnique({ where: { id } });
    if (!found) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'App not found' } });
    if (user.role !== 'admin' && found.ownerId !== user.id) {
      return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have access to this app' } });
    }
    
    await prisma.app.delete({ where: { id } });
    return { success: true, data: { message: 'App deleted' } };
  });

  // Download generated source as a zip.
  app.get('/apps/:id/export/download', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = getRequestUser(request);
    const found = await prisma.app.findUnique({ where: { id } });
    if (!found) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'App not found' } });
    if (user.role !== 'admin' && found.ownerId !== user.id) {
      return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have access to this app' } });
    }

    const config = exportConfigForApp(found);
    const files = generateStandaloneProject(config);
    const zip = new AdmZip();
    for (const file of files) {
      zip.addFile(file.path, Buffer.from(file.content, 'utf8'));
    }

    await createUserNotification({
      userId: found.ownerId,
      type: 'code_download',
      title: `${found.name} code export downloaded`,
      message: `MetaForge generated ${files.length} source files for download.`,
      appId: found.id,
      metadata: { fileCount: files.length },
    });

    const projectName = found.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'metaforge-app';
    return reply
      .header('Content-Type', 'application/zip')
      .header('Content-Disposition', `attachment; filename="${projectName}-source.zip"`)
      .send(zip.toBuffer());
  });

  // Trigger GitHub export
  app.post('/apps/:id/export', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = getRequestUser(request);
    const found = await prisma.app.findUnique({ where: { id } });
    if (!found) return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'App not found' } });
    if (user.role !== 'admin' && found.ownerId !== user.id) {
      return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have access to this app' } });
    }

    const config = exportConfigForApp(found);
    const files = generateStandaloneProject(config);
    const repository = `metaforge/${found.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'app'}`;

    await createUserNotification({
      userId: found.ownerId,
      type: 'github_export_ready',
      title: `${found.name} GitHub export is ready`,
      message: `MetaForge prepared ${files.length} files for a standalone GitHub repository.`,
      appId: found.id,
      metadata: {
        repository,
        fileCount: files.length,
        files: files.map(file => file.path),
      },
    });

    return {
      success: true,
      data: {
        message: 'GitHub export prepared',
        repository,
        fileCount: files.length,
        files: files.map(file => ({ path: file.path, size: file.content.length })),
        nextSteps: [
          'Download the source zip from the Code Export action.',
          'Create the GitHub repository, unzip the project, commit, and push.',
        ],
      },
    };
  });
}
