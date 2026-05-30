/**
 * MetaForge GitHub Export Generator
 * 
 * Takes a MetaForge config and generates a standalone Next.js project
 * that can be pushed to GitHub. Produces all files needed to run
 * independently without the MetaForge runtime.
 */

interface ExportConfig {
  app: { name: string; description?: string; version?: string };
  entities: any[];
  pages: any[];
  functionalModules?: any[];
  sourceFiles?: Array<{ path: string; content: string; purpose?: string }>;
  databaseArchitecture?: any;
  backendRuntime?: any;
  frontendRenderEngine?: any;
  workflowAutomation?: any;
  i18n?: any;
  auth?: any;
  theme?: any;
  navigation?: any;
}

interface GeneratedFile {
  path: string;
  content: string;
}

export function generateStandaloneProject(config: ExportConfig): GeneratedFile[] {
  const files: GeneratedFile[] = [];
  const appSlug = config.app.name.toLowerCase().replace(/\s+/g, '-');
  const generatedModules = collectGeneratedModules(config);

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
    content: `# ${config.app.name} Environment Variables\nDATABASE_URL=postgresql://postgres:postgres@localhost:5432/${appSlug}\nNEXTAUTH_SECRET=your-secret-here\nNEXTAUTH_URL=http://localhost:3000\nSMTP_USER=ag2631897@gmail.com\nSMTP_PASS=your-gmail-app-password\n`,
  });

  // ── Prisma Schema ─────────────────────────────────────────────
  const prismaLines: string[] = [
    `generator client {`,
    `  provider = "prisma-client-js"`,
    `}\n`,
    `datasource db {`,
    `  provider = "postgresql"`,
    `  url      = env("DATABASE_URL")`,
    `}\n`,
  ];

  for (const entity of config.entities || []) {
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
  for (const entity of config.entities || []) {
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
  for (const module of generatedModules) {
    upsertFile(files, {
      path: `src/components/generated/${componentName(module)}.tsx`,
      content: generatedModuleComponent(module),
    });
    upsertFile(files, {
      path: generatedModuleApiPath(module),
      content: generatedModuleApi(module),
    });
  }

  for (const page of config.pages) {
    const pagePath = page.path === '/' ? 'src/app/page.tsx' : `src/app${page.path}/page.tsx`;
    const generatedComponents = (page.components || []).filter((component: any) => component.type === 'generatedModule' || component.runtimeSpec);
    const imports = generatedComponents
      .map((component: any) => `import ${componentName(component)} from '@/components/generated/${componentName(component)}';`)
      .join('\n');
    files.push({
      path: pagePath,
      content: `${imports ? `${imports}\n\n` : ''}export default function ${capitalize(page.name.replace(/\s+/g, ''))}Page() {
  return (
    <main style={{ minHeight: '100vh', padding: '32px', background: 'var(--bg)', color: 'var(--fg)' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 800, marginBottom: '24px' }}>${page.title || page.name}</h1>
        ${(page.components || []).map((component: any) => renderExportComponent(component)).join('\n        ')}
      </div>
    </main>
  );
}
`,
    });
  }

  for (const sourceFile of config.sourceFiles || []) {
    if (sourceFile?.path && sourceFile?.content) {
      upsertFile(files, { path: sourceFile.path, content: sourceFile.content });
    }
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

${config.entities.map((e: any) => `- \`GET /api/${e.name}\` — List all ${e.name}\n- \`POST /api/${e.name}\` — Create ${e.label || e.name}\n- \`GET /api/${e.name}/:id\` — Get single ${e.label || e.name}\n- \`PUT /api/${e.name}/:id\` — Update ${e.label || e.name}\n- \`DELETE /api/${e.name}/:id\` — Delete ${e.label || e.name}`).join('\n')}

---

*Generated by [MetaForge](https://metaforge.dev)*
`,
  });

  return files;
}

// ─── Helpers ─────────────────────────────────────────────────────
function upsertFile(files: GeneratedFile[], file: GeneratedFile) {
  const index = files.findIndex((item) => item.path === file.path);
  if (index >= 0) files[index] = file;
  else files.push(file);
}

function collectGeneratedModules(config: ExportConfig) {
  const modules = [
    ...(config.functionalModules || []).filter((module: any) => module.type === 'generatedModule' || module.runtimeSpec),
    ...(config.pages || []).flatMap((page: any) =>
      (page.components || []).filter((component: any) => component.type === 'generatedModule' || component.runtimeSpec),
    ),
  ];
  const seen = new Set<string>();
  return modules.filter((module: any) => {
    const key = module.moduleId || module.id || module.label || module.type;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function componentName(module: any) {
  const raw = String(module.moduleId || module.id || module.label || 'GeneratedFeature');
  const name = raw
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(capitalize)
    .join('');
  return `${name || 'Generated'}Feature`;
}

function moduleSlug(module: any) {
  return String(module.dataSource?.entity || module.id || module.moduleId || module.label || 'generated-feature')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'generated-feature';
}

function generatedModuleApiPath(module: any) {
  return `src/app/api/${moduleSlug(module)}/route.ts`;
}

function generatedModuleApi(module: any) {
  return `import { NextResponse } from 'next/server';

type RuntimeRecord = { id: string; result: string; createdAt: string };

let records: RuntimeRecord[] = [];

export async function GET() {
  return NextResponse.json({ data: records });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const record = {
    id: crypto.randomUUID(),
    result: String(body.result || 'Result'),
    createdAt: new Date().toISOString(),
  };
  records = [record, ...records];
  return NextResponse.json({ data: record }, { status: 201 });
}

export async function DELETE() {
  records = [];
  return NextResponse.json({ data: [] });
}
`;
}

function generatedModuleComponent(module: any) {
  const spec = module.runtimeSpec || {};
  const outcomes = spec.outcomes?.length
    ? spec.outcomes
    : [
        { id: 'heads', label: 'Heads', value: 'Heads', color: '#f8d66d' },
        { id: 'tails', label: 'Tails', value: 'Tails', color: '#8bd3ff' },
      ];
  const controls = spec.controls?.length
    ? spec.controls
    : [
        { id: 'run', label: spec.primaryVisual === 'coin' ? 'Flip Coin' : 'Run', action: 'randomize' },
        { id: 'reset', label: 'Reset', action: 'reset' },
      ];
  const title = module.label || 'Generated Feature';
  const description = module.description || 'Generated interactive feature.';
  const apiPath = `/api/${moduleSlug(module)}`;
  const isCoin = spec.primaryVisual === 'coin';

  return `'use client';

import { useMemo, useState } from 'react';

const outcomes = ${JSON.stringify(outcomes, null, 2)} as const;
const controls = ${JSON.stringify(controls, null, 2)} as const;

type HistoryItem = { id: number; result: string; createdAt: string };

export default function ${componentName(module)}() {
  const [result, setResult] = useState('Ready');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [nonce, setNonce] = useState(0);

  const stats = useMemo(() => {
    const heads = history.filter((item) => item.result.toLowerCase() === 'heads').length;
    const tails = history.filter((item) => item.result.toLowerCase() === 'tails').length;
    return { total: history.length, heads, tails };
  }, [history]);

  function run(action: string) {
    if (action === 'reset') {
      setResult('Ready');
      setHistory([]);
      setNonce((value) => value + 1);
      fetch('${apiPath}', { method: 'DELETE' }).catch(() => undefined);
      return;
    }

    const selected = outcomes[Math.floor(Math.random() * outcomes.length)];
    const next = selected.value || selected.label;
    const item = { id: Date.now(), result: next, createdAt: new Date().toLocaleTimeString() };
    setResult(next);
    setHistory((current) => [item, ...current]);
    setNonce((value) => value + 1);
    fetch('${apiPath}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: next }),
    }).catch(() => undefined);
  }

  const activeOutcome = outcomes.find((outcome) => (outcome.value || outcome.label) === result) || outcomes[0];

  return (
    <section style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 0.9fr) minmax(280px, 1.1fr)', gap: 24, alignItems: 'stretch' }}>
      <div style={{ border: '1px solid var(--border)', borderRadius: 28, padding: 28, background: 'var(--surface)', display: 'grid', placeItems: 'center' }}>
        <div
          key={nonce}
          style={{
            width: 'min(72vw, 340px)',
            aspectRatio: '1',
            borderRadius: ${isCoin ? "'50%'" : '24'},
            border: '12px solid rgba(15, 23, 42, 0.16)',
            display: 'grid',
            placeItems: 'center',
            color: '#111827',
            background: \`radial-gradient(circle at 35% 30%, rgba(255,255,255,0.85), \${activeOutcome.color || 'var(--primary)'} 42%, rgba(15,23,42,0.32))\`,
            boxShadow: '0 28px 80px rgba(15,23,42,0.22)',
            animation: nonce ? 'coinFlip 700ms cubic-bezier(0.16,1,0.3,1)' : undefined,
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 76, fontWeight: 900 }}>{result === 'Heads' ? 'H' : result === 'Tails' ? 'T' : '?'}</div>
            <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 3, textTransform: 'uppercase' }}>{result}</div>
          </div>
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {controls.map((control) => (
            <button
              key={control.id}
              type="button"
              onClick={() => run(control.action)}
              style={{ border: 0, borderRadius: 999, padding: '12px 18px', fontWeight: 800, color: '#fff', background: control.action === 'reset' ? '#334155' : 'var(--primary)', cursor: 'pointer' }}
            >
              {control.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 26, marginBottom: 8 }}>${escapeTsx(title)}</h2>
          <p style={{ color: 'var(--muted)', lineHeight: 1.6 }}>${escapeTsx(description)}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          {[['Total', stats.total], ['Heads', stats.heads], ['Tails', stats.tails]].map(([label, value]) => (
            <div key={label} style={{ border: '1px solid var(--border)', borderRadius: 18, padding: 18, background: '#fff' }}>
              <div style={{ color: 'var(--muted)', fontWeight: 800, fontSize: 12, textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: 32, fontWeight: 900 }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ border: '1px solid var(--border)', borderRadius: 18, padding: 18, background: '#fff' }}>
          <h3 style={{ marginBottom: 12 }}>History</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {(history.length ? history : [{ id: 0, result: 'No flips yet', createdAt: '' }]).map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 12, background: 'var(--surface)' }}>
                <strong>{item.result}</strong>
                <span style={{ color: 'var(--muted)' }}>{item.createdAt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{\`
        @keyframes coinFlip {
          0% { transform: rotateY(0deg) translateY(0) scale(0.96); }
          45% { transform: rotateY(540deg) translateY(-18px) scale(1.05); }
          100% { transform: rotateY(1080deg) translateY(0) scale(1); }
        }
      \`}</style>
    </section>
  );
}
`;
}

function renderExportComponent(component: any) {
  if (component.type === 'generatedModule' || component.runtimeSpec) {
    return `<${componentName(component)} />`;
  }

  return `<section style={{ border: '1px solid var(--border)', borderRadius: 18, padding: 20, background: 'var(--surface)', marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>${component.label || component.type}</h2>
          <p style={{ color: 'var(--muted)' }}>${component.description || 'Generated app section'}</p>
        </section>`;
}

function escapeTsx(value: string) {
  return String(value).replace(/`/g, '\\`').replace(/\${/g, '\\${');
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function padRight(s: string, len: number): string {
  return s + ' '.repeat(Math.max(0, len - s.length));
}

function fieldToPrisma(type: string, required?: boolean): string {
  const map: Record<string, string> = {
    string: 'String', text: 'String', number: 'Float', boolean: 'Boolean',
    date: 'DateTime', email: 'String', url: 'String', json: 'Json',
    phone: 'String', color: 'String', currency: 'Float', file: 'String',
    image: 'String', uuid: 'String', enum: 'String',
  };
  const prismaType = map[type] || 'String';
  return required ? prismaType : `${prismaType}?`;
}
