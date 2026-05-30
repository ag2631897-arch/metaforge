/**
 * MetaForge Database Schema Generator
 *
 * Generates Prisma schema from MetaForge entity config.
 * Maps config field types to PostgreSQL column types.
 */
interface EntityConfig {
    name: string;
    label?: string;
    fields: FieldConfig[];
    relations?: RelationConfig[];
    timestamps?: boolean;
    softDelete?: boolean;
    audit?: boolean;
}
interface FieldConfig {
    name: string;
    type: string;
    required?: boolean;
    unique?: boolean;
    default?: any;
    enumValues?: string[];
}
interface RelationConfig {
    name: string;
    type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
    target: string;
    foreignKey?: string;
    onDelete?: string;
    onUpdate?: string;
}
export declare function generatePrismaSchema(entities: EntityConfig[], tenantAware?: boolean): string;
export declare function generateMigrationSQL(entities: EntityConfig[], tenantAware?: boolean): string;
export {};
//# sourceMappingURL=database.d.ts.map