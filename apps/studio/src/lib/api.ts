/**
 * API URL helper for MetaForge Studio.
 *
 * In production (cross-domain deployment), all API calls are routed through
 * a Next.js API proxy at /api/proxy/* so that the browser's auth cookies
 * are forwarded server-side to the Render backend. In development (same
 * origin), we call the backend directly.
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

const isLocalDev =
  typeof window !== 'undefined' && window.location.hostname === 'localhost';

export const API_BASE_URL = isLocalDev ? BACKEND_URL : '/api/proxy';

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
