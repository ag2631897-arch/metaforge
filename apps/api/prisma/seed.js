/**
 * MetaForge Platform — Database Seed Script
 *
 * Seeds the platform DB with demo data for development:
 * - 1 admin user
 * - 3 demo apps with configs
 * - Deploy history per app
 * - Sample workflow executions
 * - Notifications
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
    const adminPasswordHash = await bcrypt.hash('metaforge', 12);
    console.log('🌱 Seeding MetaForge platform database...\n');
    // ── User ────────────────────────────────────────────────────
    const admin = await prisma.user.upsert({
        where: { email: 'admin@metaforge.app' },
        update: { passwordHash: adminPasswordHash, emailVerified: true },
        create: {
            email: 'admin@metaforge.app',
            name: 'Admin',
            role: 'admin',
            provider: 'email',
            emailVerified: true,
            passwordHash: adminPasswordHash,
        },
    });
    console.log(`✓ User: ${admin.name} (${admin.email})`);
    // ── Apps ────────────────────────────────────────────────────
    const appConfigs = [
        {
            name: 'E-Commerce MVP',
            slug: 'ecommerce-mvp',
            description: 'A complete e-commerce application with products, orders, and analytics',
            status: 'live',
            liveUrl: 'https://ecommerce-mvp.metaforge.app',
            configVersion: 3,
            primaryColor: '#3B5BDB',
            configJson: {
                version: '1.0',
                app: { name: 'E-Commerce MVP', description: 'A complete e-commerce application' },
                entities: [
                    {
                        name: 'products', label: 'Product',
                        fields: [
                            { name: 'name', type: 'string', required: true },
                            { name: 'description', type: 'text' },
                            { name: 'price', type: 'number', required: true, min: 0 },
                            { name: 'sku', type: 'string', unique: true },
                            { name: 'category', type: 'enum', enumValues: ['electronics', 'clothing', 'food'] },
                            { name: 'inStock', type: 'boolean', default: true },
                        ],
                    },
                    {
                        name: 'orders', label: 'Order',
                        fields: [
                            { name: 'customerEmail', type: 'email', required: true },
                            { name: 'total', type: 'number' },
                            { name: 'status', type: 'enum', enumValues: ['pending', 'shipped', 'delivered'] },
                        ],
                    },
                ],
                pages: [
                    { name: 'Dashboard', path: '/', layout: 'sidebar', components: [{ type: 'stat' }, { type: 'chart' }] },
                    { name: 'Products', path: '/products', components: [{ type: 'table', dataSource: { entity: 'products' } }] },
                ],
                auth: { enabled: true, providers: [{ type: 'email', enabled: true }, { type: 'google', enabled: true }] },
                theme: { primary: '#3B5BDB', colorMode: 'system' },
            },
        },
        {
            name: 'CRM Dashboard',
            slug: 'crm-dashboard',
            description: 'Customer relationship management with contacts, pipeline, and email integration',
            status: 'live',
            liveUrl: 'https://crm-dashboard.metaforge.app',
            configVersion: 1,
            primaryColor: '#7950F2',
            configJson: {
                version: '1.0',
                app: { name: 'CRM Dashboard' },
                entities: [
                    { name: 'contacts', label: 'Contact', fields: [{ name: 'fullName', type: 'string', required: true }, { name: 'email', type: 'email' }, { name: 'company', type: 'string' }] },
                    { name: 'deals', label: 'Deal', fields: [{ name: 'title', type: 'string', required: true }, { name: 'value', type: 'currency' }, { name: 'stage', type: 'enum', enumValues: ['lead', 'qualified', 'proposal', 'closed'] }] },
                ],
                pages: [{ name: 'Pipeline', path: '/', components: [{ type: 'kanban', dataSource: { entity: 'deals' } }] }],
            },
        },
        {
            name: 'Blog Platform',
            slug: 'blog-platform',
            description: 'Content management system with posts, categories, and SEO tools',
            status: 'deploying',
            configVersion: 2,
            primaryColor: '#12B886',
            configJson: {
                version: '1.0',
                app: { name: 'Blog Platform' },
                entities: [
                    { name: 'posts', label: 'Post', fields: [{ name: 'title', type: 'string', required: true }, { name: 'content', type: 'text' }, { name: 'published', type: 'boolean', default: false }] },
                    { name: 'categories', label: 'Category', fields: [{ name: 'name', type: 'string', required: true }, { name: 'slug', type: 'string', unique: true }] },
                ],
                pages: [{ name: 'Posts', path: '/', components: [{ type: 'table', dataSource: { entity: 'posts' } }] }],
            },
        },
    ];
    for (const config of appConfigs) {
        const app = await prisma.app.upsert({
            where: { slug: config.slug },
            update: { status: config.status, configVersion: config.configVersion },
            create: { ...config, ownerId: admin.id, deployedAt: config.status === 'live' ? new Date() : null },
        });
        console.log(`✓ App: ${app.name} [${app.status}]`);
        // Config version history
        await prisma.configVersion.upsert({
            where: { appId_version: { appId: app.id, version: 1 } },
            update: {},
            create: { appId: app.id, version: 1, configJson: config.configJson, changeLog: 'Initial config' },
        });
        // Deploy record
        await prisma.deploy.create({
            data: {
                version: config.configVersion,
                status: config.status === 'live' ? 'live' : 'building',
                appId: app.id,
                triggeredBy: admin.id,
                duration: config.status === 'live' ? Math.floor(Math.random() * 5000) + 2000 : null,
                completedAt: config.status === 'live' ? new Date() : null,
                stages: [
                    { name: 'Validate', status: 'success', duration: 120 },
                    { name: 'Database', status: 'success', duration: 450 },
                    { name: 'Routes', status: 'success', duration: 320 },
                    { name: 'Workflows', status: config.status === 'live' ? 'success' : 'pending', duration: config.status === 'live' ? 180 : null },
                    { name: 'Preview', status: config.status === 'live' ? 'success' : 'pending', duration: config.status === 'live' ? 90 : null },
                ],
            },
        });
    }
    // ── Workflow Executions ──────────────────────────────────────
    const ecomApp = await prisma.app.findUnique({ where: { slug: 'ecommerce-mvp' } });
    if (ecomApp) {
        const workflowData = [
            { workflowName: 'New Task Notification', triggerType: 'OnCreate', status: 'success', duration: 340 },
            { workflowName: 'Weekly Project Report', triggerType: 'OnSchedule', status: 'success', duration: 1200 },
            { workflowName: 'Order Confirmation', triggerType: 'OnCreate', status: 'failed', duration: 890, errorMessage: 'SMTP connection timed out' },
        ];
        for (const wf of workflowData) {
            await prisma.workflowExecution.create({
                data: { ...wf, appId: ecomApp.id, completedAt: new Date() },
            });
        }
        console.log(`✓ Workflow executions seeded (${workflowData.length})`);
    }
    // ── Notifications ───────────────────────────────────────────
    const notifications = [
        { type: 'deploy_success', title: 'Deploy Successful', message: 'E-Commerce MVP v3 is now live', read: false },
        { type: 'deploy_success', title: 'Deploy Successful', message: 'CRM Dashboard v1 deployed', read: true },
        { type: 'workflow_error', title: 'Workflow Failed', message: 'Order Confirmation workflow failed: SMTP timeout', read: false },
        { type: 'system', title: 'Welcome to MetaForge', message: 'Your developer account is ready. Start by creating your first app.', read: true },
    ];
    for (const n of notifications) {
        await prisma.notification.create({
            data: { ...n, userId: admin.id, appId: ecomApp?.id },
        });
    }
    console.log(`✓ Notifications seeded (${notifications.length})`);
    console.log('\n✅ Seeding complete!');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map