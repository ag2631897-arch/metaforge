/**
 * Notification management for the authenticated user.
 */

import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { getRequestUser } from '../lib/auth.js';
import { getEmailStatus } from '../lib/email.js';
import { createUserNotification } from '../lib/notifications.js';

export async function notificationRoutes(app: FastifyInstance) {
  // GET /api/v1/notifications
  app.get('/notifications', async (request) => {
    const query = request.query as { unreadOnly?: string; limit?: string };
    const limit = parseInt(query.limit || '20', 10);
    const user = getRequestUser(request);

    const where: any = { userId: user.id };
    if (query.unreadOnly === 'true') where.read = false;

    const [notifications, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({ where: { userId: user.id } }),
      prisma.notification.count({ where: { userId: user.id, read: false } }),
    ]);

    return {
      success: true,
      data: notifications,
      meta: { total, unread },
    };
  });

  // PUT /api/v1/notifications/:id/read
  app.put('/notifications/:id/read', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = getRequestUser(request);

    const existing = await prisma.notification.findFirst({ where: { id, userId: user.id } });
    if (!existing) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Notification not found' },
      });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return { success: true, data: notification };
  });

  // PUT /api/v1/notifications/read-all
  app.put('/notifications/read-all', async (request) => {
    const user = getRequestUser(request);
    const result = await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    return { success: true, data: { count: result.count } };
  });

  // DELETE /api/v1/notifications/:id
  app.delete('/notifications/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = getRequestUser(request);

    const existing = await prisma.notification.findFirst({ where: { id, userId: user.id } });
    if (!existing) {
      return reply.status(404).send({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Notification not found' },
      });
    }

    await prisma.notification.delete({ where: { id } });
    return { success: true, data: { message: 'Deleted' } };
  });

  // GET /api/v1/notifications/email-status
  app.get('/notifications/email-status', async () => ({
    success: true,
    data: getEmailStatus(),
  }));

  // POST /api/v1/notifications/test
  app.post('/notifications/test', async (request) => {
    const user = getRequestUser(request);

    const notification = await createUserNotification({
      userId: user.id,
      type: 'system',
      title: 'MetaForge notifications are enabled',
      message: 'This notification was created in-app and sent to your email when SMTP is configured.',
      metadata: { source: 'notification-test' },
    });

    return { success: true, data: notification };
  });

  // POST /api/v1/notifications
  app.post('/notifications', async (request, reply) => {
    const body = request.body as any;
    const user = getRequestUser(request);
    const targetUserId = user.role === 'admin' && body.userId ? body.userId : user.id;

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      return reply.status(404).send({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Notification recipient not found' },
      });
    }

    const notification = await createUserNotification({
      userId: targetUserId,
      type: body.type || 'system',
      title: body.title || 'Notification',
      message: body.message || '',
      appId: body.appId,
      metadata: body.metadata,
      email: {
        enabled: body.email !== false,
        to: user.role === 'admin' ? body.emailTo : undefined,
        subject: body.emailSubject,
      },
    });

    return { success: true, data: notification };
  });
}
