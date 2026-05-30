/**
 * Export Route — Generates a standalone Next.js project from config
 */
import { generateStandaloneProject } from '../generators/github-export.js';
export async function exportRoutes(app) {
    // POST /api/v1/export — Generate standalone project
    app.post('/export', async (request, reply) => {
        const config = request.body;
        if (!config?.app?.name) {
            return reply.status(400).send({
                success: false,
                error: { code: 'MISSING_CONFIG', message: 'config.app.name is required' },
            });
        }
        const files = generateStandaloneProject(config);
        return {
            success: true,
            data: {
                projectName: config.app.name.toLowerCase().replace(/\s+/g, '-'),
                fileCount: files.length,
                files: files.map(f => ({ path: f.path, size: f.content.length })),
                contents: files,
            },
        };
    });
    // POST /api/v1/export/download — Generate as zip (placeholder)
    app.post('/export/download', async (request, reply) => {
        const config = request.body;
        if (!config?.app?.name) {
            return reply.status(400).send({
                success: false,
                error: { code: 'MISSING_CONFIG', message: 'config.app.name is required' },
            });
        }
        const files = generateStandaloneProject(config);
        // In production: use archiver to create a .zip
        reply.header('Content-Type', 'application/json');
        return {
            success: true,
            data: {
                message: 'ZIP download would be generated here in production',
                fileCount: files.length,
                estimatedSize: files.reduce((sum, f) => sum + f.content.length, 0),
            },
        };
    });
}
//# sourceMappingURL=export.js.map