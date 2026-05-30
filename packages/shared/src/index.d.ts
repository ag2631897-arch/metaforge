/**
 * MetaForge Shared Utilities
 */
export declare function slugify(text: string): string;
export declare function capitalize(text: string): string;
export declare function pluralize(word: string): string;
export declare function generateId(prefix?: string): string;
export declare function formatRelativeTime(dateString: string): string;
export declare function safeJsonParse(json: string): {
    data: any;
    error: string | null;
};
export declare function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T;
export declare function pick<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K>;
export declare function omit<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K>;
//# sourceMappingURL=index.d.ts.map