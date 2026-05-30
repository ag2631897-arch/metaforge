/**
 * MetaForge API Generator
 *
 * For each entity declared in config, generates:
 * - GET    /api/:tenant/:entity       — List all (paginated, filterable)
 * - GET    /api/:tenant/:entity/:id   — Get single record
 * - POST   /api/:tenant/:entity       — Create record
 * - PUT    /api/:tenant/:entity/:id   — Full update
 * - PATCH  /api/:tenant/:entity/:id   — Partial update
 * - DELETE /api/:tenant/:entity/:id   — Soft delete
 * - POST   /api/:tenant/:entity/bulk  — Bulk create/update
 * - GET    /api/:tenant/:entity/export — CSV export
 * - POST   /api/:tenant/:entity/import — CSV import
 */
// ─── Field Validator ─────────────────────────────────────────────
function validateField(value, field) {
    if (field.required && (value === undefined || value === null || value === '')) {
        return `${field.name} is required`;
    }
    if (value === undefined || value === null)
        return null;
    switch (field.type) {
        case 'string':
        case 'text':
            if (typeof value !== 'string')
                return `${field.name} must be a string`;
            if (field.minLength && value.length < field.minLength)
                return `${field.name} must be at least ${field.minLength} characters`;
            if (field.maxLength && value.length > field.maxLength)
                return `${field.name} must be at most ${field.maxLength} characters`;
            break;
        case 'number':
        case 'currency':
            if (typeof value !== 'number')
                return `${field.name} must be a number`;
            if (field.min !== undefined && value < field.min)
                return `${field.name} must be >= ${field.min}`;
            if (field.max !== undefined && value > field.max)
                return `${field.name} must be <= ${field.max}`;
            break;
        case 'boolean':
            if (typeof value !== 'boolean')
                return `${field.name} must be a boolean`;
            break;
        case 'email':
            if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                return `${field.name} must be a valid email`;
            break;
        case 'enum':
            if (field.enumValues && !field.enumValues.includes(value))
                return `${field.name} must be one of: ${field.enumValues.join(', ')}`;
            break;
        case 'date':
            if (isNaN(Date.parse(value)))
                return `${field.name} must be a valid date`;
            break;
        case 'url':
            try {
                new URL(value);
            }
            catch {
                return `${field.name} must be a valid URL`;
            }
            break;
    }
    return null;
}
function validateRecord(data, fields) {
    const errors = [];
    for (const field of fields) {
        const error = validateField(data[field.name], field);
        if (error)
            errors.push(error);
    }
    // Strip unknown fields
    const knownFields = new Set(fields.map(f => f.name));
    for (const key of Object.keys(data)) {
        if (!knownFields.has(key) && key !== 'id') {
            delete data[key];
        }
    }
    return { valid: errors.length === 0, errors };
}
// ─── In-Memory Data Store (dev mode) ─────────────────────────────
const dataStore = {};
function getStore(tenantId, entity) {
    const key = `${tenantId}:${entity}`;
    if (!dataStore[key])
        dataStore[key] = [];
    return dataStore[key];
}
// ─── Route Generator ─────────────────────────────────────────────
export function generateEntityRoutes(app, entity, tenantId = 'default') {
    const prefix = `/api/${tenantId}/${entity.name}`;
    // LIST — GET /api/:tenant/:entity
    app.get(prefix, async (request) => {
        const query = request.query;
        const page = parseInt(query.page || '1', 10);
        const limit = Math.min(parseInt(query.limit || '20', 10), 100);
        const sortField = query.sort || 'createdAt';
        const sortDir = query.dir === 'asc' ? 1 : -1;
        let records = [...getStore(tenantId, entity.name)];
        // Filter by query params
        for (const field of entity.fields) {
            if (query[field.name] !== undefined) {
                records = records.filter(r => String(r[field.name]) === String(query[field.name]));
            }
        }
        // Search
        if (query.search) {
            const search = query.search.toLowerCase();
            records = records.filter(r => entity.fields.some(f => String(r[f.name] || '').toLowerCase().includes(search)));
        }
        // Sort
        records.sort((a, b) => {
            const aVal = a[sortField] ?? '';
            const bVal = b[sortField] ?? '';
            return aVal < bVal ? -sortDir : aVal > bVal ? sortDir : 0;
        });
        // Filter soft-deleted
        if (entity.softDelete) {
            records = records.filter(r => !r.deletedAt);
        }
        const total = records.length;
        const paged = records.slice((page - 1) * limit, page * limit);
        return {
            success: true,
            data: paged,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    });
    // GET ONE — GET /api/:tenant/:entity/:id
    app.get(`${prefix}/:id`, async (request, reply) => {
        const { id } = request.params;
        const record = getStore(tenantId, entity.name).find(r => r.id === id && !r.deletedAt);
        if (!record)
            return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: `${entity.label || entity.name} not found` } });
        return { success: true, data: record };
    });
    // CREATE — POST /api/:tenant/:entity
    app.post(prefix, async (request, reply) => {
        const body = request.body;
        const { valid, errors } = validateRecord(body, entity.fields);
        if (!valid)
            return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: errors } });
        const record = {
            id: crypto.randomUUID(),
            ...body,
            ...(entity.timestamps !== false ? { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : {}),
        };
        getStore(tenantId, entity.name).push(record);
        return reply.status(201).send({ success: true, data: record });
    });
    // UPDATE — PUT /api/:tenant/:entity/:id
    app.put(`${prefix}/:id`, async (request, reply) => {
        const { id } = request.params;
        const store = getStore(tenantId, entity.name);
        const index = store.findIndex(r => r.id === id && !r.deletedAt);
        if (index === -1)
            return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
        const body = request.body;
        const { valid, errors } = validateRecord(body, entity.fields);
        if (!valid)
            return reply.status(400).send({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: errors } });
        store[index] = { ...store[index], ...body, updatedAt: new Date().toISOString() };
        return { success: true, data: store[index] };
    });
    // PATCH — PATCH /api/:tenant/:entity/:id
    app.patch(`${prefix}/:id`, async (request, reply) => {
        const { id } = request.params;
        const store = getStore(tenantId, entity.name);
        const index = store.findIndex(r => r.id === id && !r.deletedAt);
        if (index === -1)
            return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
        const body = request.body;
        store[index] = { ...store[index], ...body, updatedAt: new Date().toISOString() };
        return { success: true, data: store[index] };
    });
    // DELETE — DELETE /api/:tenant/:entity/:id
    app.delete(`${prefix}/:id`, async (request, reply) => {
        const { id } = request.params;
        const store = getStore(tenantId, entity.name);
        const index = store.findIndex(r => r.id === id);
        if (index === -1)
            return reply.status(404).send({ success: false, error: { code: 'NOT_FOUND', message: 'Record not found' } });
        if (entity.softDelete) {
            store[index].deletedAt = new Date().toISOString();
        }
        else {
            store.splice(index, 1);
        }
        return { success: true, data: { message: 'Deleted' } };
    });
    // BULK — POST /api/:tenant/:entity/bulk
    app.post(`${prefix}/bulk`, async (request, reply) => {
        const body = request.body;
        if (!Array.isArray(body.records))
            return reply.status(400).send({ success: false, error: { code: 'INVALID_BODY', message: 'body.records must be an array' } });
        const results = { created: 0, errors: [] };
        for (const record of body.records) {
            const { valid, errors } = validateRecord(record, entity.fields);
            if (valid) {
                getStore(tenantId, entity.name).push({
                    id: crypto.randomUUID(),
                    ...record,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                });
                results.created++;
            }
            else {
                results.errors.push(...errors);
            }
        }
        return { success: true, data: results };
    });
    // EXPORT — GET /api/:tenant/:entity/export
    app.get(`${prefix}/export`, async (request, reply) => {
        const records = getStore(tenantId, entity.name).filter(r => !r.deletedAt);
        const headers = entity.fields.map(f => f.name);
        const csvLines = [headers.join(',')];
        for (const record of records) {
            csvLines.push(headers.map(h => JSON.stringify(record[h] ?? '')).join(','));
        }
        reply.header('Content-Type', 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="${entity.name}.csv"`);
        return csvLines.join('\n');
    });
}
// ─── Generate all entity routes from config ──────────────────────
export function generateAllEntityRoutes(app, entities, tenantId = 'default') {
    for (const entity of entities) {
        generateEntityRoutes(app, entity, tenantId);
    }
}
//# sourceMappingURL=api.js.map