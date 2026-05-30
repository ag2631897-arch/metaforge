/**
 * Deploy History Routes — Deploy records and stage logs
 */
import { prisma } from '../lib/prisma.js';
import { getRequestUser } from '../lib/auth.js';
export async function deployHistoryRoutes(app) {
    // GET /api/v1/deploys?appId=xxx — List deploys for an app
    app.get('/deploys', async (request) => {
        const { appId, limit } = request.query;
        const user = getRequestUser(request);
        const where = {};
        if (appId)
            where.appId = appId;
        if (user.role !== 'admin')
            where.app = { ownerId: user.id };
        const deploys = await prisma.deploy.findMany({
            where,
            orderBy: { startedAt: 'desc' },
            take: parseInt(limit || '20', 10),
            include: {
                app: { select: { name: true, slug: true } },
                user: { select: { name: true, email: true } },
            },
        });
        return {
            success: true,
            data: deploys,
            meta: { total: deploys.length },
        };
    });
    // GET /api/v1/deploys/:id — Get single deploy with stages
    app.get('/deploys/:id', async (request, reply) => {
        const { id } = request.params;
        const user = getRequestUser(request);
        const deploy = await prisma.deploy.findUnique({
            where: { id },
            include: {
                app: { select: { name: true, slug: true, configVersion: true } },
                user: { select: { name: true, email: true } },
            },
        });
        if (!deploy) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Deploy not found' },
            });
        }
        if (user.role !== 'admin' && deploy.triggeredBy !== user.id) {
            return reply.status(403).send({
                success: false,
                error: { code: 'FORBIDDEN', message: 'You do not have access to this deploy' },
            });
        }
        return { success: true, data: deploy };
    });
    // POST /api/v1/deploys/:id/rollback — Rollback to a specific deploy
    app.post('/deploys/:id/rollback', async (request, reply) => {
        const { id } = request.params;
        const user = getRequestUser(request);
        const deploy = await prisma.deploy.findUnique({
            where: { id },
            include: { app: true },
        });
        if (!deploy) {
            return reply.status(404).send({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Deploy not found' },
            });
        }
        if (user.role !== 'admin' && deploy.app.ownerId !== user.id) {
            return reply.status(403).send({
                success: false,
                error: { code: 'FORBIDDEN', message: 'You do not have access to this app' },
            });
        }
        // Mark current live deploy as rolled-back
        await prisma.deploy.updateMany({
            where: { appId: deploy.appId, status: 'live' },
            data: { status: 'rolled-back' },
        });
        // Mark target deploy as live again
        await prisma.deploy.update({
            where: { id },
            data: { status: 'live' },
        });
        // Update app status
        await prisma.app.update({
            where: { id: deploy.appId },
            data: {
                status: 'live',
                configVersion: deploy.version,
                deployedAt: new Date(),
            },
        });
        return {
            success: true,
            data: { message: `Rolled back to v${deploy.version}`, deployId: id },
        };
    });
    // GET /api/v1/deploys/stats — Platform deploy stats
    app.get('/deploys/stats', async (request) => {
        const user = getRequestUser(request);
        const where = user.role === 'admin' ? {} : { app: { ownerId: user.id } };
        const [total, successful, failed, avgDuration] = await Promise.all([
            prisma.deploy.count({ where }),
            prisma.deploy.count({ where: { ...where, status: 'live' } }),
            prisma.deploy.count({ where: { ...where, status: 'failed' } }),
            prisma.deploy.aggregate({ where, _avg: { duration: true } }),
        ]);
        return {
            success: true,
            data: {
                total,
                successful,
                failed,
                avgDurationMs: Math.round(avgDuration._avg.duration || 0),
                successRate: total > 0 ? Math.round((successful / total) * 100) : 0,
            },
        };
    });
}
//# sourceMappingURL=deploy-history.js.map