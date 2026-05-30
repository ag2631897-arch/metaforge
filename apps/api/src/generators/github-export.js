/**
 * MetaForge GitHub Export Generator
 *
 * Takes a MetaForge config and generates a standalone Next.js project
 * that can be pushed to GitHub. Produces all files needed to run
 * independently without the MetaForge runtime.
 */
export function generateStandaloneProject(config) {
    const files = [];
    const appSlug = config.app.name.toLowerCase().replace(/\s+/g, '-');
    // ── package.json ──────────────────────────────────────────────
    files.push({
        path: 'package.json',
        content: JSON.stringify({
            name: appSlug,
            version: config.app.version || '1.0.0',
            private: true,
            scripts: {
                dev: 'next dev',
                build: 'next build',
                start: 'next start',
                'db:push': 'prisma db push',
                'db:generate': 'prisma generate',
            },
            dependencies: {
                next: '^14.2.0',
                react: '^18.3.0',
                'react-dom': '^18.3.0',
                '@prisma/client': '^5.15.0',
            },
            devDependencies: {
                typescript: '^5.4.0',
                '@types/node': '^20.14.0',
                '@types/react': '^18.3.0',
                prisma: '^5.15.0',
            },
        }, null, 2),
    });
    // ── .env.example ──────────────────────────────────────────────
    files.push({
        path: '.env.example',
        content: `# ${config.app.name} Environment Variables\nDATABASE_URL=postgresql://postgres:postgres@localhost:5432/${appSlug}\nNEXTAUTH_SECRET=your-secret-here\nNEXTAUTH_URL=http://localhost:3000\n`,
    });
    // ── Prisma Schema ─────────────────────────────────────────────
    const prismaLines = [
        `generator client {`,
        `  provider = "prisma-client-js"`,
        `}\n`,
        `datasource db {`,
        `  provider = "postgresql"`,
        `  url      = env("DATABASE_URL")`,
        `}\n`,
    ];
    for (const entity of config.entities) {
        prismaLines.push(`model ${capitalize(entity.name)} {`);
        prismaLines.push(`  id        String   @id @default(uuid())`);
        for (const field of entity.fields || []) {
            const prismaType = fieldToPrisma(field.type, field.required);
            prismaLines.push(`  ${padRight(field.name, 14)} ${prismaType}`);
        }
        prismaLines.push(`  createdAt DateTime @default(now())`);
        prismaLines.push(`  updatedAt DateTime @updatedAt`);
        prismaLines.push(`\n  @@map("${entity.name}")`);
        prismaLines.push(`}\n`);
    }
    files.push({ path: 'prisma/schema.prisma', content: prismaLines.join('\n') });
    // ── API Routes (per entity) ───────────────────────────────────
    for (const entity of config.entities) {
        const routeContent = `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/${entity.name}
export async function GET() {
  const records = await prisma.${entity.name}.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ data: records });
}

// POST /api/${entity.name}
export async function POST(request: Request) {
  const body = await request.json();
  const record = await prisma.${entity.name}.create({ data: body });
  return NextResponse.json({ data: record }, { status: 201 });
}
`;
        files.push({ path: `src/app/api/${entity.name}/route.ts`, content: routeContent });
        // Single record route
        const singleRoute = `import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const record = await prisma.${entity.name}.findUnique({ where: { id: params.id } });
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ data: record });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = await request.json();
  const record = await prisma.${entity.name}.update({ where: { id: params.id }, data: body });
  return NextResponse.json({ data: record });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.${entity.name}.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Deleted' });
}
`;
        files.push({ path: `src/app/api/${entity.name}/[id]/route.ts`, content: singleRoute });
    }
    // ── Prisma Client Singleton ───────────────────────────────────
    files.push({
        path: 'src/lib/prisma.ts',
        content: `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`,
    });
    // ── Layout ────────────────────────────────────────────────────
    files.push({
        path: 'src/app/layout.tsx',
        content: `import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '${config.app.name}',
  description: '${config.app.description || 'Built with MetaForge'}',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
    });
    // ── Global CSS ────────────────────────────────────────────────
    files.push({
        path: 'src/app/globals.css',
        content: `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --primary: ${config.theme?.primary || '#3B5BDB'};
  --bg: #ffffff;
  --fg: #0f172a;
  --muted: #64748b;
  --border: #e2e8f0;
  --surface: #f8fafc;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--fg); }
`,
    });
    // ── Pages ─────────────────────────────────────────────────────
    for (const page of config.pages) {
        const pagePath = page.path === '/' ? 'src/app/page.tsx' : `src/app${page.path}/page.tsx`;
        files.push({
            path: pagePath,
            content: `export default function ${capitalize(page.name.replace(/\s+/g, ''))}Page() {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>${page.title || page.name}</h1>
      ${(page.components || []).map((c) => `{/* ${c.type} component */}`).join('\n      ')}
    </div>
  );
}
`,
        });
    }
    // ── README ────────────────────────────────────────────────────
    files.push({
        path: 'README.md',
        content: `# ${config.app.name}

${config.app.description || 'Generated by MetaForge.'}

## Getting Started

\`\`\`bash
npm install
cp .env.example .env.local
npx prisma db push
npm run dev
\`\`\`

## API Endpoints

${config.entities.map((e) => `- \`GET /api/${e.name}\` — List all ${e.name}\n- \`POST /api/${e.name}\` — Create ${e.label || e.name}\n- \`GET /api/${e.name}/:id\` — Get single ${e.label || e.name}\n- \`PUT /api/${e.name}/:id\` — Update ${e.label || e.name}\n- \`DELETE /api/${e.name}/:id\` — Delete ${e.label || e.name}`).join('\n')}

---

*Generated by [MetaForge](https://metaforge.dev)*
`,
    });
    return files;
}
// ─── Helpers ─────────────────────────────────────────────────────
function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
function padRight(s, len) {
    return s + ' '.repeat(Math.max(0, len - s.length));
}
function fieldToPrisma(type, required) {
    const map = {
        string: 'String', text: 'String', number: 'Float', boolean: 'Boolean',
        date: 'DateTime', email: 'String', url: 'String', json: 'Json',
        phone: 'String', color: 'String', currency: 'Float', file: 'String',
        image: 'String', uuid: 'String', enum: 'String',
    };
    const prismaType = map[type] || 'String';
    return required ? prismaType : `${prismaType}?`;
}
//# sourceMappingURL=github-export.js.map