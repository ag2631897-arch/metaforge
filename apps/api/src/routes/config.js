/**
 * Config Routes — Handles JSON config validation and parsing
 */
// In-memory store for demo purposes
const configStore = new Map();
export async function configRoutes(app) {
    // Validate a config without deploying
    app.post('/config/validate', async (request, reply) => {
        const body = request.body;
        if (!body || typeof body !== 'object') {
            return reply.status(400).send({
                success: false,
                error: { code: 'INVALID_BODY', message: 'Request body must be a JSON object' },
            });
        }
        const issues = [];
        let isValid = true;
        // Stage 1: Check basic structure
        if (!body.app?.name) {
            issues.push({ severity: 'warning', path: 'app.name', message: 'App name is missing', code: 'MISSING_FIELD' });
        }
        if (!body.entities || !Array.isArray(body.entities)) {
            issues.push({ severity: 'info', path: 'entities', message: 'No entities defined', code: 'EMPTY_ENTITIES' });
        }
        else {
            body.entities.forEach((entity, i) => {
                if (!entity.name) {
                    issues.push({ severity: 'error', path: `entities[${i}].name`, message: 'Entity name is required', code: 'MISSING_FIELD' });
                    isValid = false;
                }
                if (!entity.fields || entity.fields.length === 0) {
                    issues.push({ severity: 'warning', path: `entities[${i}].fields`, message: `Entity "${entity.name || i}" has no fields`, code: 'EMPTY_FIELDS' });
                }
            });
        }
        if (!body.pages || !Array.isArray(body.pages) || body.pages.length === 0) {
            issues.push({ severity: 'warning', path: 'pages', message: 'No pages defined', code: 'EMPTY_PAGES' });
        }
        return {
            success: true,
            data: {
                valid: isValid,
                issues,
                stats: {
                    errors: issues.filter((i) => i.severity === 'error').length,
                    warnings: issues.filter((i) => i.severity === 'warning').length,
                    infos: issues.filter((i) => i.severity === 'info').length,
                    entities: body.entities?.length || 0,
                    pages: body.pages?.length || 0,
                },
            },
        };
    });
    // Get config for an app
    app.get('/apps/:appId/config', async (request) => {
        const { appId } = request.params;
        const stored = configStore.get(appId);
        if (!stored) {
            return { success: true, data: null };
        }
        return { success: true, data: stored };
    });
    // Update config for an app
    app.put('/apps/:appId/config', async (request) => {
        const { appId } = request.params;
        const config = request.body;
        configStore.set(appId, {
            config,
            validationReport: null,
            updatedAt: new Date().toISOString(),
        });
        return { success: true, data: { message: 'Config updated', appId } };
    });
}
//# sourceMappingURL=config.js.map