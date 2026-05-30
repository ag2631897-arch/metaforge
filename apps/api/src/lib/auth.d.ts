import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
export interface AuthUser {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    passwordHash?: string | null;
    provider?: string;
    providerId?: string | null;
    role: string;
    emailVerified?: boolean;
    lastLoginAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface AuthenticatedApiKey {
    id: string;
    name: string;
    scopes: string[];
}
declare module 'fastify' {
    interface FastifyRequest {
        authUser?: AuthUser;
        authMethod?: 'session' | 'api-key';
        authApiKey?: AuthenticatedApiKey;
    }
}
export declare function hashApiKey(rawKey: string): string;
export declare function createRawApiKey(): string;
export declare function requireAuth(request: FastifyRequest, reply: FastifyReply): Promise<undefined>;
export declare function registerAuth(app: FastifyInstance): void;
export declare function getRequestUser(request: FastifyRequest): import("../../dist/lib/auth.js").AuthUser;
//# sourceMappingURL=auth.d.ts.map