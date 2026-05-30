export async function healthRoutes(app) {
    app.get('/health', async () => ({
        success: true,
        data: {
            status: 'healthy',
            version: '1.0.0',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        },
    }));
}
//# sourceMappingURL=health.js.map