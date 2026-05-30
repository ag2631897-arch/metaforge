/**
 * MetaForge Config Schema (MCS)
 * 
 * This is the comprehensive Zod schema that defines the structure
 * of a MetaForge application manifest. Every JSON config uploaded
 * to MetaForge is validated against this schema.
 */

import { z } from 'zod';

// ─── Primitive Field Types ────────────────────────────────────────
export const FieldTypeSchema = z.enum([
  'string', 'text', 'number', 'boolean', 'date', 'email',
  'uuid', 'json', 'enum', 'url', 'phone', 'password',
  'color', 'file', 'image', 'currency'
]);

// ─── Field Definition ─────────────────────────────────────────────
export const FieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  type: FieldTypeSchema,
  label: z.string().optional(),
  required: z.boolean().default(false),
  unique: z.boolean().default(false),
  default: z.any().optional(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  enumValues: z.array(z.string()).optional(),
  hidden: z.boolean().default(false),
  readOnly: z.boolean().default(false),
  searchable: z.boolean().default(true),
  sortable: z.boolean().default(true),
  filterable: z.boolean().default(true),
});

// ─── Relation Definition ──────────────────────────────────────────
export const RelationSchema = z.object({
  name: z.string(),
  type: z.enum(['one-to-one', 'one-to-many', 'many-to-many']),
  target: z.string(), // entity name reference
  foreignKey: z.string().optional(),
  onDelete: z.enum(['cascade', 'set-null', 'restrict', 'no-action']).default('restrict'),
  onUpdate: z.enum(['cascade', 'set-null', 'restrict', 'no-action']).default('cascade'),
});

// ─── Entity Definition ────────────────────────────────────────────
export const EntitySchema = z.object({
  name: z.string().min(1, 'Entity name is required'),
  label: z.string().optional(),
  labelPlural: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(FieldSchema).min(1, 'At least one field is required'),
  relations: z.array(RelationSchema).default([]),
  timestamps: z.boolean().default(true),
  softDelete: z.boolean().default(true),
  audit: z.boolean().default(false),
});

// ─── Auth Configuration ───────────────────────────────────────────
export const AuthProviderSchema = z.object({
  type: z.enum(['email', 'google', 'github', 'microsoft', 'magic-link', 'saml']),
  enabled: z.boolean().default(true),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  callbackUrl: z.string().optional(),
});

export const RoleSchema = z.object({
  name: z.string().min(1),
  label: z.string().optional(),
  permissions: z.array(z.string()), // e.g. "users:read", "orders:write"
  isDefault: z.boolean().default(false),
});

export const AuthConfigSchema = z.object({
  enabled: z.boolean().default(true),
  providers: z.array(AuthProviderSchema).default([]),
  roles: z.array(RoleSchema).default([]),
  tokenExpiry: z.object({
    access: z.string().default('24h'),
    refresh: z.string().default('30d'),
  }).default({}),
  registration: z.object({
    enabled: z.boolean().default(true),
    requireEmailVerification: z.boolean().default(false),
    defaultRole: z.string().default('user'),
  }).default({}),
});

// ─── UI Component Configuration ───────────────────────────────────
export const ComponentTypeSchema = z.enum([
  // Layout
  'page', 'section', 'grid', 'flex', 'sidebar', 'modal', 'drawer',
  // Data Display
  'table', 'list', 'card', 'kanban', 'calendar', 'chart', 'stat',
  // Input
  'text-input', 'number-input', 'select', 'multi-select',
  'date-picker', 'file-upload', 'rich-text', 'checkbox',
  'toggle', 'textarea', 'form',
  // Navigation
  'navbar', 'sidebar-nav', 'breadcrumb', 'tabs', 'pagination',
  // Auth
  'login-form', 'register-form', 'oauth-button', 'user-menu',
  // Feedback
  'toast', 'alert', 'badge', 'progress', 'skeleton', 'empty-state',
]);

export const ComponentSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    type: z.string(), // Allow any string, unknown types handled by graceful degradation
    props: z.record(z.any()).default({}),
    children: z.array(ComponentSchema).default([]),
    dataSource: z.object({
      entity: z.string(),
      filters: z.record(z.any()).optional(),
      sort: z.object({
        field: z.string(),
        direction: z.enum(['asc', 'desc']),
      }).optional(),
      limit: z.number().optional(),
    }).optional(),
    visibleTo: z.array(z.string()).optional(), // role names
    style: z.record(z.any()).optional(),
    responsive: z.object({
      mobile: z.record(z.any()).optional(),
      tablet: z.record(z.any()).optional(),
      desktop: z.record(z.any()).optional(),
    }).optional(),
  })
);

// ─── Page Configuration ───────────────────────────────────────────
export const PageSchema = z.object({
  name: z.string().min(1, 'Page name is required'),
  path: z.string().min(1, 'Page path is required'),
  title: z.string().optional(),
  icon: z.string().optional(),
  layout: z.enum(['default', 'full-width', 'sidebar', 'centered']).default('default'),
  auth: z.object({
    required: z.boolean().default(false),
    roles: z.array(z.string()).optional(),
  }).default({}),
  components: z.array(ComponentSchema).default([]),
  meta: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
});

