/**
 * Apps Routes — CRUD for MetaForge apps
 */
import { prisma } from '../lib/prisma.js';
import { getRequestUser } from '../lib/auth.js';
export async function appsRoutes(app) {
    // List all apps
    app.get('/apps', async (request) => {
        const user = getRequestUser(request);
        const apps = await prisma.app.findMany({
            where: user.role === 'admin' ? undefined : { ownerId: user.id },
            orderBy: { updatedAt: 'desc' },
            include: { owner: true }
        });
        return {
            success: true,
            data: apps,
            meta: { total: apps.length },
        };
    });
    // Get single app
    app.get('/apps/:id', async (request, reply) => {
        const { id } = request.params;
        const user = getRequestUser(request);
        const found = await prisma.app.findUnique({
            where: { id },
            include: { owner: true }
        });
        if (!found)
            return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'App not found' } });
        if (user.role !== 'admin' && found.ownerId !== user.id) {
            return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have access to this app' } });
        }
        return { success: true, data: found };
    });
    // Create app
    app.post('/apps', async (request) => {
        const body = request.body;
        const user = getRequestUser(request);
        const name = body.app?.name || body.name || 'Untitled App';
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);
        const newApp = await prisma.app.create({
            data: {
                name,
                description: body.app?.description || body.description,
                slug,
                status: 'deploying',
                configVersion: 1,
                ownerId: user.id,
            },
        });
        // Simulate deploy
        setTimeout(async () => {
            await prisma.app.update({
                where: { id: newApp.id },
                data: {
                    status: 'live',
                    liveUrl: `https://${slug}.metaforge.app`,
                    deployedAt: new Date(),
                }
            });
        }, 2000);
        return { success: true, data: newApp };
    });
    // Update app config + redeploy
    app.put('/apps/:id/config', async (request, reply) => {
        const { id } = request.params;
        const body = request.body;
        const user = getRequestUser(request);
        let found = await prisma.app.findUnique({ where: { id } });
        if (!found)
            return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'App not found' } });
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
            await prisma.app.update({
                where: { id },
                data: { status: 'live', deployedAt: new Date() }
            });
        }, 2000);
        return { success: true, data: found };
    });
    // Delete app
    app.delete('/apps/:id', async (request, reply) => {
        const { id } = request.params;
        const user = getRequestUser(request);
        const found = await prisma.app.findUnique({ where: { id } });
        if (!found)
            return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'App not found' } });
        if (user.role !== 'admin' && found.ownerId !== user.id) {
            return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have access to this app' } });
        }
        await prisma.app.delete({ where: { id } });
        return { success: true, data: { message: 'App deleted' } };
    });
    // Trigger GitHub export
    app.post('/apps/:id/export', async (request, reply) => {
        const { id } = request.params;
        const user = getRequestUser(request);
        const found = await prisma.app.findUnique({ where: { id } });
        if (!found)
            return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'App not found' } });
        if (user.role !== 'admin' && found.ownerId !== user.id) {
            return reply.status(403).send({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have access to this app' } });
        }
        return {
            success: true,
            data: {
                message: 'Export initiated',
                repository: `metaforge/${found.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
                estimatedTime: '10s',
            },
        };
    });
}
//# sourceMappingURL=apps.js.map