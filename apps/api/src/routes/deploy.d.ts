/**
 * Deploy Route — Takes a MetaForge config and orchestrates:
 * 1. Validate config via parser
 * 2. Generate database schema
 * 3. Register dynamic API routes
 * 4. Load workflow definitions
 * 5. Return deploy status
 */
import { FastifyInstance } from 'fastify';
export declare function deployRoutes(app: FastifyInstance): Promise<void>;
//# sourceMappingURL=deploy.d.ts.map