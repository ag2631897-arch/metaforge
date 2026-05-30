/**
 * MetaForge Shared Utilities
 */
// ─── String Utilities ────────────────────────────────────────────
export function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
export function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
export function pluralize(word) {
    if (word.endsWith('s'))
        return word;
    if (word.endsWith('y'))
        return word.slice(0, -1) + 'ies';
    if (word.endsWith('ch') || word.endsWith('sh') || word.endsWith('x') || word.endsWith('z')) {
        return word + 'es';
    }
    return word + 's';
}
// ─── ID Generation ───────────────────────────────────────────────
export function generateId(prefix) {
    const id = Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
    return prefix ? `${prefix}_${id}` : id;
}
// ─── Time Utilities ──────────────────────────────────────────────
export function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 60)
        return 'just now';
    if (minutes < 60)
        return `${minutes}m ago`;
    if (hours < 24)
        return `${hours}h ago`;
    if (days < 30)
        return `${days}d ago`;
    return date.toLocaleDateString();
}
// ─── Config Utilities ────────────────────────────────────────────
export function safeJsonParse(json) {
    try {
        return { data: JSON.parse(json), error: null };
    }
    catch (e) {
        return { data: null, error: e.message };
    }
}
// ─── Object Utilities ────────────────────────────────────────────
export function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source[key] !== null &&
            typeof source[key] === 'object' &&
            !Array.isArray(source[key]) &&
            key in target &&
            typeof target[key] === 'object') {
            result[key] = deepMerge(target[key], source[key]);
        }
        else {
            result[key] = source[key];
        }
    }
    return result;
}
export function pick(obj, keys) {
    const result = {};
    for (const key of keys) {
        if (key in obj)
            result[key] = obj[key];
    }
    return result;
}
export function omit(obj, keys) {
    const result = { ...obj };
    for (const key of keys) {
        delete result[key];
    }
    return result;
}
//# sourceMappingURL=index.js.map