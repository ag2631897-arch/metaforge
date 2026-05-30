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
import { MetaForgeConfigSchema, type MetaForgeConfig, ComponentTypeSchema } from './schema';

// ─── Validation Types ────────────────────────────────────────────
export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  severity: ValidationSeverity;
  path: string;
  message: string;
  code: string;
  line?: number;
  column?: number;
  suggestion?: string;
}

export interface ValidationReport {
  valid: boolean;
  issues: ValidationIssue[];
  stats: {
    errors: number;
    warnings: number;
    infos: number;
    totalComponents: number;
    validComponents: number;
    failedComponents: number;
  };
  partialConfig: MetaForgeConfig | null;
  processingTimeMs: number;
}

// ─── Known Component Types ───────────────────────────────────────
const KNOWN_COMPONENT_TYPES = new Set(ComponentTypeSchema.options);

// ─── Stage 1: JSON Syntax Parse ─────────────────────────────────
function parseSyntax(jsonString: string): {
  parsed: any | null;
  issues: ValidationIssue[];
} {
  try {
    const parsed = JSON.parse(jsonString);
    return { parsed, issues: [] };
  } catch (err: any) {
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
function validateSchema(data: any): {
  config: MetaForgeConfig | null;
  issues: ValidationIssue[];
} {
  const result = MetaForgeConfigSchema.safeParse(data);
  
  if (result.success) {
    return { config: result.data, issues: [] };
  }

  const issues: ValidationIssue[] = result.error.issues.map((issue) => {
    const path = issue.path.join('.');
    const isRequired = issue.code === 'invalid_type' && issue.received === 'undefined';
    
    return {
      severity: isRequired ? 'warning' as const : 'error' as const,
      path: path || '$',
      message: issue.message,
      code: `SCHEMA_${issue.code.toUpperCase()}`,
      suggestion: isRequired
        ? `Field "${path}" is missing. A default value will be used.`
        : `Expected ${(issue as any).expected || 'valid value'}, received ${(issue as any).received || 'invalid value'}.`,
    };
  });

  // Attempt to extract partial config even if validation fails
  const partialResult = MetaForgeConfigSchema
    .partial()
    .extend({ app: z.object({ name: z.string().default('Untitled App') }).default({}) })
    .safeParse(data);

  return {
    config: partialResult.success ? (partialResult.data as any) : null,
    issues,
  };
}

// ─── Stage 3: Type Coercion ─────────────────────────────────────
function coerceTypes(data: any): {
  coerced: any;
  issues: ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];
  const coerced = JSON.parse(JSON.stringify(data)); // deep clone

  function coerceValue(value: any, expectedType: string, path: string): any {
    if (value === null || value === undefined) return value;

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
    coerced.entities.forEach((entity: any, ei: number) => {
      if (Array.isArray(entity.fields)) {
        entity.fields.forEach((field: any, fi: number) => {
          if (field.default !== undefined) {
            field.default = coerceValue(
              field.default,
              field.type,
              `entities[${ei}].fields[${fi}].default`
            );
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
function detectUnknownComponents(config: any): {
  issues: ValidationIssue[];
  unknownCount: number;
} {
  const issues: ValidationIssue[] = [];
  let unknownCount = 0;

  function walkComponents(components: any[], parentPath: string) {
    if (!Array.isArray(components)) return;
    
    components.forEach((comp: any, index: number) => {
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
    config.pages.forEach((page: any, pi: number) => {
      walkComponents(page.components || [], `pages[${pi}].components`);
    });
  }

  return { issues, unknownCount };
}

// ─── Stage 5: Dependency Resolution ─────────────────────────────
function resolveDependencies(config: any): {
  issues: ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];
  const entityNames = new Set(
    (config.entities || []).map((e: any) => e.name)
  );
  const roleNames = new Set(
    (config.auth?.roles || []).map((r: any) => r.name)
  );
  const pageNames = new Set(
    (config.pages || []).map((p: any) => p.name)
  );

  // Check entity relation targets
  (config.entities || []).forEach((entity: any, ei: number) => {
    (entity.relations || []).forEach((rel: any, ri: number) => {
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
  function checkDataSources(components: any[], parentPath: string) {
    if (!Array.isArray(components)) return;
    components.forEach((comp: any, ci: number) => {
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

  (config.pages || []).forEach((page: any, pi: number) => {
    checkDataSources(page.components, `pages[${pi}].components`);

    // Check page role references
    (page.auth?.roles || []).forEach((role: string) => {
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
  (config.workflows || []).forEach((wf: any, wi: number) => {
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
  function checkNavPaths(items: any[], parentPath: string) {
    if (!Array.isArray(items)) return;
    items.forEach((item: any, i: number) => {
      if (item.roles) {
        item.roles.forEach((role: string) => {
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
export function parseConfig(jsonString: string): ValidationReport {
  const startTime = performance.now();
  const allIssues: ValidationIssue[] = [];
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
  function countComponents(components: any[]): number {
    if (!Array.isArray(components)) return 0;
    return components.reduce((sum: number, comp: any) => {
      return sum + 1 + countComponents(comp.children || []);
    }, 0);
  }

  (coerced.pages || []).forEach((page: any) => {
    totalComponents += countComponents(page.components || []);
  });

  // Stage 5: Dependency Resolution
  const { issues: depIssues } = resolveDependencies(coerced);
  allIssues.push(...depIssues);

  return buildReport(
    allIssues,
    config || (coerced as MetaForgeConfig),
    startTime,
    totalComponents,
    failedComponents
  );
}

// ─── Parse from object (already parsed JSON) ────────────────────
export function parseConfigObject(data: any): ValidationReport {
  return parseConfig(JSON.stringify(data));
}

// ─── Build Report ────────────────────────────────────────────────
function buildReport(
  issues: ValidationIssue[],
  config: MetaForgeConfig | null,
  startTime: number,
  totalComponents: number,
  failedComponents: number
): ValidationReport {
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
