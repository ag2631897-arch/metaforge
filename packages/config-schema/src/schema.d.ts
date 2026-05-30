/**
 * MetaForge Config Schema (MCS)
 *
 * This is the comprehensive Zod schema that defines the structure
 * of a MetaForge application manifest. Every JSON config uploaded
 * to MetaForge is validated against this schema.
 */
import { z } from 'zod';
export declare const FieldTypeSchema: z.ZodEnum<["string", "text", "number", "boolean", "date", "email", "uuid", "json", "enum", "url", "phone", "password", "color", "file", "image", "currency"]>;
export declare const FieldSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["string", "text", "number", "boolean", "date", "email", "uuid", "json", "enum", "url", "phone", "password", "color", "file", "image", "currency"]>;
    label: z.ZodOptional<z.ZodString>;
    required: z.ZodDefault<z.ZodBoolean>;
    unique: z.ZodDefault<z.ZodBoolean>;
    default: z.ZodOptional<z.ZodAny>;
    placeholder: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    min: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
    minLength: z.ZodOptional<z.ZodNumber>;
    maxLength: z.ZodOptional<z.ZodNumber>;
    pattern: z.ZodOptional<z.ZodString>;
    enumValues: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    hidden: z.ZodDefault<z.ZodBoolean>;
    readOnly: z.ZodDefault<z.ZodBoolean>;
    searchable: z.ZodDefault<z.ZodBoolean>;
    sortable: z.ZodDefault<z.ZodBoolean>;
    filterable: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    unique: boolean;
    required: boolean;
    type: "string" | "number" | "boolean" | "email" | "text" | "enum" | "currency" | "url" | "date" | "image" | "json" | "uuid" | "phone" | "password" | "color" | "file";
    hidden: boolean;
    readOnly: boolean;
    searchable: boolean;
    sortable: boolean;
    filterable: boolean;
    description?: string | undefined;
    default?: any;
    enumValues?: string[] | undefined;
    min?: number | undefined;
    label?: string | undefined;
    placeholder?: string | undefined;
    max?: number | undefined;
    maxLength?: number | undefined;
    minLength?: number | undefined;
    pattern?: string | undefined;
}, {
    name: string;
    type: "string" | "number" | "boolean" | "email" | "text" | "enum" | "currency" | "url" | "date" | "image" | "json" | "uuid" | "phone" | "password" | "color" | "file";
    description?: string | undefined;
    default?: any;
    enumValues?: string[] | undefined;
    unique?: boolean | undefined;
    min?: number | undefined;
    required?: boolean | undefined;
    label?: string | undefined;
    hidden?: boolean | undefined;
    placeholder?: string | undefined;
    max?: number | undefined;
    maxLength?: number | undefined;
    minLength?: number | undefined;
    pattern?: string | undefined;
    readOnly?: boolean | undefined;
    searchable?: boolean | undefined;
    sortable?: boolean | undefined;
    filterable?: boolean | undefined;
}>;
export declare const RelationSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["one-to-one", "one-to-many", "many-to-many"]>;
    target: z.ZodString;
    foreignKey: z.ZodOptional<z.ZodString>;
    onDelete: z.ZodDefault<z.ZodEnum<["cascade", "set-null", "restrict", "no-action"]>>;
    onUpdate: z.ZodDefault<z.ZodEnum<["cascade", "set-null", "restrict", "no-action"]>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    target: string;
    type: "one-to-one" | "one-to-many" | "many-to-many";
    onDelete: "cascade" | "set-null" | "restrict" | "no-action";
    onUpdate: "cascade" | "set-null" | "restrict" | "no-action";
    foreignKey?: string | undefined;
}, {
    name: string;
    target: string;
    type: "one-to-one" | "one-to-many" | "many-to-many";
    foreignKey?: string | undefined;
    onDelete?: "cascade" | "set-null" | "restrict" | "no-action" | undefined;
    onUpdate?: "cascade" | "set-null" | "restrict" | "no-action" | undefined;
}>;
export declare const EntitySchema: z.ZodObject<{
    name: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    labelPlural: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    fields: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["string", "text", "number", "boolean", "date", "email", "uuid", "json", "enum", "url", "phone", "password", "color", "file", "image", "currency"]>;
        label: z.ZodOptional<z.ZodString>;
        required: z.ZodDefault<z.ZodBoolean>;
        unique: z.ZodDefault<z.ZodBoolean>;
        default: z.ZodOptional<z.ZodAny>;
        placeholder: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
        minLength: z.ZodOptional<z.ZodNumber>;
        maxLength: z.ZodOptional<z.ZodNumber>;
        pattern: z.ZodOptional<z.ZodString>;
        enumValues: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        hidden: z.ZodDefault<z.ZodBoolean>;
        readOnly: z.ZodDefault<z.ZodBoolean>;
        searchable: z.ZodDefault<z.ZodBoolean>;
        sortable: z.ZodDefault<z.ZodBoolean>;
        filterable: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        unique: boolean;
        required: boolean;
        type: "string" | "number" | "boolean" | "email" | "text" | "enum" | "currency" | "url" | "date" | "image" | "json" | "uuid" | "phone" | "password" | "color" | "file";
        hidden: boolean;
        readOnly: boolean;
        searchable: boolean;
        sortable: boolean;
        filterable: boolean;
        description?: string | undefined;
        default?: any;
        enumValues?: string[] | undefined;
        min?: number | undefined;
        label?: string | undefined;
        placeholder?: string | undefined;
        max?: number | undefined;
        maxLength?: number | undefined;
        minLength?: number | undefined;
        pattern?: string | undefined;
    }, {
        name: string;
        type: "string" | "number" | "boolean" | "email" | "text" | "enum" | "currency" | "url" | "date" | "image" | "json" | "uuid" | "phone" | "password" | "color" | "file";
        description?: string | undefined;
        default?: any;
        enumValues?: string[] | undefined;
        unique?: boolean | undefined;
        min?: number | undefined;
        required?: boolean | undefined;
        label?: string | undefined;
        hidden?: boolean | undefined;
        placeholder?: string | undefined;
        max?: number | undefined;
        maxLength?: number | undefined;
        minLength?: number | undefined;
        pattern?: string | undefined;
        readOnly?: boolean | undefined;
        searchable?: boolean | undefined;
        sortable?: boolean | undefined;
        filterable?: boolean | undefined;
    }>, "many">;
    relations: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["one-to-one", "one-to-many", "many-to-many"]>;
        target: z.ZodString;
        foreignKey: z.ZodOptional<z.ZodString>;
        onDelete: z.ZodDefault<z.ZodEnum<["cascade", "set-null", "restrict", "no-action"]>>;
        onUpdate: z.ZodDefault<z.ZodEnum<["cascade", "set-null", "restrict", "no-action"]>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        target: string;
        type: "one-to-one" | "one-to-many" | "many-to-many";
        onDelete: "cascade" | "set-null" | "restrict" | "no-action";
        onUpdate: "cascade" | "set-null" | "restrict" | "no-action";
        foreignKey?: string | undefined;
    }, {
        name: string;
        target: string;
        type: "one-to-one" | "one-to-many" | "many-to-many";
        foreignKey?: string | undefined;
        onDelete?: "cascade" | "set-null" | "restrict" | "no-action" | undefined;
        onUpdate?: "cascade" | "set-null" | "restrict" | "no-action" | undefined;
    }>, "many">>;
    timestamps: z.ZodDefault<z.ZodBoolean>;
    softDelete: z.ZodDefault<z.ZodBoolean>;
    audit: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    relations: {
        name: string;
        target: string;
        type: "one-to-one" | "one-to-many" | "many-to-many";
        onDelete: "cascade" | "set-null" | "restrict" | "no-action";
        onUpdate: "cascade" | "set-null" | "restrict" | "no-action";
        foreignKey?: string | undefined;
    }[];
    fields: {
        name: string;
        unique: boolean;
        required: boolean;
        type: "string" | "number" | "boolean" | "email" | "text" | "enum" | "currency" | "url" | "date" | "image" | "json" | "uuid" | "phone" | "password" | "color" | "file";
        hidden: boolean;
        readOnly: boolean;
        searchable: boolean;
        sortable: boolean;
        filterable: boolean;
        description?: string | undefined;
        default?: any;
        enumValues?: string[] | undefined;
        min?: number | undefined;
        label?: string | undefined;
        placeholder?: string | undefined;
        max?: number | undefined;
        maxLength?: number | undefined;
        minLength?: number | undefined;
        pattern?: string | undefined;
    }[];
    timestamps: boolean;
    softDelete: boolean;
    audit: boolean;
    description?: string | undefined;
    icon?: string | undefined;
    label?: string | undefined;
    labelPlural?: string | undefined;
}, {
    name: string;
    fields: {
        name: string;
        type: "string" | "number" | "boolean" | "email" | "text" | "enum" | "currency" | "url" | "date" | "image" | "json" | "uuid" | "phone" | "password" | "color" | "file";
        description?: string | undefined;
        default?: any;
        enumValues?: string[] | undefined;
        unique?: boolean | undefined;
        min?: number | undefined;
        required?: boolean | undefined;
        label?: string | undefined;
        hidden?: boolean | undefined;
        placeholder?: string | undefined;
        max?: number | undefined;
        maxLength?: number | undefined;
        minLength?: number | undefined;
        pattern?: string | undefined;
        readOnly?: boolean | undefined;
        searchable?: boolean | undefined;
        sortable?: boolean | undefined;
        filterable?: boolean | undefined;
    }[];
    description?: string | undefined;
    icon?: string | undefined;
    label?: string | undefined;
    relations?: {
        name: string;
        target: string;
        type: "one-to-one" | "one-to-many" | "many-to-many";
        foreignKey?: string | undefined;
        onDelete?: "cascade" | "set-null" | "restrict" | "no-action" | undefined;
        onUpdate?: "cascade" | "set-null" | "restrict" | "no-action" | undefined;
    }[] | undefined;
    labelPlural?: string | undefined;
    timestamps?: boolean | undefined;
    softDelete?: boolean | undefined;
    audit?: boolean | undefined;
}>;
export declare const AuthProviderSchema: z.ZodObject<{
    type: z.ZodEnum<["email", "google", "github", "microsoft", "magic-link", "saml"]>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    clientId: z.ZodOptional<z.ZodString>;
    clientSecret: z.ZodOptional<z.ZodString>;
    callbackUrl: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "email" | "google" | "github" | "microsoft" | "magic-link" | "saml";
    enabled: boolean;
    callbackUrl?: string | undefined;
    clientId?: string | undefined;
    clientSecret?: string | undefined;
}, {
    type: "email" | "google" | "github" | "microsoft" | "magic-link" | "saml";
    callbackUrl?: string | undefined;
    clientId?: string | undefined;
    clientSecret?: string | undefined;
    enabled?: boolean | undefined;
}>;
export declare const RoleSchema: z.ZodObject<{
    name: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    permissions: z.ZodArray<z.ZodString, "many">;
    isDefault: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    isDefault: boolean;
    permissions: string[];
    label?: string | undefined;
}, {
    name: string;
    permissions: string[];
    label?: string | undefined;
    isDefault?: boolean | undefined;
}>;
export declare const AuthConfigSchema: z.ZodObject<{
    enabled: z.ZodDefault<z.ZodBoolean>;
    providers: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["email", "google", "github", "microsoft", "magic-link", "saml"]>;
        enabled: z.ZodDefault<z.ZodBoolean>;
        clientId: z.ZodOptional<z.ZodString>;
        clientSecret: z.ZodOptional<z.ZodString>;
        callbackUrl: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "email" | "google" | "github" | "microsoft" | "magic-link" | "saml";
        enabled: boolean;
        callbackUrl?: string | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
    }, {
        type: "email" | "google" | "github" | "microsoft" | "magic-link" | "saml";
        callbackUrl?: string | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        enabled?: boolean | undefined;
    }>, "many">>;
    roles: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        permissions: z.ZodArray<z.ZodString, "many">;
        isDefault: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        isDefault: boolean;
        permissions: string[];
        label?: string | undefined;
    }, {
        name: string;
        permissions: string[];
        label?: string | undefined;
        isDefault?: boolean | undefined;
    }>, "many">>;
    tokenExpiry: z.ZodDefault<z.ZodObject<{
        access: z.ZodDefault<z.ZodString>;
        refresh: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        refresh: string;
        access: string;
    }, {
        refresh?: string | undefined;
        access?: string | undefined;
    }>>;
    registration: z.ZodDefault<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        requireEmailVerification: z.ZodDefault<z.ZodBoolean>;
        defaultRole: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        requireEmailVerification: boolean;
        defaultRole: string;
    }, {
        enabled?: boolean | undefined;
        requireEmailVerification?: boolean | undefined;
        defaultRole?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    roles: {
        name: string;
        isDefault: boolean;
        permissions: string[];
        label?: string | undefined;
    }[];
    providers: {
        type: "email" | "google" | "github" | "microsoft" | "magic-link" | "saml";
        enabled: boolean;
        callbackUrl?: string | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
    }[];
    enabled: boolean;
    tokenExpiry: {
        refresh: string;
        access: string;
    };
    registration: {
        enabled: boolean;
        requireEmailVerification: boolean;
        defaultRole: string;
    };
}, {
    roles?: {
        name: string;
        permissions: string[];
        label?: string | undefined;
        isDefault?: boolean | undefined;
    }[] | undefined;
    providers?: {
        type: "email" | "google" | "github" | "microsoft" | "magic-link" | "saml";
        callbackUrl?: string | undefined;
        clientId?: string | undefined;
        clientSecret?: string | undefined;
        enabled?: boolean | undefined;
    }[] | undefined;
    enabled?: boolean | undefined;
    tokenExpiry?: {
        refresh?: string | undefined;
        access?: string | undefined;
    } | undefined;
    registration?: {
        enabled?: boolean | undefined;
        requireEmailVerification?: boolean | undefined;
        defaultRole?: string | undefined;
    } | undefined;
}>;
export declare const ComponentTypeSchema: z.ZodEnum<["page", "section", "grid", "flex", "sidebar", "modal", "drawer", "table", "list", "card", "kanban", "calendar", "chart", "stat", "text-input", "number-input", "select", "multi-select", "date-picker", "file-upload", "rich-text", "checkbox", "toggle", "textarea", "form", "navbar", "sidebar-nav", "breadcrumb", "tabs", "pagination", "login-form", "register-form", "oauth-button", "user-menu", "toast", "alert", "badge", "progress", "skeleton", "empty-state"]>;
export declare const ComponentSchema: z.ZodType<any>;
export declare const PageSchema: z.ZodObject<{
    name: z.ZodString;
    path: z.ZodString;
    title: z.ZodOptional<z.ZodString>;
    icon: z.ZodOptional<z.ZodString>;
    layout: z.ZodDefault<z.ZodEnum<["default", "full-width", "sidebar", "centered"]>>;
    auth: z.ZodDefault<z.ZodObject<{
        required: z.ZodDefault<z.ZodBoolean>;
        roles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        required: boolean;
        roles?: string[] | undefined;
    }, {
        required?: boolean | undefined;
        roles?: string[] | undefined;
    }>>;
    components: z.ZodDefault<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>;
    meta: z.ZodOptional<z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        description?: string | undefined;
        title?: string | undefined;
    }, {
        description?: string | undefined;
        title?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    layout: "default" | "sidebar" | "full-width" | "centered";
    auth: {
        required: boolean;
        roles?: string[] | undefined;
    };
    path: string;
    components: any[];
    title?: string | undefined;
    meta?: {
        description?: string | undefined;
        title?: string | undefined;
    } | undefined;
    icon?: string | undefined;
}, {
    name: string;
    path: string;
    layout?: "default" | "sidebar" | "full-width" | "centered" | undefined;
    title?: string | undefined;
    auth?: {
        required?: boolean | undefined;
        roles?: string[] | undefined;
    } | undefined;
    meta?: {
        description?: string | undefined;
        title?: string | undefined;
    } | undefined;
    icon?: string | undefined;
    components?: any[] | undefined;
}>;
export declare const NavItemSchema: z.ZodType<any>;
export declare const NavigationSchema: z.ZodObject<{
    type: z.ZodDefault<z.ZodEnum<["sidebar", "top", "both"]>>;
    logo: z.ZodOptional<z.ZodObject<{
        text: z.ZodOptional<z.ZodString>;
        image: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        text?: string | undefined;
        image?: string | undefined;
    }, {
        text?: string | undefined;
        image?: string | undefined;
    }>>;
    items: z.ZodDefault<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "sidebar" | "both" | "top";
    items: any[];
    logo?: {
        text?: string | undefined;
        image?: string | undefined;
    } | undefined;
}, {
    type?: "sidebar" | "both" | "top" | undefined;
    logo?: {
        text?: string | undefined;
        image?: string | undefined;
    } | undefined;
    items?: any[] | undefined;
}>;
export declare const ThemeSchema: z.ZodObject<{
    primary: z.ZodDefault<z.ZodString>;
    secondary: z.ZodOptional<z.ZodString>;
    fontFamily: z.ZodOptional<z.ZodString>;
    borderRadius: z.ZodDefault<z.ZodEnum<["sharp", "default", "rounded"]>>;
    colorMode: z.ZodDefault<z.ZodEnum<["light", "dark", "system"]>>;
    customCSS: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    borderRadius: "default" | "sharp" | "rounded";
    primary: string;
    colorMode: "system" | "dark" | "light";
    fontFamily?: string | undefined;
    secondary?: string | undefined;
    customCSS?: string | undefined;
}, {
    fontFamily?: string | undefined;
    borderRadius?: "default" | "sharp" | "rounded" | undefined;
    primary?: string | undefined;
    secondary?: string | undefined;
    colorMode?: "system" | "dark" | "light" | undefined;
    customCSS?: string | undefined;
}>;
export declare const WorkflowTriggerSchema: z.ZodObject<{
    type: z.ZodEnum<["on_create", "on_update", "on_delete", "on_schedule", "on_api_call", "on_login"]>;
    entity: z.ZodOptional<z.ZodString>;
    schedule: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "on_create" | "on_schedule" | "on_update" | "on_delete" | "on_api_call" | "on_login";
    entity?: string | undefined;
    schedule?: string | undefined;
}, {
    type: "on_create" | "on_schedule" | "on_update" | "on_delete" | "on_api_call" | "on_login";
    entity?: string | undefined;
    schedule?: string | undefined;
}>;
export declare const WorkflowConditionSchema: z.ZodObject<{
    type: z.ZodEnum<["field_equals", "field_contains", "user_has_role", "date_is_after", "custom_expression"]>;
    field: z.ZodOptional<z.ZodString>;
    value: z.ZodOptional<z.ZodAny>;
    role: z.ZodOptional<z.ZodString>;
    expression: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "field_equals" | "field_contains" | "user_has_role" | "date_is_after" | "custom_expression";
    value?: any;
    role?: string | undefined;
    field?: string | undefined;
    expression?: string | undefined;
}, {
    type: "field_equals" | "field_contains" | "user_has_role" | "date_is_after" | "custom_expression";
    value?: any;
    role?: string | undefined;
    field?: string | undefined;
    expression?: string | undefined;
}>;
export declare const WorkflowActionSchema: z.ZodObject<{
    type: z.ZodEnum<["send_email", "send_notification", "update_record", "create_record", "call_webhook", "run_script", "export_csv"]>;
    config: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    config: Record<string, any>;
    type: "send_email" | "send_notification" | "update_record" | "create_record" | "call_webhook" | "export_csv" | "run_script";
}, {
    type: "send_email" | "send_notification" | "update_record" | "create_record" | "call_webhook" | "export_csv" | "run_script";
    config?: Record<string, any> | undefined;
}>;
export declare const WorkflowSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    enabled: z.ZodDefault<z.ZodBoolean>;
    trigger: z.ZodObject<{
        type: z.ZodEnum<["on_create", "on_update", "on_delete", "on_schedule", "on_api_call", "on_login"]>;
        entity: z.ZodOptional<z.ZodString>;
        schedule: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "on_create" | "on_schedule" | "on_update" | "on_delete" | "on_api_call" | "on_login";
        entity?: string | undefined;
        schedule?: string | undefined;
    }, {
        type: "on_create" | "on_schedule" | "on_update" | "on_delete" | "on_api_call" | "on_login";
        entity?: string | undefined;
        schedule?: string | undefined;
    }>;
    conditions: z.ZodDefault<z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["field_equals", "field_contains", "user_has_role", "date_is_after", "custom_expression"]>;
        field: z.ZodOptional<z.ZodString>;
        value: z.ZodOptional<z.ZodAny>;
        role: z.ZodOptional<z.ZodString>;
        expression: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "field_equals" | "field_contains" | "user_has_role" | "date_is_after" | "custom_expression";
        value?: any;
        role?: string | undefined;
        field?: string | undefined;
        expression?: string | undefined;
    }, {
        type: "field_equals" | "field_contains" | "user_has_role" | "date_is_after" | "custom_expression";
        value?: any;
        role?: string | undefined;
        field?: string | undefined;
        expression?: string | undefined;
    }>, "many">>;
    conditionLogic: z.ZodDefault<z.ZodEnum<["and", "or"]>>;
    actions: z.ZodArray<z.ZodObject<{
        type: z.ZodEnum<["send_email", "send_notification", "update_record", "create_record", "call_webhook", "run_script", "export_csv"]>;
        config: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, "strip", z.ZodTypeAny, {
        config: Record<string, any>;
        type: "send_email" | "send_notification" | "update_record" | "create_record" | "call_webhook" | "export_csv" | "run_script";
    }, {
        type: "send_email" | "send_notification" | "update_record" | "create_record" | "call_webhook" | "export_csv" | "run_script";
        config?: Record<string, any> | undefined;
    }>, "many">;
    errorHandling: z.ZodDefault<z.ZodObject<{
        retry: z.ZodOptional<z.ZodObject<{
            maxAttempts: z.ZodDefault<z.ZodNumber>;
            backoff: z.ZodDefault<z.ZodEnum<["fixed", "exponential"]>>;
        }, "strip", z.ZodTypeAny, {
            maxAttempts: number;
            backoff: "fixed" | "exponential";
        }, {
            maxAttempts?: number | undefined;
            backoff?: "fixed" | "exponential" | undefined;
        }>>;
        onFailure: z.ZodDefault<z.ZodEnum<["continue", "stop", "fallback"]>>;
    }, "strip", z.ZodTypeAny, {
        onFailure: "continue" | "stop" | "fallback";
        retry?: {
            maxAttempts: number;
            backoff: "fixed" | "exponential";
        } | undefined;
    }, {
        retry?: {
            maxAttempts?: number | undefined;
            backoff?: "fixed" | "exponential" | undefined;
        } | undefined;
        onFailure?: "continue" | "stop" | "fallback" | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    conditions: {
        type: "field_equals" | "field_contains" | "user_has_role" | "date_is_after" | "custom_expression";
        value?: any;
        role?: string | undefined;
        field?: string | undefined;
        expression?: string | undefined;
    }[];
    enabled: boolean;
    trigger: {
        type: "on_create" | "on_schedule" | "on_update" | "on_delete" | "on_api_call" | "on_login";
        entity?: string | undefined;
        schedule?: string | undefined;
    };
    conditionLogic: "and" | "or";
    actions: {
        config: Record<string, any>;
        type: "send_email" | "send_notification" | "update_record" | "create_record" | "call_webhook" | "export_csv" | "run_script";
    }[];
    errorHandling: {
        onFailure: "continue" | "stop" | "fallback";
        retry?: {
            maxAttempts: number;
            backoff: "fixed" | "exponential";
        } | undefined;
    };
    description?: string | undefined;
}, {
    name: string;
    trigger: {
        type: "on_create" | "on_schedule" | "on_update" | "on_delete" | "on_api_call" | "on_login";
        entity?: string | undefined;
        schedule?: string | undefined;
    };
    actions: {
        type: "send_email" | "send_notification" | "update_record" | "create_record" | "call_webhook" | "export_csv" | "run_script";
        config?: Record<string, any> | undefined;
    }[];
    description?: string | undefined;
    conditions?: {
        type: "field_equals" | "field_contains" | "user_has_role" | "date_is_after" | "custom_expression";
        value?: any;
        role?: string | undefined;
        field?: string | undefined;
        expression?: string | undefined;
    }[] | undefined;
    enabled?: boolean | undefined;
    conditionLogic?: "and" | "or" | undefined;
    errorHandling?: {
        retry?: {
            maxAttempts?: number | undefined;
            backoff?: "fixed" | "exponential" | undefined;
        } | undefined;
        onFailure?: "continue" | "stop" | "fallback" | undefined;
    } | undefined;
}>;
export declare const I18nSchema: z.ZodObject<{
    defaultLocale: z.ZodDefault<z.ZodString>;
    locales: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    translations: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    defaultLocale: string;
    locales: string[];
    translations?: Record<string, Record<string, string>> | undefined;
}, {
    defaultLocale?: string | undefined;
    locales?: string[] | undefined;
    translations?: Record<string, Record<string, string>> | undefined;
}>;
export declare const AppSettingsSchema: z.ZodObject<{
    domain: z.ZodOptional<z.ZodString>;
    favicon: z.ZodOptional<z.ZodString>;
    pwa: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        name: z.ZodOptional<z.ZodString>;
        shortName: z.ZodOptional<z.ZodString>;
        themeColor: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        name?: string | undefined;
        shortName?: string | undefined;
        themeColor?: string | undefined;
    }, {
        name?: string | undefined;
        enabled?: boolean | undefined;
        shortName?: string | undefined;
        themeColor?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    domain?: string | undefined;
    favicon?: string | undefined;
    pwa?: {
        enabled: boolean;
        name?: string | undefined;
        shortName?: string | undefined;
        themeColor?: string | undefined;
    } | undefined;
}, {
    domain?: string | undefined;
    favicon?: string | undefined;
    pwa?: {
        name?: string | undefined;
        enabled?: boolean | undefined;
        shortName?: string | undefined;
        themeColor?: string | undefined;
    } | undefined;
}>;
export declare const MetaForgeConfigSchema: z.ZodObject<{
    $schema: z.ZodOptional<z.ZodString>;
    version: z.ZodDefault<z.ZodString>;
    app: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        version: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        version: string;
        description?: string | undefined;
    }, {
        name: string;
        description?: string | undefined;
        version?: string | undefined;
    }>;
    entities: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        labelPlural: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        fields: z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodEnum<["string", "text", "number", "boolean", "date", "email", "uuid", "json", "enum", "url", "phone", "password", "color", "file", "image", "currency"]>;
            label: z.ZodOptional<z.ZodString>;
            required: z.ZodDefault<z.ZodBoolean>;
            unique: z.ZodDefault<z.ZodBoolean>;
            default: z.ZodOptional<z.ZodAny>;
            placeholder: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
            minLength: z.ZodOptional<z.ZodNumber>;
            maxLength: z.ZodOptional<z.ZodNumber>;
            pattern: z.ZodOptional<z.ZodString>;
            enumValues: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            hidden: z.ZodDefault<z.ZodBoolean>;
            readOnly: z.ZodDefault<z.ZodBoolean>;
            searchable: z.ZodDefault<z.ZodBoolean>;
            sortable: z.ZodDefault<z.ZodBoolean>;
            filterable: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            unique: boolean;
            required: boolean;
            type: "string" | "number" | "boolean" | "email" | "text" | "enum" | "currency" | "url" | "date" | "image" | "json" | "uuid" | "phone" | "password" | "color" | "file";
            hidden: boolean;
            readOnly: boolean;
            searchable: boolean;
            sortable: boolean;
            filterable: boolean;
            description?: string | undefined;
            default?: any;
            enumValues?: string[] | undefined;
            min?: number | undefined;
            label?: string | undefined;
            placeholder?: string | undefined;
            max?: number | undefined;
            maxLength?: number | undefined;
            minLength?: number | undefined;
            pattern?: string | undefined;
        }, {
            name: string;
            type: "string" | "number" | "boolean" | "email" | "text" | "enum" | "currency" | "url" | "date" | "image" | "json" | "uuid" | "phone" | "password" | "color" | "file";
            description?: string | undefined;
            default?: any;
            enumValues?: string[] | undefined;
            unique?: boolean | undefined;
            min?: number | undefined;
            required?: boolean | undefined;
            label?: string | undefined;
            hidden?: boolean | undefined;
            placeholder?: string | undefined;
            max?: number | undefined;
            maxLength?: number | undefined;
            minLength?: number | undefined;
            pattern?: string | undefined;
            readOnly?: boolean | undefined;
            searchable?: boolean | undefined;
            sortable?: boolean | undefined;
            filterable?: boolean | undefined;
        }>, "many">;
        relations: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            type: z.ZodEnum<["one-to-one", "one-to-many", "many-to-many"]>;
            target: z.ZodString;
            foreignKey: z.ZodOptional<z.ZodString>;
            onDelete: z.ZodDefault<z.ZodEnum<["cascade", "set-null", "restrict", "no-action"]>>;
            onUpdate: z.ZodDefault<z.ZodEnum<["cascade", "set-null", "restrict", "no-action"]>>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            target: string;
            type: "one-to-one" | "one-to-many" | "many-to-many";
            onDelete: "cascade" | "set-null" | "restrict" | "no-action";
            onUpdate: "cascade" | "set-null" | "restrict" | "no-action";
            foreignKey?: string | undefined;
        }, {
            name: string;
            target: string;
            type: "one-to-one" | "one-to-many" | "many-to-many";
            foreignKey?: string | undefined;
            onDelete?: "cascade" | "set-null" | "restrict" | "no-action" | undefined;
            onUpdate?: "cascade" | "set-null" | "restrict" | "no-action" | undefined;
        }>, "many">>;
        timestamps: z.ZodDefault<z.ZodBoolean>;
        softDelete: z.ZodDefault<z.ZodBoolean>;
        audit: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        relations: {
            name: string;
            target: string;
            type: "one-to-one" | "one-to-many" | "many-to-many";
            onDelete: "cascade" | "set-null" | "restrict" | "no-action";
            onUpdate: "cascade" | "set-null" | "restrict" | "no-action";
            foreignKey?: string | undefined;
        }[];
        fields: {
            name: string;
            unique: boolean;
            required: boolean;
            type: "string" | "number" | "boolean" | "email" | "text" | "enum" | "currency" | "url" | "date" | "image" | "json" | "uuid" | "phone" | "password" | "color" | "file";
            hidden: boolean;
            readOnly: boolean;
            searchable: boolean;
            sortable: boolean;
            filterable: boolean;
            description?: string | undefined;
            default?: any;
            enumValues?: string[] | undefined;
            min?: number | undefined;
            label?: string | undefined;
            placeholder?: string | undefined;
            max?: number | undefined;
            maxLength?: number | undefined;
            minLength?: number | undefined;
            pattern?: string | undefined;
        }[];
        timestamps: boolean;
        softDelete: boolean;
        audit: boolean;
        description?: string | undefined;
        icon?: string | undefined;
        label?: string | undefined;
        labelPlural?: string | undefined;
    }, {
        name: string;
        fields: {
            name: string;
            type: "string" | "number" | "boolean" | "email" | "text" | "enum" | "currency" | "url" | "date" | "image" | "json" | "uuid" | "phone" | "password" | "color" | "file";
            description?: string | undefined;
            default?: any;
            enumValues?: string[] | undefined;
            unique?: boolean | undefined;
            min?: number | undefined;
            required?: boolean | undefined;
            label?: string | undefined;
            hidden?: boolean | undefined;
            placeholder?: string | undefined;
            max?: number | undefined;
            maxLength?: number | undefined;
            minLength?: number | undefined;
            pattern?: string | undefined;
            readOnly?: boolean | undefined;
            searchable?: boolean | undefined;
            sortable?: boolean | undefined;
            filterable?: boolean | undefined;
        }[];
        description?: string | undefined;
        icon?: string | undefined;
        label?: string | undefined;
        relations?: {
            name: string;
            target: string;
            type: "one-to-one" | "one-to-many" | "many-to-many";
            foreignKey?: string | undefined;
            onDelete?: "cascade" | "set-null" | "restrict" | "no-action" | undefined;
            onUpdate?: "cascade" | "set-null" | "restrict" | "no-action" | undefined;
        }[] | undefined;
        labelPlural?: string | undefined;
        timestamps?: boolean | undefined;
        softDelete?: boolean | undefined;
        audit?: boolean | undefined;
    }>, "many">>;
    pages: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        path: z.ZodString;
        title: z.ZodOptional<z.ZodString>;
        icon: z.ZodOptional<z.ZodString>;
        layout: z.ZodDefault<z.ZodEnum<["default", "full-width", "sidebar", "centered"]>>;
        auth: z.ZodDefault<z.ZodObject<{
            required: z.ZodDefault<z.ZodBoolean>;
            roles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            required: boolean;
            roles?: string[] | undefined;
        }, {
            required?: boolean | undefined;
            roles?: string[] | undefined;
        }>>;
        components: z.ZodDefault<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>;
        meta: z.ZodOptional<z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            description?: string | undefined;
            title?: string | undefined;
        }, {
            description?: string | undefined;
            title?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        layout: "default" | "sidebar" | "full-width" | "centered";
        auth: {
            required: boolean;
            roles?: string[] | undefined;
        };
        path: string;
        components: any[];
        title?: string | undefined;
        meta?: {
            description?: string | undefined;
            title?: string | undefined;
        } | undefined;
        icon?: string | undefined;
    }, {
        name: string;
        path: string;
        layout?: "default" | "sidebar" | "full-width" | "centered" | undefined;
        title?: string | undefined;
        auth?: {
            required?: boolean | undefined;
            roles?: string[] | undefined;
        } | undefined;
        meta?: {
            description?: string | undefined;
            title?: string | undefined;
        } | undefined;
        icon?: string | undefined;
        components?: any[] | undefined;
    }>, "many">>;
    navigation: z.ZodOptional<z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<["sidebar", "top", "both"]>>;
        logo: z.ZodOptional<z.ZodObject<{
            text: z.ZodOptional<z.ZodString>;
            image: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            text?: string | undefined;
            image?: string | undefined;
        }, {
            text?: string | undefined;
            image?: string | undefined;
        }>>;
        items: z.ZodDefault<z.ZodArray<z.ZodType<any, z.ZodTypeDef, any>, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "sidebar" | "both" | "top";
        items: any[];
        logo?: {
            text?: string | undefined;
            image?: string | undefined;
        } | undefined;
    }, {
        type?: "sidebar" | "both" | "top" | undefined;
        logo?: {
            text?: string | undefined;
            image?: string | undefined;
        } | undefined;
        items?: any[] | undefined;
    }>>;
    auth: z.ZodOptional<z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        providers: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["email", "google", "github", "microsoft", "magic-link", "saml"]>;
            enabled: z.ZodDefault<z.ZodBoolean>;
            clientId: z.ZodOptional<z.ZodString>;
            clientSecret: z.ZodOptional<z.ZodString>;
            callbackUrl: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "email" | "google" | "github" | "microsoft" | "magic-link" | "saml";
            enabled: boolean;
            callbackUrl?: string | undefined;
            clientId?: string | undefined;
            clientSecret?: string | undefined;
        }, {
            type: "email" | "google" | "github" | "microsoft" | "magic-link" | "saml";
            callbackUrl?: string | undefined;
            clientId?: string | undefined;
            clientSecret?: string | undefined;
            enabled?: boolean | undefined;
        }>, "many">>;
        roles: z.ZodDefault<z.ZodArray<z.ZodObject<{
            name: z.ZodString;
            label: z.ZodOptional<z.ZodString>;
            permissions: z.ZodArray<z.ZodString, "many">;
            isDefault: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name: string;
            isDefault: boolean;
            permissions: string[];
            label?: string | undefined;
        }, {
            name: string;
            permissions: string[];
            label?: string | undefined;
            isDefault?: boolean | undefined;
        }>, "many">>;
        tokenExpiry: z.ZodDefault<z.ZodObject<{
            access: z.ZodDefault<z.ZodString>;
            refresh: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            refresh: string;
            access: string;
        }, {
            refresh?: string | undefined;
            access?: string | undefined;
        }>>;
        registration: z.ZodDefault<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            requireEmailVerification: z.ZodDefault<z.ZodBoolean>;
            defaultRole: z.ZodDefault<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            requireEmailVerification: boolean;
            defaultRole: string;
        }, {
            enabled?: boolean | undefined;
            requireEmailVerification?: boolean | undefined;
            defaultRole?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        roles: {
            name: string;
            isDefault: boolean;
            permissions: string[];
            label?: string | undefined;
        }[];
        providers: {
            type: "email" | "google" | "github" | "microsoft" | "magic-link" | "saml";
            enabled: boolean;
            callbackUrl?: string | undefined;
            clientId?: string | undefined;
            clientSecret?: string | undefined;
        }[];
        enabled: boolean;
        tokenExpiry: {
            refresh: string;
            access: string;
        };
        registration: {
            enabled: boolean;
            requireEmailVerification: boolean;
            defaultRole: string;
        };
    }, {
        roles?: {
            name: string;
            permissions: string[];
            label?: string | undefined;
            isDefault?: boolean | undefined;
        }[] | undefined;
        providers?: {
            type: "email" | "google" | "github" | "microsoft" | "magic-link" | "saml";
            callbackUrl?: string | undefined;
            clientId?: string | undefined;
            clientSecret?: string | undefined;
            enabled?: boolean | undefined;
        }[] | undefined;
        enabled?: boolean | undefined;
        tokenExpiry?: {
            refresh?: string | undefined;
            access?: string | undefined;
        } | undefined;
        registration?: {
            enabled?: boolean | undefined;
            requireEmailVerification?: boolean | undefined;
            defaultRole?: string | undefined;
        } | undefined;
    }>>;
    theme: z.ZodOptional<z.ZodObject<{
        primary: z.ZodDefault<z.ZodString>;
        secondary: z.ZodOptional<z.ZodString>;
        fontFamily: z.ZodOptional<z.ZodString>;
        borderRadius: z.ZodDefault<z.ZodEnum<["sharp", "default", "rounded"]>>;
        colorMode: z.ZodDefault<z.ZodEnum<["light", "dark", "system"]>>;
        customCSS: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        borderRadius: "default" | "sharp" | "rounded";
        primary: string;
        colorMode: "system" | "dark" | "light";
        fontFamily?: string | undefined;
        secondary?: string | undefined;
        customCSS?: string | undefined;
    }, {
        fontFamily?: string | undefined;
        borderRadius?: "default" | "sharp" | "rounded" | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        colorMode?: "system" | "dark" | "light" | undefined;
        customCSS?: string | undefined;
    }>>;
    workflows: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        enabled: z.ZodDefault<z.ZodBoolean>;
        trigger: z.ZodObject<{
            type: z.ZodEnum<["on_create", "on_update", "on_delete", "on_schedule", "on_api_call", "on_login"]>;
            entity: z.ZodOptional<z.ZodString>;
            schedule: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "on_create" | "on_schedule" | "on_update" | "on_delete" | "on_api_call" | "on_login";
            entity?: string | undefined;
            schedule?: string | undefined;
        }, {
            type: "on_create" | "on_schedule" | "on_update" | "on_delete" | "on_api_call" | "on_login";
            entity?: string | undefined;
            schedule?: string | undefined;
        }>;
        conditions: z.ZodDefault<z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["field_equals", "field_contains", "user_has_role", "date_is_after", "custom_expression"]>;
            field: z.ZodOptional<z.ZodString>;
            value: z.ZodOptional<z.ZodAny>;
            role: z.ZodOptional<z.ZodString>;
            expression: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            type: "field_equals" | "field_contains" | "user_has_role" | "date_is_after" | "custom_expression";
            value?: any;
            role?: string | undefined;
            field?: string | undefined;
            expression?: string | undefined;
        }, {
            type: "field_equals" | "field_contains" | "user_has_role" | "date_is_after" | "custom_expression";
            value?: any;
            role?: string | undefined;
            field?: string | undefined;
            expression?: string | undefined;
        }>, "many">>;
        conditionLogic: z.ZodDefault<z.ZodEnum<["and", "or"]>>;
        actions: z.ZodArray<z.ZodObject<{
            type: z.ZodEnum<["send_email", "send_notification", "update_record", "create_record", "call_webhook", "run_script", "export_csv"]>;
            config: z.ZodDefault<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, "strip", z.ZodTypeAny, {
            config: Record<string, any>;
            type: "send_email" | "send_notification" | "update_record" | "create_record" | "call_webhook" | "export_csv" | "run_script";
        }, {
            type: "send_email" | "send_notification" | "update_record" | "create_record" | "call_webhook" | "export_csv" | "run_script";
            config?: Record<string, any> | undefined;
        }>, "many">;
        errorHandling: z.ZodDefault<z.ZodObject<{
            retry: z.ZodOptional<z.ZodObject<{
                maxAttempts: z.ZodDefault<z.ZodNumber>;
                backoff: z.ZodDefault<z.ZodEnum<["fixed", "exponential"]>>;
            }, "strip", z.ZodTypeAny, {
                maxAttempts: number;
                backoff: "fixed" | "exponential";
            }, {
                maxAttempts?: number | undefined;
                backoff?: "fixed" | "exponential" | undefined;
            }>>;
            onFailure: z.ZodDefault<z.ZodEnum<["continue", "stop", "fallback"]>>;
        }, "strip", z.ZodTypeAny, {
            onFailure: "continue" | "stop" | "fallback";
            retry?: {
                maxAttempts: number;
                backoff: "fixed" | "exponential";
            } | undefined;
        }, {
            retry?: {
                maxAttempts?: number | undefined;
                backoff?: "fixed" | "exponential" | undefined;
            } | undefined;
            onFailure?: "continue" | "stop" | "fallback" | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        conditions: {
            type: "field_equals" | "field_contains" | "user_has_role" | "date_is_after" | "custom_expression";
            value?: any;
            role?: string | undefined;
            field?: string | undefined;
            expression?: string | undefined;
        }[];
        enabled: boolean;
        trigger: {
            type: "on_create" | "on_schedule" | "on_update" | "on_delete" | "on_api_call" | "on_login";
            entity?: string | undefined;
            schedule?: string | undefined;
        };
        conditionLogic: "and" | "or";
        actions: {
            config: Record<string, any>;
            type: "send_email" | "send_notification" | "update_record" | "create_record" | "call_webhook" | "export_csv" | "run_script";
        }[];
        errorHandling: {
            onFailure: "continue" | "stop" | "fallback";
            retry?: {
                maxAttempts: number;
                backoff: "fixed" | "exponential";
            } | undefined;
        };
        description?: string | undefined;
    }, {
        name: string;
        trigger: {
            type: "on_create" | "on_schedule" | "on_update" | "on_delete" | "on_api_call" | "on_login";
            entity?: string | undefined;
            schedule?: string | undefined;
        };
        actions: {
            type: "send_email" | "send_notification" | "update_record" | "create_record" | "call_webhook" | "export_csv" | "run_script";
            config?: Record<string, any> | undefined;
        }[];
        description?: string | undefined;
        conditions?: {
            type: "field_equals" | "field_contains" | "user_has_role" | "date_is_after" | "custom_expression";
            value?: any;
            role?: string | undefined;
            field?: string | undefined;
            expression?: string | undefined;
        }[] | undefined;
        enabled?: boolean | undefined;
        conditionLogic?: "and" | "or" | undefined;
        errorHandling?: {
            retry?: {
                maxAttempts?: number | undefined;
                backoff?: "fixed" | "exponential" | undefined;
            } | undefined;
            onFailure?: "continue" | "stop" | "fallback" | undefined;
        } | undefined;
    }>, "many">>;
    i18n: z.ZodOptional<z.ZodObject<{
        defaultLocale: z.ZodDefault<z.ZodString>;
        locales: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
        translations: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>>>;
    }, "strip", z.ZodTypeAny, {
        defaultLocale: string;
        locales: string[];
        translations?: Record<string, Record<string, string>> | undefined;
    }, {
        defaultLocale?: string | undefined;
        locales?: string[] | undefined;
        translations?: Record<string, Record<string, string>> | undefined;
    }>>;
    settings: z.ZodOptional<z.ZodObject<{
        domain: z.ZodOptional<z.ZodString>;
        favicon: z.ZodOptional<z.ZodString>;
        pwa: z.ZodOptional<z.ZodObject<{
            enabled: z.ZodDefault<z.ZodBoolean>;
            name: z.ZodOptional<z.ZodString>;
            shortName: z.ZodOptional<z.ZodString>;
            themeColor: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            enabled: boolean;
            name?: string | undefined;
            shortName?: string | undefined;
            themeColor?: string | undefined;
        }, {
            name?: string | undefined;
            enabled?: boolean | undefined;
            shortName?: string | undefined;
            themeColor?: string | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        domain?: string | undefined;
        favicon?: string | undefined;
        pwa?: {
            enabled: boolean;
            name?: string | undefined;
            shortName?: string | undefined;
            themeColor?: string | undefined;
        } | undefined;
    }, {
        domain?: string | undefined;
        favicon?: string | undefined;
        pwa?: {
            name?: string | undefined;
            enabled?: boolean | undefined;
            shortName?: string | undefined;
            themeColor?: string | undefined;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    version: string;
    entities: {
        name: string;
        relations: {
            name: string;
            target: string;
            type: "one-to-one" | "one-to-many" | "many-to-many";
            onDelete: "cascade" | "set-null" | "restrict" | "no-action";
            onUpdate: "cascade" | "set-null" | "restrict" | "no-action";
            foreignKey?: string | undefined;
        }[];
        fields: {
            name: string;
            unique: boolean;
            required: boolean;
            type: "string" | "number" | "boolean" | "email" | "text" | "enum" | "currency" | "url" | "date" | "image" | "json" | "uuid" | "phone" | "password" | "color" | "file";
            hidden: boolean;
            readOnly: boolean;
            searchable: boolean;
            sortable: boolean;
            filterable: boolean;
            description?: string | undefined;
            default?: any;
            enumValues?: string[] | undefined;
            min?: number | undefined;
            label?: string | undefined;
            placeholder?: string | undefined;
            max?: number | undefined;
            maxLength?: number | undefined;
            minLength?: number | undefined;
            pattern?: string | undefined;
        }[];
        timestamps: boolean;
        softDelete: boolean;
        audit: boolean;
        description?: string | undefined;
        icon?: string | undefined;
        label?: string | undefined;
        labelPlural?: string | undefined;
    }[];
    pages: {
        name: string;
        layout: "default" | "sidebar" | "full-width" | "centered";
        auth: {
            required: boolean;
            roles?: string[] | undefined;
        };
        path: string;
        components: any[];
        title?: string | undefined;
        meta?: {
            description?: string | undefined;
            title?: string | undefined;
        } | undefined;
        icon?: string | undefined;
    }[];
    app: {
        name: string;
        version: string;
        description?: string | undefined;
    };
    workflows: {
        name: string;
        conditions: {
            type: "field_equals" | "field_contains" | "user_has_role" | "date_is_after" | "custom_expression";
            value?: any;
            role?: string | undefined;
            field?: string | undefined;
            expression?: string | undefined;
        }[];
        enabled: boolean;
        trigger: {
            type: "on_create" | "on_schedule" | "on_update" | "on_delete" | "on_api_call" | "on_login";
            entity?: string | undefined;
            schedule?: string | undefined;
        };
        conditionLogic: "and" | "or";
        actions: {
            config: Record<string, any>;
            type: "send_email" | "send_notification" | "update_record" | "create_record" | "call_webhook" | "export_csv" | "run_script";
        }[];
        errorHandling: {
            onFailure: "continue" | "stop" | "fallback";
            retry?: {
                maxAttempts: number;
                backoff: "fixed" | "exponential";
            } | undefined;
        };
        description?: string | undefined;
    }[];
    auth?: {
        roles: {
            name: string;
            isDefault: boolean;
            permissions: string[];
            label?: string | undefined;
        }[];
        providers: {
            type: "email" | "google" | "github" | "microsoft" | "magic-link" | "saml";
            enabled: boolean;
            callbackUrl?: string | undefined;
            clientId?: string | undefined;
            clientSecret?: string | undefined;
        }[];
        enabled: boolean;
        tokenExpiry: {
            refresh: string;
            access: string;
        };
        registration: {
            enabled: boolean;
            requireEmailVerification: boolean;
            defaultRole: string;
        };
    } | undefined;
    theme?: {
        borderRadius: "default" | "sharp" | "rounded";
        primary: string;
        colorMode: "system" | "dark" | "light";
        fontFamily?: string | undefined;
        secondary?: string | undefined;
        customCSS?: string | undefined;
    } | undefined;
    navigation?: {
        type: "sidebar" | "both" | "top";
        items: any[];
        logo?: {
            text?: string | undefined;
            image?: string | undefined;
        } | undefined;
    } | undefined;
    i18n?: {
        defaultLocale: string;
        locales: string[];
        translations?: Record<string, Record<string, string>> | undefined;
    } | undefined;
    settings?: {
        domain?: string | undefined;
        favicon?: string | undefined;
        pwa?: {
            enabled: boolean;
            name?: string | undefined;
            shortName?: string | undefined;
            themeColor?: string | undefined;
        } | undefined;
    } | undefined;
    $schema?: string | undefined;
}, {
    app: {
        name: string;
        description?: string | undefined;
        version?: string | undefined;
    };
    auth?: {
        roles?: {
            name: string;
            permissions: string[];
            label?: string | undefined;
            isDefault?: boolean | undefined;
        }[] | undefined;
        providers?: {
            type: "email" | "google" | "github" | "microsoft" | "magic-link" | "saml";
            callbackUrl?: string | undefined;
            clientId?: string | undefined;
            clientSecret?: string | undefined;
            enabled?: boolean | undefined;
        }[] | undefined;
        enabled?: boolean | undefined;
        tokenExpiry?: {
            refresh?: string | undefined;
            access?: string | undefined;
        } | undefined;
        registration?: {
            enabled?: boolean | undefined;
            requireEmailVerification?: boolean | undefined;
            defaultRole?: string | undefined;
        } | undefined;
    } | undefined;
    version?: string | undefined;
    entities?: {
        name: string;
        fields: {
            name: string;
            type: "string" | "number" | "boolean" | "email" | "text" | "enum" | "currency" | "url" | "date" | "image" | "json" | "uuid" | "phone" | "password" | "color" | "file";
            description?: string | undefined;
            default?: any;
            enumValues?: string[] | undefined;
            unique?: boolean | undefined;
            min?: number | undefined;
            required?: boolean | undefined;
            label?: string | undefined;
            hidden?: boolean | undefined;
            placeholder?: string | undefined;
            max?: number | undefined;
            maxLength?: number | undefined;
            minLength?: number | undefined;
            pattern?: string | undefined;
            readOnly?: boolean | undefined;
            searchable?: boolean | undefined;
            sortable?: boolean | undefined;
            filterable?: boolean | undefined;
        }[];
        description?: string | undefined;
        icon?: string | undefined;
        label?: string | undefined;
        relations?: {
            name: string;
            target: string;
            type: "one-to-one" | "one-to-many" | "many-to-many";
            foreignKey?: string | undefined;
            onDelete?: "cascade" | "set-null" | "restrict" | "no-action" | undefined;
            onUpdate?: "cascade" | "set-null" | "restrict" | "no-action" | undefined;
        }[] | undefined;
        labelPlural?: string | undefined;
        timestamps?: boolean | undefined;
        softDelete?: boolean | undefined;
        audit?: boolean | undefined;
    }[] | undefined;
    pages?: {
        name: string;
        path: string;
        layout?: "default" | "sidebar" | "full-width" | "centered" | undefined;
        title?: string | undefined;
        auth?: {
            required?: boolean | undefined;
            roles?: string[] | undefined;
        } | undefined;
        meta?: {
            description?: string | undefined;
            title?: string | undefined;
        } | undefined;
        icon?: string | undefined;
        components?: any[] | undefined;
    }[] | undefined;
    theme?: {
        fontFamily?: string | undefined;
        borderRadius?: "default" | "sharp" | "rounded" | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        colorMode?: "system" | "dark" | "light" | undefined;
        customCSS?: string | undefined;
    } | undefined;
    navigation?: {
        type?: "sidebar" | "both" | "top" | undefined;
        logo?: {
            text?: string | undefined;
            image?: string | undefined;
        } | undefined;
        items?: any[] | undefined;
    } | undefined;
    workflows?: {
        name: string;
        trigger: {
            type: "on_create" | "on_schedule" | "on_update" | "on_delete" | "on_api_call" | "on_login";
            entity?: string | undefined;
            schedule?: string | undefined;
        };
        actions: {
            type: "send_email" | "send_notification" | "update_record" | "create_record" | "call_webhook" | "export_csv" | "run_script";
            config?: Record<string, any> | undefined;
        }[];
        description?: string | undefined;
        conditions?: {
            type: "field_equals" | "field_contains" | "user_has_role" | "date_is_after" | "custom_expression";
            value?: any;
            role?: string | undefined;
            field?: string | undefined;
            expression?: string | undefined;
        }[] | undefined;
        enabled?: boolean | undefined;
        conditionLogic?: "and" | "or" | undefined;
        errorHandling?: {
            retry?: {
                maxAttempts?: number | undefined;
                backoff?: "fixed" | "exponential" | undefined;
            } | undefined;
            onFailure?: "continue" | "stop" | "fallback" | undefined;
        } | undefined;
    }[] | undefined;
    i18n?: {
        defaultLocale?: string | undefined;
        locales?: string[] | undefined;
        translations?: Record<string, Record<string, string>> | undefined;
    } | undefined;
    settings?: {
        domain?: string | undefined;
        favicon?: string | undefined;
        pwa?: {
            name?: string | undefined;
            enabled?: boolean | undefined;
            shortName?: string | undefined;
            themeColor?: string | undefined;
        } | undefined;
    } | undefined;
    $schema?: string | undefined;
}>;
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
//# sourceMappingURL=schema.d.ts.map