/**
 * Export Route — Generates a standalone Next.js project from config
 */

import { FastifyInstance } from 'fastify';
import AdmZip from 'adm-zip';
import { generateStandaloneProject } from '../generators/github-export.js';

export async function exportRoutes(app: FastifyInstance) {

  // POST /api/v1/export — Generate standalone project
  app.post('/export', async (request, reply) => {
    const config = request.body as any;

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
    const config = request.body as any;

    if (!config?.app?.name) {
      return reply.status(400).send({
        success: false,
        error: { code: 'MISSING_CONFIG', message: 'config.app.name is required' },
      });
    }

    const files = generateStandaloneProject(config);

    const zip = new AdmZip();
    for (const file of files) {
      zip.addFile(file.path, Buffer.from(file.content, 'utf8'));
    }

    const zipBuffer = zip.toBuffer();
    const projectName = config.app.name.toLowerCase().replace(/\s+/g, '-');

    reply
      .header('Content-Type', 'application/zip')
      .header('Content-Disposition', `attachment; filename="${projectName}-export.zip"`)
      .send(zipBuffer);
  });
}
