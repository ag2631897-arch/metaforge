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
import { MetaForgeConfigSchema, type MetaForgeConfig } from './schema';
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
export declare function parseConfig(jsonString: string): ValidationReport;
export declare function parseConfigObject(data: any): ValidationReport;
export { MetaForgeConfigSchema };
//# sourceMappingURL=parser.d.ts.map