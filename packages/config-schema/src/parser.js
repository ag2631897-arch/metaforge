/**
 * MetaForge Config Parser & Validator
 *
 * Multi-stage validation pipeline:
 * Stage 1: Schema Validation
 * Stage 2: Type Coercion
 * Stage 3: Unknown Component Detection
 * Stage 4: Dependency Resolution
 * Stage 5: Partial Manifest Extraction
 */
import { z } from 'zod';
import { MetaForgeConfigSchema, ComponentTypeSchema } from './schema';
// ─── Known Component Types ───────────────────────────────────────
const KNOWN_COMPONENT_TYPES = new Set(ComponentTypeSchema.options);
// ─── Stage 1: JSON Syntax Parse ─────────────────────────────────
function parseSyntax(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        return { parsed, issues: [] };
    }
    catch (err) {
        const match = err.message.match(/position (\d+)/);
        const position = match ? parseInt(match[1], 10) : 0;
        // Calculate line and column from position
        const lines = jsonString.substring(0, position).split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1]?.length || 0;
        return {
            parsed: null,
            issues: [{
                    severity: 'error',
                    path: '$',
                    message: `Malformed JSON: ${err.message}`,
                    code: 'SYNTAX_ERROR',
                    line,
                    column,
                    suggestion: 'Check for missing commas, brackets, or quotes near the indicated position.',
                }],
        };
    }
}
// ─── Stage 2: Schema Validation ─────────────────────────────────
function validateSchema(data) {
    const result = MetaForgeConfigSchema.safeParse(data);
    if (result.success) {
        return { config: result.data, issues: [] };
    }
    const issues = result.error.issues.map((issue) => {
        const path = issue.path.join('.');
        const isRequired = issue.code === 'invalid_type' && issue.received === 'undefined';
        return {
            severity: isRequired ? 'warning' : 'error',
            path: path || '$',
            message: issue.message,
            code: `SCHEMA_${issue.code.toUpperCase()}`,
            suggestion: isRequired
                ? `Field "${path}" is missing. A default value will be used.`
                : `Expected ${issue.expected || 'valid value'}, received ${issue.received || 'invalid value'}.`,
        };
    });
    // Attempt to extract partial config even if validation fails
    const partialResult = MetaForgeConfigSchema
        .partial()
        .extend({ app: z.object({ name: z.string().default('Untitled App') }).default({}) })
        .safeParse(data);
    return {
        config: partialResult.success ? partialResult.data : null,
        issues,
    };
}
// ─── Stage 3: Type Coercion ─────────────────────────────────────
function coerceTypes(data) {
    const issues = [];
    const coerced = JSON.parse(JSON.stringify(data)); // deep clone
    function coerceValue(value, expectedType, path) {
        if (value === null || value === undefined)
            return value;
        switch (expectedType) {
            case 'number':
                if (typeof value === 'string' && !isNaN(Number(value))) {
                    issues.push({
                        severity: 'warning',
                        path,
                        message: `Coerced string "${value}" to number ${Number(value)}`,
                        code: 'TYPE_COERCION',
                        suggestion: 'Use a numeric value instead of a string.',
                    });
                    return Number(value);
                }
                break;
            case 'boolean':
                if (value === 'true' || value === 'false') {
                    issues.push({
                        severity: 'warning',
                        path,
                        message: `Coerced string "${value}" to boolean ${value === 'true'}`,
                        code: 'TYPE_COERCION',
                        suggestion: 'Use true/false without quotes.',
                    });
                    return value === 'true';
                }
                break;
            case 'string':
                if (typeof value === 'number') {
                    issues.push({
                        severity: 'warning',
                        path,
                        message: `Coerced number ${value} to string "${String(value)}"`,
                        code: 'TYPE_COERCION',
                    });
                    return String(value);
                }
                break;
        }
        return value;
    }
    // Walk through entities and coerce field defaults
    if (Array.isArray(coerced.entities)) {
        coerced.entities.forEach((entity, ei) => {
            if (Array.isArray(entity.fields)) {
                entity.fields.forEach((field, fi) => {
                    if (field.default !== undefined) {
                        field.default = coerceValue(field.default, field.type, `entities[${ei}].fields[${fi}].default`);
                    }
                    // Coerce numeric constraints
                    if (field.min !== undefined) {
                        field.min = coerceValue(field.min, 'number', `entities[${ei}].fields[${fi}].min`);
                    }
                    if (field.max !== undefined) {
                        field.max = coerceValue(field.max, 'number', `entities[${ei}].fields[${fi}].max`);
                    }
                });
            }
        });
    }
    return { coerced, issues };
}
// ─── Stage 4: Unknown Component Detection ───────────────────────
function detectUnknownComponents(config) {
    const issues = [];
    let unknownCount = 0;
    function walkComponents(components, parentPath) {
        if (!Array.isArray(components))
            return;
        components.forEach((comp, index) => {
            const path = `${parentPath}[${index}]`;
            if (comp.type && !KNOWN_COMPONENT_TYPES.has(comp.type)) {
                unknownCount++;
                issues.push({
                    severity: 'info',
                    path: `${path}.type`,
                    message: `Unknown component type "${comp.type}". This component will be skipped.`,
                    code: 'UNKNOWN_COMPONENT',
                    suggestion: `Valid types: ${Array.from(KNOWN_COMPONENT_TYPES).slice(0, 10).join(', ')}...`,
                });
            }
            if (Array.isArray(comp.children)) {
                walkComponents(comp.children, `${path}.children`);
            }
        });
    }
    if (Array.isArray(config.pages)) {
        config.pages.forEach((page, pi) => {
            walkComponents(page.components || [], `pages[${pi}].components`);
        });
    }
    return { issues, unknownCount };
}
// ─── Stage 5: Dependency Resolution ─────────────────────────────
function resolveDependencies(config) {
    const issues = [];
    const entityNames = new Set((config.entities || []).map((e) => e.name));
    const roleNames = new Set((config.auth?.roles || []).map((r) => r.name));
    const pageNames = new Set((config.pages || []).map((p) => p.name));
    // Check entity relation targets
    (config.entities || []).forEach((entity, ei) => {
        (entity.relations || []).forEach((rel, ri) => {
            if (!entityNames.has(rel.target)) {
                issues.push({
                    severity: 'error',
                    path: `entities[${ei}].relations[${ri}].target`,
                    message: `Relation target "${rel.target}" not found in entities.`,
                    code: 'MISSING_DEPENDENCY',
                    suggestion: `Define an entity named "${rel.target}" or fix the reference.`,
                });
            }
        });
    });
    // Check component data sources reference valid entities
    function checkDataSources(components, parentPath) {
        if (!Array.isArray(components))
            return;
        components.forEach((comp, ci) => {
            if (comp.dataSource?.entity && !entityNames.has(comp.dataSource.entity)) {
                issues.push({
                    severity: 'warning',
                    path: `${parentPath}[${ci}].dataSource.entity`,
                    message: `Data source references unknown entity "${comp.dataSource.entity}".`,
                    code: 'MISSING_DEPENDENCY',
                    suggestion: `Define an entity named "${comp.dataSource.entity}".`,
                });
            }
            if (comp.children) {
                checkDataSources(comp.children, `${parentPath}[${ci}].children`);
            }
        });
    }
    (config.pages || []).forEach((page, pi) => {
        checkDataSources(page.components, `pages[${pi}].components`);
        // Check page role references
        (page.auth?.roles || []).forEach((role) => {
            if (!roleNames.has(role)) {
                issues.push({
                    severity: 'warning',
                    path: `pages[${pi}].auth.roles`,
                    message: `Page references unknown role "${role}".`,
                    code: 'MISSING_DEPENDENCY',
                    suggestion: `Define a role named "${role}" in auth.roles.`,
                });
            }
        });
    });
    // Check workflow entity references
    (config.workflows || []).forEach((wf, wi) => {
        if (wf.trigger?.entity && !entityNames.has(wf.trigger.entity)) {
            issues.push({
                severity: 'error',
                path: `workflows[${wi}].trigger.entity`,
                message: `Workflow trigger references unknown entity "${wf.trigger.entity}".`,
                code: 'MISSING_DEPENDENCY',
            });
        }
    });
    // Check navigation path references
    function checkNavPaths(items, parentPath) {
        if (!Array.isArray(items))
            return;
        items.forEach((item, i) => {
            if (item.roles) {
                item.roles.forEach((role) => {
                    if (!roleNames.has(role)) {
                        issues.push({
                            severity: 'info',
                            path: `${parentPath}[${i}].roles`,
                            message: `Nav item references unknown role "${role}".`,
                            code: 'MISSING_DEPENDENCY',
                        });
                    }
                });
            }
            if (item.children) {
                checkNavPaths(item.children, `${parentPath}[${i}].children`);
            }
        });
    }
    checkNavPaths(config.navigation?.items || [], 'navigation.items');
    return { issues };
}
// ─── Main Parser Pipeline ────────────────────────────────────────
export function parseConfig(jsonString) {
    const startTime = performance.now();
    const allIssues = [];
    let totalComponents = 0;
    let failedComponents = 0;
    // Stage 1: Syntax Parse
    const { parsed, issues: syntaxIssues } = parseSyntax(jsonString);
    allIssues.push(...syntaxIssues);
    if (!parsed) {
        return buildReport(allIssues, null, startTime, 0, 0);
    }
    // Stage 2: Type Coercion
    const { coerced, issues: coercionIssues } = coerceTypes(parsed);
    allIssues.push(...coercionIssues);
    // Stage 3: Schema Validation
    const { config, issues: schemaIssues } = validateSchema(coerced);
    allIssues.push(...schemaIssues);
    // Stage 4: Unknown Component Detection
    const { issues: unknownIssues, unknownCount } = detectUnknownComponents(coerced);
    allIssues.push(...unknownIssues);
    failedComponents += unknownCount;
    // Count total components
    function countComponents(components) {
        if (!Array.isArray(components))
            return 0;
        return components.reduce((sum, comp) => {
            return sum + 1 + countComponents(comp.children || []);
        }, 0);
    }
    (coerced.pages || []).forEach((page) => {
        totalComponents += countComponents(page.components || []);
    });
    // Stage 5: Dependency Resolution
    const { issues: depIssues } = resolveDependencies(coerced);
    allIssues.push(...depIssues);
    return buildReport(allIssues, config || coerced, startTime, totalComponents, failedComponents);
}
// ─── Parse from object (already parsed JSON) ────────────────────
export function parseConfigObject(data) {
    return parseConfig(JSON.stringify(data));
}
// ─── Build Report ────────────────────────────────────────────────
function buildReport(issues, config, startTime, totalComponents, failedComponents) {
    const errors = issues.filter(i => i.severity === 'error').length;
    const warnings = issues.filter(i => i.severity === 'warning').length;
    const infos = issues.filter(i => i.severity === 'info').length;
    return {
        valid: errors === 0,
        issues,
        stats: {
            errors,
            warnings,
            infos,
            totalComponents,
            validComponents: totalComponents - failedComponents,
            failedComponents,
        },
        partialConfig: config,
        processingTimeMs: Math.round((performance.now() - startTime) * 100) / 100,
    };
}
export { MetaForgeConfigSchema };
//# sourceMappingURL=parser.js.map