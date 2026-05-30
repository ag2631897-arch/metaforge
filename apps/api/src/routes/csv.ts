/**
 * CSV Import/Export Routes
 * 
 * Handles CSV file import into entity data and export from entity data.
 * Supports bulk operations with validation and error reporting.
 */

import { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { prisma } from '../lib/prisma.js';
import { getRequestUser } from '../lib/auth.js';
import { createUserNotification } from '../lib/notifications.js';

// ─── CSV Parser ──────────────────────────────────────────────────
function parseCSV(raw: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = raw.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j] || '';
    }
    rows.push(row);
  }

  return { headers, rows };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}

// ─── CSV Serializer ──────────────────────────────────────────────
function toCSV(headers: string[], rows: Record<string, any>[]): string {
  const escape = (value: any) => {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.map(escape).join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(',')),
  ];
  return lines.join('\n');
}

// ─── Type Coercion ───────────────────────────────────────────────
function coerceValue(value: string, fieldType: string): any {
  if (!value && value !== '0') return null;

  switch (fieldType) {
    case 'number':
    case 'float':
    case 'currency':
      return parseFloat(value) || 0;
    case 'boolean':
      return ['true', '1', 'yes'].includes(value.toLowerCase());
    case 'date':
      return new Date(value).toISOString();
    default:
      return value;
  }
}

export async function csvRoutes(app: FastifyInstance) {
  // Register multipart for file uploads
  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  // POST /api/v1/apps/:appId/import/csv — Import CSV data into an entity
  app.post('/apps/:appId/import/csv', async (request, reply) => {
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
        error: { code: 'FORBIDDEN', message: 'You do not have access to this app' },
      });
    }

    let fileBuffer: Buffer | null = null;
    let entityName: string = '';
    let fileName: string = '';

    const data = await request.file();
    if (!data) {
      return reply.status(400).send({
        success: false,
        error: { code: 'NO_FILE', message: 'A CSV file is required' },
      });
    }

    fileBuffer = await data.toBuffer();
    fileName = data.filename || 'import.csv';

    // Get entity from the query string or from form field name
    const query = request.query as { entity?: string };
    entityName = query.entity || data.fieldname || '';

    if (!entityName) {
      return reply.status(400).send({
        success: false,
        error: { code: 'MISSING_ENTITY', message: 'Specify entity name via ?entity=<name> query parameter' },
      });
    }

    const csvText = fileBuffer.toString('utf-8');
    const { headers, rows } = parseCSV(csvText);

    if (headers.length === 0 || rows.length === 0) {
      return reply.status(400).send({
        success: false,
        error: { code: 'EMPTY_CSV', message: 'CSV file has no data rows' },
      });
    }

    // Match headers against entity fields
    const config = found.configJson as any;
    const entity = (config?.entities || []).find((e: any) => e.name === entityName);
    const entityFields = entity?.fields || [];
    const fieldMap = new Map(entityFields.map((f: any) => [f.name, f.type || 'string']));

    const validationErrors: Array<{ row: number; field: string; message: string }> = [];
    const importedRows: Record<string, any>[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const record: Record<string, any> = {};
      let hasError = false;

      for (const header of headers) {
        const type = (fieldMap.get(header) as string) || 'string';
        try {
          record[header] = coerceValue(row[header], type as string);
        } catch {
          validationErrors.push({ row: i + 2, field: header, message: `Invalid ${type} value` });
          hasError = true;
        }
      }

      if (!hasError) {
        importedRows.push(record);
      }
    }

    // Notify user of import result
    await createUserNotification({
      userId: found.ownerId,
      type: 'csv_import',
      title: `CSV imported into ${entityName}`,
      message: `${importedRows.length} records imported from "${fileName}". ${validationErrors.length} validation errors.`,
      appId: found.id,
      metadata: {
        entity: entityName,
        fileName,
        totalRows: rows.length,
        importedCount: importedRows.length,
        errorCount: validationErrors.length,
      },
    });

    return {
      success: true,
      data: {
        entity: entityName,
        fileName,
        headers,
        totalRows: rows.length,
        importedCount: importedRows.length,
        records: importedRows,
        validationErrors: validationErrors.slice(0, 50),
      },
    };
  });

  // POST /api/v1/apps/:appId/export/csv — Export entity data as CSV
  app.post('/apps/:appId/export/csv', async (request, reply) => {
    const { appId } = request.params as { appId: string };
    const body = request.body as { entity: string; records?: any[] };
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
        error: { code: 'FORBIDDEN', message: 'You do not have access to this app' },
      });
    }

    if (!body.entity) {
      return reply.status(400).send({
        success: false,
        error: { code: 'MISSING_ENTITY', message: 'Entity name is required' },
      });
    }

    const config = found.configJson as any;
    const entity = (config?.entities || []).find((e: any) => e.name === body.entity);
    const fields = entity?.fields || [];
    const headers = fields.map((f: any) => f.name);
    const records = body.records || [];

    const csv = toCSV(headers.length ? headers : Object.keys(records[0] || {}), records);

    await createUserNotification({
      userId: found.ownerId,
      type: 'csv_export',
      title: `${body.entity} exported as CSV`,
      message: `Exported ${records.length} records from ${body.entity}.`,
      appId: found.id,
      metadata: { entity: body.entity, recordCount: records.length },
    });

    reply
      .header('Content-Type', 'text/csv')
      .header('Content-Disposition', `attachment; filename="${body.entity}-export.csv"`)
      .send(csv);
  });

  // POST /api/v1/csv/parse — Parse CSV text without importing (preview)
  app.post('/csv/parse', async (request) => {
    const { csv, entity } = request.body as { csv?: string; entity?: string };
    if (!csv) {
      return { success: false, error: { code: 'NO_CSV', message: 'CSV text is required' } };
    }

    const { headers, rows } = parseCSV(csv);

    return {
      success: true,
      data: {
        entity: entity || 'unknown',
        headers,
        rowCount: rows.length,
        preview: rows.slice(0, 10),
      },
    };
  });
}
