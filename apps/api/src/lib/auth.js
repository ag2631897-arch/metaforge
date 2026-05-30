import { getToken } from '@auth/core/jwt';
import { createHash, randomBytes } from 'crypto';
import { prisma } from './prisma.js';
const PUBLIC_ROUTES = [
    { method: 'GET', path: /^\/api\/v1\/health$/ },
    { method: 'POST', path: /^\/api\/v1\/auth\/login$/ },
    { method: 'POST', path: /^\/api\/v1\/auth\/register$/ },
];
function getHeaderValue(value) {
    if (Array.isArray(value))
        return value.join('; ');
    return value;
}
function getAuthSecret() {
    return (process.env.AUTH_SECRET ||
        process.env.NEXTAUTH_SECRET ||
        (process.env.NODE_ENV === 'production' ? undefined : 'metaforge-dev-secret-change-me'));
}
function isPublicRoute(request) {
    if (request.method === 'OPTIONS')
        return true;
    const path = request.url.split('?')[0];
    return PUBLIC_ROUTES.some((route) => route.method === request.method && route.path.test(path));
}
export function hashApiKey(rawKey) {
    return createHash('sha256').update(rawKey).digest('hex');
}
export function createRawApiKey() {
    return `mf_${randomBytes(32).toString('base64url')}`;
}
async function authenticateApiKey(rawKey) {
    const keyHash = hashApiKey(rawKey);
    const now = new Date();
    let apiKey = await prisma.apiKey.findFirst({
        where: {
            keyHash,
            revokedAt: null,
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        },
        include: { user: true },
    });
    // Upgrade keys created by older builds that stored the raw key directly.
    if (!apiKey) {
        apiKey = await prisma.apiKey.findFirst({
            where: {
                keyHash: rawKey,
                revokedAt: null,
                OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
            },
            include: { user: true },
        });
        if (apiKey) {
            apiKey = await prisma.apiKey.update({
                where: { id: apiKey.id },
                data: { keyHash },
                include: { user: true },
            });
        }
    }
    if (!apiKey)
        return null;
    await prisma.apiKey.update({
        where: { id: apiKey.id },
        data: { lastUsedAt: now },
    });
    return {
        user: apiKey.user,
        apiKey: {
            id: apiKey.id,
            name: apiKey.name,
            scopes: apiKey.scopes,
        },
    };
}
async function authenticateSession(request) {
    const secret = getAuthSecret();
    if (!secret)
        return null;
    const headers = new Headers();
    const cookie = getHeaderValue(request.headers.cookie);
    const authorization = getHeaderValue(request.headers.authorization);
    if (cookie)
        headers.set('cookie', cookie);
    if (authorization)
        headers.set('authorization', authorization);
    const token = (await getToken({ req: { headers }, secret, secureCookie: false })) ||
        (await getToken({ req: { headers }, secret, secureCookie: true }));
    if (!token?.email)
        return null;
    const email = String(token.email).toLowerCase();
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            name: typeof token.name === 'string' ? token.name : undefined,
            avatarUrl: typeof token.picture === 'string' ? token.picture : undefined,
            lastLoginAt: new Date(),
        },
        create: {
            email,
            name: typeof token.name === 'string' ? token.name : email.split('@')[0],
            avatarUrl: typeof token.picture === 'string' ? token.picture : undefined,
            role: typeof token.role === 'string' ? token.role : 'developer',
            provider: 'authjs',
            providerId: typeof token.sub === 'string' ? token.sub : undefined,
            emailVerified: true,
            lastLoginAt: new Date(),
        },
    });
    return user;
}
async function authenticateRequest(request) {
    const authorization = getHeaderValue(request.headers.authorization);
    const bearerToken = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (bearerToken?.startsWith('mf_')) {
        const result = await authenticateApiKey(bearerToken);
        if (!result)
            return null;
        request.authUser = result.user;
        request.authMethod = 'api-key';
        request.authApiKey = result.apiKey;
        return result.user;
    }
    const sessionUser = await authenticateSession(request);
    if (!sessionUser)
        return null;
    request.authUser = sessionUser;
    request.authMethod = 'session';
    return sessionUser;
}
export async function requireAuth(request, reply) {
    if (isPublicRoute(request))
        return;
    const user = await authenticateRequest(request);
    if (user)
        return;
    return reply.status(401).send({
        success: false,
        error: {
            code: 'UNAUTHORIZED',
            message: 'A valid Auth.js session or MetaForge API key is required.',
        },
    });
}
export function registerAuth(app) {
    app.addHook('onRequest', requireAuth);
}
export function getRequestUser(request) {
    if (!request.authUser) {
        throw new Error('Authenticated user missing from protected request');
    }
    return request.authUser;
}
//# sourceMappingURL=auth.js.map