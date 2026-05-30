/**
 * Auth routes: password login, registration, session lookup, and API keys.
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { createRawApiKey, getRequestUser, hashApiKey } from '../lib/auth.js';
const PASSWORD_HASH_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
export async function authRoutes(app) {
    // POST /api/v1/auth/login
    app.post('/auth/login', async (request, reply) => {
        const { email, password } = request.body;
        if (!email || !password) {
            return reply.status(400).send({
                success: false,
                error: { code: 'MISSING_FIELDS', message: 'Email and password are required' },
            });
        }
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user?.passwordHash) {
            return reply.status(401).send({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
            });
        }
        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
            return reply.status(401).send({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
            });
        }
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
        };
    });
    // POST /api/v1/auth/register
    app.post('/auth/register', async (request, reply) => {
        const { email, name, password } = request.body;
        if (!email || !password) {
            return reply.status(400).send({
                success: false,
                error: { code: 'MISSING_FIELDS', message: 'Email and password are required' },
            });
        }
        if (password.length < 8) {
            return reply.status(400).send({
                success: false,
                error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters' },
            });
        }
        const normalizedEmail = email.toLowerCase();
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
        if (existing) {
            return reply.status(409).send({
                success: false,
                error: { code: 'USER_EXISTS', message: 'An account with this email already exists' },
            });
        }
        const passwordHash = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
        const user = await prisma.user.create({
            data: {
                email: normalizedEmail,
                name: name || normalizedEmail.split('@')[0],
                passwordHash,
                role: 'developer',
                provider: 'email',
                emailVerified: true,
            },
        });
        return {
            success: true,
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
        };
    });
    // GET /api/v1/auth/me
    app.get('/auth/me', async (request) => {
        const user = getRequestUser(request);
        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
            meta: { authMethod: request.authMethod },
        };
    });
    // POST /api/v1/auth/api-keys
    app.post('/auth/api-keys', async (request) => {
        const { name, scopes } = request.body;
        const user = getRequestUser(request);
        const rawKey = createRawApiKey();
        const prefix = rawKey.substring(0, 10);
        const apiKey = await prisma.apiKey.create({
            data: {
                name: name || 'Untitled Key',
                keyHash: hashApiKey(rawKey),
                prefix,
                scopes: scopes || ['apps:read'],
                userId: user.id,
            },
        });
        return {
            success: true,
            data: {
                id: apiKey.id,
                name: apiKey.name,
                key: rawKey,
                prefix: apiKey.prefix,
                scopes: apiKey.scopes,
            },
        };
    });
    // GET /api/v1/auth/api-keys
    app.get('/auth/api-keys', async (request) => {
        const user = getRequestUser(request);
        const keys = await prisma.apiKey.findMany({
            where: { userId: user.id, revokedAt: null },
            select: {
                id: true,
                name: true,
                prefix: true,
                scopes: true,
                lastUsedAt: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, data: keys };
    });
    // DELETE /api/v1/auth/api-keys/:id
    app.delete('/auth/api-keys/:id', async (request, reply) => {
        const { id } = request.params;
        const user = getRequestUser(request);
        const result = await prisma.apiKey.updateMany({
            where: { id, userId: user.id, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        if (result.count > 0) {
            return { success: true, data: { message: 'API key revoked' } };
        }
        return reply.status(404).send({
            success: false,
            error: { code: 'NOT_FOUND', message: 'API key not found' },
        });
    });
}
//# sourceMappingURL=auth.js.map