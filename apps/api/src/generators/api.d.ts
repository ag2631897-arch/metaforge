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
import { FastifyInstance } from 'fastify';
interface FieldConfig {
    name: string;
    type: string;
    required?: boolean;
    unique?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    enumValues?: string[];
}
interface EntityConfig {
    name: string;
    label?: string;
    fields: FieldConfig[];
    timestamps?: boolean;
    softDelete?: boolean;
}
export declare function generateEntityRoutes(app: FastifyInstance, entity: EntityConfig, tenantId?: string): void;
export declare function generateAllEntityRoutes(app: FastifyInstance, entities: EntityConfig[], tenantId?: string): void;
export {};
//# sourceMappingURL=api.d.ts.map