// ─── Navigation Configuration ─────────────────────────────────────
export const NavItemSchema: z.ZodType<any> = z.lazy(() =>
  z.object({
    label: z.string(),
    path: z.string().optional(),
    icon: z.string().optional(),
    roles: z.array(z.string()).optional(),
    children: z.array(NavItemSchema).default([]),
  })
);

export const NavigationSchema = z.object({
  type: z.enum(['sidebar', 'top', 'both']).default('sidebar'),
  logo: z.object({
    text: z.string().optional(),
    image: z.string().optional(),
  }).optional(),
  items: z.array(NavItemSchema).default([]),
});

// ─── Theme Configuration ──────────────────────────────────────────
export const ThemeSchema = z.object({
  primary: z.string().default('#3B5BDB'),
  secondary: z.string().optional(),
  fontFamily: z.string().optional(),
  borderRadius: z.enum(['sharp', 'default', 'rounded']).default('default'),
  colorMode: z.enum(['light', 'dark', 'system']).default('system'),
  customCSS: z.string().optional(),
});

// ─── Workflow Configuration ───────────────────────────────────────
export const WorkflowTriggerSchema = z.object({
  type: z.enum([
    'on_create', 'on_update', 'on_delete',
    'on_schedule', 'on_api_call', 'on_login'
  ]),
  entity: z.string().optional(),
  schedule: z.string().optional(), // cron expression
});

export const WorkflowConditionSchema = z.object({
  type: z.enum([
    'field_equals', 'field_contains', 'user_has_role',
    'date_is_after', 'custom_expression'
  ]),
  field: z.string().optional(),
  value: z.any().optional(),
  role: z.string().optional(),
  expression: z.string().optional(),
});

export const WorkflowActionSchema = z.object({
  type: z.enum([
    'send_email', 'send_notification', 'update_record',
    'create_record', 'call_webhook', 'run_script', 'export_csv'
  ]),
  config: z.record(z.any()).default({}),
});

export const WorkflowSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
  trigger: WorkflowTriggerSchema,
  conditions: z.array(WorkflowConditionSchema).default([]),
  conditionLogic: z.enum(['and', 'or']).default('and'),
  actions: z.array(WorkflowActionSchema).min(1),
  errorHandling: z.object({
    retry: z.object({
      maxAttempts: z.number().default(3),
      backoff: z.enum(['fixed', 'exponential']).default('exponential'),
    }).optional(),
    onFailure: z.enum(['continue', 'stop', 'fallback']).default('stop'),
  }).default({}),
});

// ─── i18n Configuration ──────────────────────────────────────────
export const I18nSchema = z.object({
  defaultLocale: z.string().default('en'),
  locales: z.array(z.string()).default(['en']),
  translations: z.record(z.record(z.string())).optional(),
});

// ─── App Settings ────────────────────────────────────────────────
export const AppSettingsSchema = z.object({
  domain: z.string().optional(),
  favicon: z.string().optional(),
  pwa: z.object({
    enabled: z.boolean().default(false),
    name: z.string().optional(),
    shortName: z.string().optional(),
    themeColor: z.string().optional(),
  }).optional(),
});

// ─── ROOT: MetaForge Application Config ──────────────────────────
export const MetaForgeConfigSchema = z.object({
  $schema: z.string().optional(),
  version: z.string().default('1.0'),
  app: z.object({
    name: z.string().min(1, 'App name is required'),
    description: z.string().optional(),
    version: z.string().default('1.0.0'),
  }),
  entities: z.array(EntitySchema).default([]),
  pages: z.array(PageSchema).default([]),
  navigation: NavigationSchema.optional(),
  auth: AuthConfigSchema.optional(),
  theme: ThemeSchema.optional(),
  workflows: z.array(WorkflowSchema).default([]),
  i18n: I18nSchema.optional(),
  settings: AppSettingsSchema.optional(),
});

// ─── Type Exports ────────────────────────────────────────────────
export type MetaForgeConfig = z.infer<typeof MetaForgeConfigSchema>;
export type Entity = z.infer<typeof EntitySchema>;
export type Field = z.infer<typeof FieldSchema>;
export type Relation = z.infer<typeof RelationSchema>;
export type Page = z.infer<typeof PageSchema>;
export type Component = z.infer<typeof ComponentSchema>;
export type AuthConfig = z.infer<typeof AuthConfigSchema>;
export type AuthProvider = z.infer<typeof AuthProviderSchema>;
export type Role = z.infer<typeof RoleSchema>;
export type NavItem = z.infer<typeof NavItemSchema>;
export type Navigation = z.infer<typeof NavigationSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowTrigger = z.infer<typeof WorkflowTriggerSchema>;
export type WorkflowCondition = z.infer<typeof WorkflowConditionSchema>;
export type WorkflowAction = z.infer<typeof WorkflowActionSchema>;
export type I18nConfig = z.infer<typeof I18nSchema>;
export type AppSettings = z.infer<typeof AppSettingsSchema>;
