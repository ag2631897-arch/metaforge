/**
 * Notification management for the authenticated user.
 */
import { prisma } from '../lib/prisma.js';
import { getRequestUser } from '../lib/auth.js';
export async function notificationRoutes(app) {
    // GET /api/v1/notifications
    app.get('/notifications', async (request) => {
        const query = request.query;
        const limit = parseInt(query.limit || '20', 10);
        const user = getRequestUser(request);
        const where = { userId: user.id };
        if (query.unreadOnly === 'true')
            where.read = false;
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
        const { id } = request.params;
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
        const { id } = request.params;
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
    // POST /api/v1/notifications
    app.post('/notifications', async (request) => {
        const body = request.body;
        const user = getRequestUser(request);
        const notification = await prisma.notification.create({
            data: {
                type: body.type || 'system',
                title: body.title || 'Notification',
                message: body.message || '',
                userId: user.role === 'admin' && body.userId ? body.userId : user.id,
                appId: body.appId,
                metadata: body.metadata,
            },
        });
        return { success: true, data: notification };
    });
}
//# sourceMappingURL=notifications.js.map