<p align="center">
  <img src="https://img.shields.io/badge/MetaForge-Developer%20Studio-3B5BDB?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIj48cGF0aCBkPSJNMTIgMkwyIDdsMTAgNSAxMC01LTEwLTV6Ii8+PHBhdGggZD0iTTIgMTdsMTAgNSAxMC01Ii8+PHBhdGggZD0iTTIgMTJsMTAgNSAxMC01Ii8+PC9zdmc+" alt="MetaForge" />
</p>

<h1 align="center">MetaForge Developer Studio</h1>

<p align="center">
  <strong>Build production-ready applications from a single JSON manifest.</strong><br/>
  Define your entities, pages, auth, and workflows — MetaForge generates your database, API, and UI.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14+-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Fastify-4.x-000?logo=fastify" alt="Fastify" />
  <img src="https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Turborepo-Monorepo-EF4444?logo=turborepo" alt="Turborepo" />
</p>

---

## ✨ What is MetaForge?

MetaForge is a **metadata-driven application runtime**. Instead of writing boilerplate CRUD code, you define your application as a JSON configuration — and MetaForge generates everything:

- 🗃️ **Database schemas** (Prisma + PostgreSQL)
- ⚡ **REST API endpoints** (auto CRUD with pagination, filtering, bulk ops)
- 🎨 **Frontend UI** (component registry with 13+ components)
- 🔐 **Authentication** (multi-provider with RBAC)
- ⚙️ **Workflows** (event-driven automation)
- 📦 **GitHub Export** (standalone Next.js project)

## 🏗️ Architecture

```
metaforge/
├── apps/
│   ├── studio/          # Next.js 14 — Developer Studio UI
│   └── api/             # Fastify — Runtime API Server
├── packages/
│   ├── config-schema/   # Zod validation schemas
│   ├── design-tokens/   # Theme tokens & CSS variables
│   ├── types/           # Shared TypeScript interfaces
│   └── shared/          # Common utilities
├── docker-compose.yml   # PostgreSQL, Redis, MinIO, Meilisearch
└── turbo.json           # Turborepo config
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm or pnpm

### Setup

```bash
# 1. Clone and install
git clone https://github.com/your-org/metaforge.git
cd metaforge
npm install

# 2. Start infrastructure
docker compose up -d

# 3. Configure environment
cp .env.example .env

# 4. Push database schema
cd apps/api
npm run db:push
npm run db:seed

# 5. Start development
cd ../..
npm run dev
```

The Studio will be available at `http://localhost:3000` and the API at `http://localhost:3001`.

## 📱 Studio Pages

| Page | Description |
|------|-------------|
| **Dashboard** | App management with sidebar, stats, activity feed |
| **Templates** | 8 production-ready starter configs |
| **API Explorer** | Interactive endpoint testing with live fetch |
| **Analytics** | Request charts, top apps, response status |
| **Docs** | Field types reference, component registry |
| **Config Editor** | Monaco Editor with live JSON validation |
| **Live Preview** | Real-time UI rendering from config |
| **Data Manager** | CRUD table with CSV import/export |
| **Auth Config** | Multi-provider toggles + RBAC matrix |
| **Workflows** | Pipeline cards + execution log |
| **Settings** | Theme, integrations, danger zone |

## ⚡ API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | Health check |
| `GET` | `/api/v1/apps` | List all apps |
| `POST` | `/api/v1/apps` | Create app |
| `PUT` | `/api/v1/apps/:id/config` | Update config |
| `POST` | `/api/v1/deploy` | Full deploy pipeline |
| `POST` | `/api/v1/export` | Generate standalone project |
| `GET` | `/api/v1/notifications` | Get notifications |
| `GET` | `/api/:tenant/:entity` | Auto-generated CRUD |

## 🎯 Config Example

```json
{
  "app": { "name": "Task Manager" },
  "entities": [
    {
      "name": "tasks",
      "fields": [
        { "name": "title", "type": "string", "required": true },
        { "name": "status", "type": "enum", "enumValues": ["todo", "doing", "done"] },
        { "name": "assignee", "type": "email" }
      ]
    }
  ],
  "pages": [
    {
      "name": "Board",
      "path": "/",
      "components": [
        { "type": "kanban", "dataSource": { "entity": "tasks" } }
      ]
    }
  ],
  "auth": {
    "enabled": true,
    "providers": [{ "type": "google", "enabled": true }],
    "roles": [
      { "name": "admin", "permissions": ["tasks:*"] },
      { "name": "member", "permissions": ["tasks:read", "tasks:write"] }
    ]
  }
}
```

## 🧰 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TailwindCSS 4, Monaco Editor |
| **Backend** | Fastify 4, Prisma 5, BullMQ |
| **Database** | PostgreSQL 16 |
| **Cache/Queue** | Redis 7 |
| **Storage** | MinIO (S3-compatible) |
| **Search** | Meilisearch |
| **Monorepo** | Turborepo |
| **Validation** | Zod |

## 📁 Database Models

| Model | Purpose |
|-------|---------|
| `User` | Platform accounts with roles |
| `App` | Application manifests |
| `ConfigVersion` | Config change history |
| `Deploy` | Deployment records with stage tracking |
| `ApiKey` | Scoped API keys |
| `WorkflowExecution` | Workflow run logs |
| `Notification` | In-app notifications |

## 🔧 Available Scripts

```bash
# Root (Turborepo)
npm run dev          # Start all apps in development
npm run build        # Build all apps

# Studio (apps/studio)
npm run dev          # Start Next.js dev server on :3000

# API (apps/api)
npm run dev          # Start Fastify dev server on :3001
npm run db:push      # Push Prisma schema to database
npm run db:seed      # Seed demo data
npm run db:studio    # Open Prisma Studio GUI
npm run db:migrate   # Run migrations
```

## 📝 License

MIT © MetaForge Contributors
